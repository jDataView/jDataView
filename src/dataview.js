
(function () {

var compatibility = {
	ArrayBuffer: typeof ArrayBuffer !== 'undefined',
	DataView: typeof DataView !== 'undefined'
}

var cDataView = function (buffer, byteOffset, byteLength) {
	this._buffer = buffer;

	// Handle Type Errors
	if (!(compatibility.ArrayBuffer && buffer instanceof ArrayBuffer) &&
		!(typeof buffer === 'string')) {
		throw new TypeError("Type error");
	}

	// Check parameters and existing functionnalities
	this._isArrayBuffer = compatibility.ArrayBuffer && buffer instanceof ArrayBuffer;
	this._isDataView = compatibility.DataView && this._isArrayBuffer;

	// Default Values
	var bufferLength = this._isArrayBuffer ? buffer.byteLength : buffer.length;
	if (byteOffset == undefined) {
		byteOffset = 0;
	}

	if (byteLength == undefined) {
		byteLength = bufferLength - byteOffset;
	}

	if (!this._isDataView) {
		// Do additional checks to simulate DataView
		if (typeof byteOffset !== 'number') {
			throw new TypeError("Type error");
		}
		if (typeof byteLength !== 'number') {
			throw new TypeError("Type error");
		}
		if (typeof byteOffset < 0) {
			throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
		}
		if (typeof byteLength < 0) {
			throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
		}
	}

	// Instanciate
	if (this._isDataView) {
		this._view = new DataView(buffer, byteOffset, byteLength);
		this._start = 0;
	}
	else {
		this._start = byteOffset;
		if (this._end >= bufferLength) {
			throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
		}
	}
	this._offset = 0;
	this._length = byteLength;
};


cDataView.prototype = {

	// Helpers

	getString: function (byteOffset, length) {
		var value;

		// Handle the lack of byteOffset
		if (byteOffset === undefined) {
			var byteOffset = this._offset;
		}

		// Error Checking
		if (typeof byteOffset !== 'number') {
			throw new TypeError("Type error");
		}
		if (length < 0 || byteOffset + length >= this._length) {
			throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
		}

		if (this._isArrayBuffer) {
			// Use Int8Array and String.fromCharCode to extract a string
			var int8array = new Int8Array(this._buffer, byteOffset, length);
			var stringarray = [];
			for (var i = 0; i < length; ++i) {
				stringarray[i] = int8array[i];
			}
			value = String.fromCharCode.apply(null, stringarray);
		} else {
			value = this._buffer.substr(this._start + byteOffset, length);
		}

		this._offset = byteOffset + length;
		return value;
	},

	getChar: function (byteOffset) {
		var value, size = 1;

		// Handle the lack of byteOffset
		if (byteOffset === undefined) {
			var byteOffset = this._offset;
		}

		if (this._isDataView) {
			// Use Int8Array and String.fromCharCode to extract a string
			value = String.fromCharCode(this.getUint8(byteOffset));
		} else {
			// Error Checking
			if (typeof byteOffset !== 'number') {
				throw new TypeError("Type error");
			}
			if (length < 0 || byteOffset + size >= this._length) {
				throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
			}

			value = this._buffer.charAt(this._start + byteOffset);
			this._offset = byteOffset + size;
		}

		return value;
	},

	tell: function () {
		return this._offset;
	},
	
	seek: function (byteOffset) {
		if (typeof byteOffset !== 'number') {
			throw new TypeError("Type error");
		}
		if (byteOffset < 0 || byteOffset >= this._length) {
			throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
		}

		this._offset = byteOffset;
	},

	// Compatibility functions on a String Buffer

	_endianness: function (offset, pos, max, littleEndian) {
		return offset + (littleEndian ? max - pos - 1 : pos);
	},

	_getFloat64: function (offset, littleEndian) {
		var b0 = this._getUint8(this._endianness(offset, 0, 8, littleEndian)),
			b1 = this._getUint8(this._endianness(offset, 1, 8, littleEndian)),
			b2 = this._getUint8(this._endianness(offset, 2, 8, littleEndian)),
			b3 = this._getUint8(this._endianness(offset, 3, 8, littleEndian)),
			b4 = this._getUint8(this._endianness(offset, 4, 8, littleEndian)),
			b5 = this._getUint8(this._endianness(offset, 5, 8, littleEndian)),
			b6 = this._getUint8(this._endianness(offset, 6, 8, littleEndian)),
			b7 = this._getUint8(this._endianness(offset, 7, 8, littleEndian)),

			sign = 1 - (2 * (b0 >> 7)),
			exponent = ((((b0 << 1) & 0xff) << 3) | (b1 >> 4)) - (Math.pow(2, 10) - 1),

		// Binary operators such as | and << operate on 32 bit values, using + and Math.pow(2) instead
			mantissa = ((b1 & 0x0f) * Math.pow(2, 48)) + (b2 * Math.pow(2, 40)) + (b3 * Math.pow(2, 32))
					+ (b4 * Math.pow(2, 24)) + (b5 * Math.pow(2, 16)) + (b6 * Math.pow(2, 8)) + b7;

		if (mantissa == 0 && exponent == -(Math.pow(2, 10) - 1))
			return 0.0;

		return sign * (1 + mantissa * Math.pow(2, -52)) * Math.pow(2, exponent);
	},

	_getFloat32: function (offset, littleEndian) {
		var b0 = this._getUint8(this._endianness(offset, 0, 4, littleEndian)),
			b1 = this._getUint8(this._endianness(offset, 1, 4, littleEndian)),
			b2 = this._getUint8(this._endianness(offset, 2, 4, littleEndian)),
			b3 = this._getUint8(this._endianness(offset, 3, 4, littleEndian)),

			sign = 1 - (2 * (b0 >> 7)),
			exponent = (((b0 << 1) & 0xff) | (b1 >> 7)) - 127,
			mantissa = ((b1 & 0x7f) << 16) | (b2 << 8) | b3;

		if (mantissa == 0 && exponent == -127)
			return 0.0;

		return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
	},

	_getInt32: function (offset) {
		var b = this._getUint8(offset);
		return b > Math.pow(2, 31) - 1 ? b - Math.pow(2, 32) : b;
	},

	_getUint32: function (offset, littleEndian) {
		var b3 = this._getUint8(this._endianness(offset, 0, 4, littleEndian)),
			b2 = this._getUint8(this._endianness(offset, 1, 4, littleEndian)),
			b1 = this._getUint8(this._endianness(offset, 2, 4, littleEndian)),
			b0 = this._getUint8(this._endianness(offset, 3, 4, littleEndian));

		return (b3 << 24) + (b2 << 16) + (b1 << 8) + b0;
	},

	_getInt16: function (offset) {
		var b = this._getUint8(offset);
		return b > Math.pow(2, 15) - 1 ? b - Math.pow(2, 16) : b;
	},

	_getUint16: function (offset, littleEndian) {
		var b1 = this._getUint8(this._endianness(offset, 0, 2, littleEndian)),
			b0 = this._getUint8(this._endianness(offset, 1, 2, littleEndian));

		return (b1 << 8) + b0;
	},

	_getInt8: function (offset) {
		var b = this._getUint8(offset);
		return b > Math.pow(2, 7) - 1 ? b - Math.pow(2, 8) : b;
	},

	_getUint8: function (offset) {
		return this._buffer.charCodeAt(offset) & 0xff;
	}
};

// Create wrappers

var dataTypes = {
	'Int8': 1,
	'Int16': 2,
	'Int32': 4,
	'Uint8': 1,
	'Uint16': 2,
	'Uint32': 4,
	'Float32': 4,
	'Float64': 8
};

for (var type in dataTypes) {
	// Bind the variable type
	(function (type) {
		var size = dataTypes[type];

		// Create the function
		cDataView.prototype['get' + type] = 
			function (byteOffset, littleEndian) {
				var value;

				// Handle the lack of byteOffset
				if (byteOffset === undefined) {
					var byteOffset = this._offset;
				}

				// Dispatch on the good method
				if (this._isDataView) {
					value = this._view['get' + type](byteOffset, littleEndian);
				}
				else {
					// Error Checking
					if (typeof byteOffset !== 'number') {
						throw new TypeError("Type error");
					}
					if (byteOffset + size >= this._length) {
						throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
					}

					value = this['_get' + type](this._start + byteOffset, littleEndian);
				}

				// Move the internal offset forward
				this._offset = byteOffset + size;

				return value;
			};
	})(type);
}

window.cDataView = cDataView;

})();
