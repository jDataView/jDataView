import { getCharCodes, wrapBuffer, arrayFrom, defined } from "./helpers";


/**
 * Type aliases
 * @typedef {Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array|BigInt64Array|BigUint64Array} TypedArray
 * @typedef {string|number|ArrayBuffer|TypedArray} BufferIsh
*/

export class jDataView {
	/**
	 * jDataView
	 * TODO: Write docstring
	 * @param {BufferIsh} buffer 
	 * @param {number} byteOffset 
	 * @param {number} byteLength 
	 * @param {boolean} littleEndian 
	 */
	constructor(
		buffer,
		byteOffset,
		byteLength,
		littleEndian
	) {
		this.jDataView = this;

		if (jDataView.is(buffer)) {
			const result = buffer.slice(byteOffset, byteOffset + byteLength);
			result._littleEndian = defined(littleEndian, result._littleEndian);
			return result;
		}

		if (!jDataView.is(this)) {
			return new jDataView(buffer, byteOffset, byteLength, littleEndian);
		}

		this.buffer = wrapBuffer(buffer);


		this.byteOffset = defined(byteOffset, 0);
		this.byteLength = defined(byteLength, this.buffer.byteLength - this.byteOffset);

		this.dataView = new DataView(this.buffer, this.byteOffset, this.byteLength);


		this._littleEndian = !!littleEndian;

		this._offset = this._bitOffset = 0;
	}




	static is(view) {
		return view && view.jDataView;
	}

	/**
	 * @param {BufferIsh} data
	 */
	static from(...data) {
		return new jDataView(data);
	}


	_checkBounds(byteOffset, byteLength, maxLength) {
		// Do additional checks to simulate DataView
		if (typeof byteOffset !== 'number') {
			throw new TypeError('Offset is not a number.');
		}
		if (typeof byteLength !== 'number') {
			throw new TypeError('Size is not a number.');
		}
		if (byteLength < 0) {
			throw new RangeError('Length is negative.');
		}
		if (
			byteOffset < 0 ||
			byteOffset + byteLength > defined(maxLength, this.byteLength)
		) {
			throw new RangeError('Offsets are out of bounds.');
		}
	}



	// Helpers

	_getBytes(length, byteOffset, littleEndian) {
		littleEndian = defined(littleEndian, this._littleEndian);
		byteOffset = defined(byteOffset, this._offset);
		length = defined(length, this.byteLength - byteOffset);

		this._checkBounds(byteOffset, length);

		byteOffset += this.byteOffset;

		this._offset = byteOffset - this.byteOffset + length;

		const result = new Uint8Array(this.buffer, byteOffset, length)

		return littleEndian || length <= 1 ? result : arrayFrom(result).reverse();
	}

	// wrapper for external calls (do not return inner buffer directly to prevent it's modifying)
	getBytes(length, byteOffset, littleEndian, toArray) {
		const result = this._getBytes(
			length,
			byteOffset,
			defined(littleEndian, true)
		);
		return toArray ? arrayFrom(result) : result;
	}

	_setBytes(byteOffset, bytes, littleEndian) {
		const length = bytes.length;

		// needed for Opera
		if (length === 0) {
			return;
		}

		littleEndian = defined(littleEndian, this._littleEndian);
		byteOffset = defined(byteOffset, this._offset);

		this._checkBounds(byteOffset, length);

		if (!littleEndian && length > 1) {
			bytes = arrayFrom(bytes, true).reverse();
		}

		byteOffset += this.byteOffset;

		new Uint8Array(this.buffer, byteOffset, length).set(bytes);


		this._offset = byteOffset - this.byteOffset + length;
	}

	setBytes(byteOffset, bytes, littleEndian) {
		this._setBytes(byteOffset, bytes, defined(littleEndian, true));
	}

	getString(byteLength, byteOffset, encoding) {
		const bytes = this._getBytes(byteLength, byteOffset, true);
		// backward-compatibility
		encoding = encoding === 'utf8' ? 'utf-8' : encoding || 'binary';
		if (TextDecoder && encoding !== 'binary') {
			return new TextDecoder(encoding).decode(bytes);
		}
		let string = '';
		byteLength = bytes.length;
		for (let i = 0; i < byteLength; i++) {
			string += String.fromCharCode(bytes[i]);
		}
		if (encoding === 'utf-8') {
			string = decodeURIComponent(escape(string));
		}
		return string;
	}

	setString(byteOffset, subString, encoding) {
		// backward-compatibility
		encoding = encoding === 'utf8' ? 'utf-8' : encoding || 'binary';
		let bytes;
		if (TextEncoder && encoding !== 'binary') {
			bytes = new TextEncoder(encoding).encode(subString);
		} else {
			if (encoding === 'utf-8') {
				subString = unescape(encodeURIComponent(subString));
			}
			bytes = getCharCodes(subString);
		}
		this._setBytes(byteOffset, bytes, true);
	}

	getChar(byteOffset) {
		return this.getString(1, byteOffset);
	}

	setChar(byteOffset, character) {
		this.setString(byteOffset, character);
	}

	tell() {
		return this._offset;
	}

	seek(byteOffset) {
		this._checkBounds(byteOffset, 0);
		return (this._offset = byteOffset);
	}

	skip(byteLength) {
		return this.seek(this._offset + byteLength);
	}

	slice(start, end, forceCopy) {
		function normalizeOffset(offset, byteLength) {
			return offset < 0 ? offset + byteLength : offset;
		}

		start = normalizeOffset(start, this.byteLength);
		end = normalizeOffset(defined(end, this.byteLength), this.byteLength);

		return forceCopy
			? new jDataView(
				this.getBytes(end - start, start, true, true),
				undefined,
				undefined,
				this._littleEndian
			)
			: new jDataView(
				this.buffer,
				this.byteOffset + start,
				end - start,
				this._littleEndian
			);
	}

	alignBy(byteCount) {
		this._bitOffset = 0;
		if (defined(byteCount, 1) !== 1) {
			return this.skip(byteCount - (this._offset % byteCount || byteCount));
		} else {
			return this._offset;
		}
	}

	_getBitRangeData(bitLength, byteOffset) {
		const startBit = (defined(byteOffset, this._offset) << 3) + this._bitOffset;
		const endBit = startBit + bitLength;
		const start = startBit >>> 3;
		const end = (endBit + 7) >>> 3;

		const bytes = this._getBytes(end - start, start, true);
		let wideValue = 0;

		if ((this._bitOffset = endBit & 7)) {
			this._bitOffset -= 8;
		}

		for (let i = 0, length = bytes.length; i < length; i++) {
			wideValue = (wideValue << 8) | bytes[i];
		}

		return {
			start,
			bytes,
			wideValue
		};
	}

	getSigned(bitLength, byteOffset) {
		const shift = 32 - bitLength;
		return this.getUnsigned(bitLength, byteOffset) << shift >> shift;
	}

	getUnsigned(bitLength, byteOffset) {
		const value =
			this._getBitRangeData(bitLength, byteOffset).wideValue >>>
			-this._bitOffset;
		return bitLength < 32 ? value & ~(-1 << bitLength) : value;
	}


	setUnsigned(byteOffset, value, bitLength) {
		const data = this._getBitRangeData(bitLength, byteOffset);
		const b = data.bytes;
		let wideValue = data.wideValue;

		wideValue &= ~(~(-1 << bitLength) << -this._bitOffset); // clearing bit range before binary "or"
		wideValue |=
			(bitLength < 32 ? value & ~(-1 << bitLength) : value) << -this._bitOffset; // setting bits

		for (let i = b.length - 1; i >= 0; i--) {
			b[i] = wideValue & 0xff;
			wideValue >>>= 8;
		}

		this._setBytes(data.start, b, true);
	}

	setSigned(...args) {
		return this.setUnsigned(...args);
	}

}

const builtInTypes = [
	"Float64", "Float32",
	"BigInt64", "BigUint64",
	"Int32", "Uint32",
	"Int16", "Uint16",
	"Int8", "Uint8"
];
// Encapsulate all the built-in methods
for (const type of builtInTypes) {
	// Getters
	jDataView.prototype["get" + type] = function (byteOffset, littleEndian) {
		littleEndian = defined(littleEndian, this._littleEndian);
		return this.dataView["get" + type](byteOffset, littleEndian);
	}

	// Setters
	jDataView.prototype["set" + type] = function (byteOffset, value, littleEndian) {
		littleEndian = defined(littleEndian, this._littleEndian);
		return this.dataView["set" + type](byteOffset, value, littleEndian);
	}
}
const supportedTypes = [
	...builtInTypes,
	"Signed", "Unsigned",
	"String", "Char",
	"Bytes"
]
// Add the the writeXXX shorthand methods
for (const type of supportedTypes) {
	jDataView.prototype["write" + type] = function (value, littleEndian) {
		return this["set" + type].call(this, undefined, value, littleEndian);
	}
}

export default jDataView;