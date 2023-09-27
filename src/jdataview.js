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
			result.littleEndian = defined(littleEndian, result.littleEndian);
			return result;
		}

		if (!jDataView.is(this)) {
			return new jDataView(buffer, byteOffset, byteLength, littleEndian);
		}

		/**
		* buffer is the internal `ArrayBuffer` that jDataView is a 'view' on
		* @type {ArrayBuffer}
		* @public
		*/
		this.buffer = wrapBuffer(buffer); // Convert strings, arrays, etc to `ArrayBuffer`s

		/**
		* The offset in bytes from the start of the ArrayBuffer.
		* Operations work relative to this number.
		* @type {number}
		* @public
		*/
		this.byteOffset = defined(byteOffset, 0);
		this.byteLength = defined(byteLength, this.buffer.byteLength - this.byteOffset);

		/**
		* The internal `DataView` that powers all the default operations like `getUint8()`
		* @type {DataView}
		* @private
		* @readonly
		*/
		this._dataView = new DataView(this.buffer, this.byteOffset, this.byteLength);

		/**
		* Weather this jDataView should default to littleEndian for number operations
		* @type {boolean}
		* @public
		* @readonly
		*/
		this.littleEndian = !!littleEndian;

		this._offset = this._bitOffset = 0;
	}




	static is(view) {
		return view && view.jDataView;
	}

	/**
	 * Constructs a new jDataView from the provided data
	 * @param {BufferIsh} data
	 */
	static from(...data) {
		return new jDataView(data.flat(Infinity));
	}


	#checkBounds(byteOffset, byteLength, maxLength) {
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

	#getBytes(length, byteOffset, littleEndian) {
		littleEndian = defined(littleEndian, this.littleEndian);
		byteOffset = defined(byteOffset, this._offset);
		length = defined(length, this.byteLength - byteOffset);

		this.#checkBounds(byteOffset, length);

		byteOffset += this.byteOffset;

		this._offset = byteOffset - this.byteOffset + length;

		const result = new Uint8Array(this.buffer, byteOffset, length)

		return littleEndian || length <= 1 ? result : arrayFrom(result).reverse();
	}

	/**
	 * Get raw bytes
	 * @param {length} [length=]
	 * @param {number} [byteOffset=]
	 * @param {boolean} [littleEndian=true] 
	 * @param {boolean} [toArray=false] @default
	 * @returns {Uint8Array | number[]}
	 */
	getBytes(length, byteOffset, littleEndian, toArray) {
		const result = this.#getBytes(
			length,
			byteOffset,
			defined(littleEndian, true)
		);
		return toArray ? arrayFrom(result) : result;
	}

	#setBytes(byteOffset, bytes, littleEndian) {
		const length = bytes.length;

		// needed for Opera
		if (length === 0) {
			return;
		}

		littleEndian = defined(littleEndian, this.littleEndian);
		byteOffset = defined(byteOffset, this._offset);

		this.#checkBounds(byteOffset, length);

		if (!littleEndian && length > 1) {
			bytes = arrayFrom(bytes, true).reverse();
		}

		byteOffset += this.byteOffset;

		new Uint8Array(this.buffer, byteOffset, length).set(bytes);


		this._offset = byteOffset - this.byteOffset + length;
	}

	setBytes(byteOffset, bytes, littleEndian) {
		this.#setBytes(byteOffset, bytes, defined(littleEndian, true));
	}

	/**
	 * Read a string
	 * @param {length} [length=]
	 * @param {number} [byteOffset=]
	 * @param {string} [encoding=binary] 
	 * @returns {string}
	 */
	getString(byteLength, byteOffset, encoding) {
		const bytes = this.#getBytes(byteLength, byteOffset, true);
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

	/**
	 * Set a string. Uses big endian to store the bytes
	 * @param {length} [length=]
	 * @param {number} [byteOffset=]
	 * @param {string} [encoding=binary] 
	 */
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
		this.#setBytes(byteOffset, bytes, true);
	}

	/**
	 * Get a single character.
	 * This is the same as getting a 1-length string using binary encoding
	 * @param {length} [length=]
	 * @param {number} [byteOffset=]
	 * @returns {string}
	 */
	getChar(byteOffset) {
		return this.getString(1, byteOffset);
	}

	/**
	 * Set a single character.
	 * This is the same as setting a 1-length string using binary encoding
	 * @param {number} [length=]
	 * @param {number} [byteOffset=]
	 */
	setChar(byteOffset, character) {
		this.setString(byteOffset, character);
	}

	/**
	 * Get the current pointer position
	 * @returns {number}
	 */
	tell() {
		return this._offset;
	}

	/**
	 * Move the current pointer position to `byteOffset`
	 * @param {number} byteOffset
	 * @returns {number}
	 */
	seek(byteOffset) {
		this.#checkBounds(byteOffset, 0);
		return (this._offset = byteOffset);
	}

	/**
	 * Move the current pointer position forward by `byteOffset`
	 * @param {number} byteOffset
	 * @returns {number}
	 */
	skip(byteLength) {
		return this.seek(this._offset + byteLength);
	}

	/**
	 * Returns a new `jDataView` instance between `start` and `end`, optionally duplicating all the contained data in memory.  
	 * @param {number} start 
	 * @param {number} end 
	 * @param {boolean} [forceCopy=false] 
	 * @returns {jDataView}
	 */
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
				this.littleEndian
			)
			: new jDataView(
				this.buffer,
				this.byteOffset + start,
				end - start,
				this.littleEndian
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

	#getBitRangeData(bitLength, byteOffset) {
		const startBit = (defined(byteOffset, this._offset) << 3) + this._bitOffset;
		const endBit = startBit + bitLength;
		const start = startBit >>> 3;
		const end = (endBit + 7) >>> 3;

		const bytes = this.#getBytes(end - start, start, true);
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
			this.#getBitRangeData(bitLength, byteOffset).wideValue >>>
			-this._bitOffset;
		return bitLength < 32 ? value & ~(-1 << bitLength) : value;
	}


	setUnsigned(byteOffset, value, bitLength) {
		const data = this.#getBitRangeData(bitLength, byteOffset);
		const b = data.bytes;
		let wideValue = data.wideValue;

		wideValue &= ~(~(-1 << bitLength) << -this._bitOffset); // clearing bit range before binary "or"
		wideValue |=
			(bitLength < 32 ? value & ~(-1 << bitLength) : value) << -this._bitOffset; // setting bits

		for (let i = b.length - 1; i >= 0; i--) {
			b[i] = wideValue & 0xff;
			wideValue >>>= 8;
		}

		this.#setBytes(data.start, b, true);
	}

	setSigned(byteOffset, value, bitLength) {
		return this.setUnsigned(byteOffset, value, bitLength);
	}

}

const builtInTypeBytes = {
	"Float64": 8, "Float32": 4,
	"BigInt64": 8, "BigUint64": 8,
	"Int32": 4, "Uint32": 4,
	"Int16": 2, "Uint16": 2,
	"Int8": 1, "Uint8": 1
};
// Encapsulate all the built-in methods
for (const type in builtInTypeBytes) {
	const typeByteLength = builtInTypeBytes[type];
	// Getters
	jDataView.prototype["get" + type] = function (byteOffset, littleEndian) {
		littleEndian = defined(littleEndian, this.littleEndian);
		byteOffset = defined(byteOffset, this._offset);

		// Move pointer forwards
		this._offset = byteOffset + typeByteLength;

		return this._dataView["get" + type](byteOffset, littleEndian);
	}

	// Setters
	jDataView.prototype["set" + type] = function (byteOffset, value, littleEndian) {
		littleEndian = defined(littleEndian, this.littleEndian);
		byteOffset = defined(byteOffset, this._offset);

		// Move pointer forwards
		this._offset = byteOffset + typeByteLength;

		return this._dataView["set" + type](byteOffset, value, littleEndian);
	}
}
const supportedTypes = [
	...Object.keys(builtInTypeBytes),
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