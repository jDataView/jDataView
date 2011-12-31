//
// jDataView by Vjeux - Jan 2010
//
// A unique way to read a binary file in the browser
// http://github.com/vjeux/jDataView
// http://blog.vjeux.com/ <vjeuxx@gmail.com>
//

(function (global) {

var compatibility = {
	ArrayBuffer: typeof ArrayBuffer !== 'undefined',
	DataView: typeof DataView !== 'undefined' && 'getFloat64' in DataView.prototype,
	NodeBuffer: typeof Buffer !== 'undefined',
// 0.6.0 -> readInt8LE(offset)
	NodeBufferFull: typeof Buffer !== 'undefined' && 'readInt8LE' in Buffer,
// 0.5.0 -> readInt8(offset, endian)
	NodeBufferEndian: typeof Buffer !== 'undefined' && 'readInt8' in Buffer
};

var jDataView = function (buffer, byteOffset, byteLength, littleEndian) {
	if (!(this instanceof arguments.callee)) {
		throw new Error("Constructor may not be called as a function");
	}

	this.buffer = buffer;

	// Handle Type Errors
	if (!(compatibility.NodeBuffer && buffer instanceof Buffer) &&
		!(compatibility.ArrayBuffer && buffer instanceof ArrayBuffer) &&
		typeof buffer !== 'string') {
		throw new TypeError('Type error');
	}

	// Check parameters and existing functionnalities
	this._isArrayBuffer = compatibility.ArrayBuffer && buffer instanceof ArrayBuffer;
	this._isDataView = compatibility.DataView && this._isArrayBuffer;
	this._isNodeBuffer = compatibility.NodeBuffer && buffer instanceof Buffer;

	// Default Values
	this._littleEndian = littleEndian === undefined ? true : littleEndian;

	var bufferLength = this._isArrayBuffer ? buffer.byteLength : buffer.length;
	if (byteOffset === undefined) {
		byteOffset = 0;
	}
	this.byteOffset = byteOffset;

	if (byteLength === undefined) {
		byteLength = bufferLength - byteOffset;
	}
	this.byteLength = byteLength;

	if (!this._isDataView) {
		// Do additional checks to simulate DataView
		if (typeof byteOffset !== 'number') {
			throw new TypeError('Type error');
		}
		if (typeof byteLength !== 'number') {
			throw new TypeError('Type error');
		}
		if (typeof byteOffset < 0) {
			throw new Error('INDEX_SIZE_ERR: DOM Exception 1');
		}
		if (typeof byteLength < 0) {
			throw new Error('INDEX_SIZE_ERR: DOM Exception 1');
		}
	}

	// Instanciate
	if (this._isDataView) {
		this._view = new DataView(buffer, byteOffset, byteLength);
		this._start = 0;
	}
	this._start = byteOffset;
	if (byteOffset + byteLength > bufferLength) {
		throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
	}

	this._offset = 0;
};

jDataView.createBuffer = function () {
	if (compatibility.NodeBuffer) {
		var buffer = new Buffer(arguments.length);
		for (var i = 0; i < arguments.length; ++i) {
			buffer[i] = arguments[i];
		}
		return buffer;
	}
	if (compatibility.ArrayBuffer) {
		var buffer = new ArrayBuffer(arguments.length);
		var view = new Int8Array(buffer);
		for (var i = 0; i < arguments.length; ++i) {
			view[i] = arguments[i];
		}
		return buffer;
	}

	return String.fromCharCode.apply(null, arguments);
};

jDataView.prototype = {

	// Helpers

	getString: function (length, byteOffset) {
		var value;

		// Handle the lack of byteOffset
		if (byteOffset === undefined) {
			byteOffset = this._offset;
		}

		// Error Checking
		if (typeof byteOffset !== 'number') {
			throw new TypeError('Type error');
		}
		if (length < 0 || byteOffset + length > this.byteLength) {
			throw new Error('INDEX_SIZE_ERR: DOM Exception 1');
		}

		if (this._isNodeBuffer) {
			value = this.buffer.toString('ascii', this._start + byteOffset, this._start + byteOffset + length);
		}
		else {
			value = '';
			for (var i = 0; i < length; ++i) {
				var char = this.getUint8(byteOffset + i);
				value += String.fromCharCode(char > 127 ? 65533 : char);
			}
		}

		this._offset = byteOffset + length;
		return value;
	},

	getChar: function (byteOffset) {
		return this.getString(1, byteOffset);
	},

	tell: function () {
		return this._offset;
	},

	seek: function (byteOffset) {
		if (typeof byteOffset !== 'number') {
			throw new TypeError('Type error');
		}
		if (byteOffset < 0 || byteOffset > this.byteLength) {
			throw new Error('INDEX_SIZE_ERR: DOM Exception 1');
		}

		return this._offset = byteOffset;
	},

	// Compatibility functions on a String Buffer

	_endianness: function (byteOffset, pos, max, littleEndian) {
		return byteOffset + (littleEndian ? max - pos - 1 : pos);
	},

	_getFloat64: function (byteOffset, littleEndian) {
		var b0 = this._getUint8(this._endianness(byteOffset, 0, 8, littleEndian)),
			b1 = this._getUint8(this._endianness(byteOffset, 1, 8, littleEndian)),
			b2 = this._getUint8(this._endianness(byteOffset, 2, 8, littleEndian)),
			b3 = this._getUint8(this._endianness(byteOffset, 3, 8, littleEndian)),
			b4 = this._getUint8(this._endianness(byteOffset, 4, 8, littleEndian)),
			b5 = this._getUint8(this._endianness(byteOffset, 5, 8, littleEndian)),
			b6 = this._getUint8(this._endianness(byteOffset, 6, 8, littleEndian)),
			b7 = this._getUint8(this._endianness(byteOffset, 7, 8, littleEndian)),

			sign = 1 - (2 * (b0 >> 7)),
			exponent = ((((b0 << 1) & 0xff) << 3) | (b1 >> 4)) - (Math.pow(2, 10) - 1),

		// Binary operators such as | and << operate on 32 bit values, using + and Math.pow(2) instead
			mantissa = ((b1 & 0x0f) * Math.pow(2, 48)) + (b2 * Math.pow(2, 40)) + (b3 * Math.pow(2, 32)) +
						(b4 * Math.pow(2, 24)) + (b5 * Math.pow(2, 16)) + (b6 * Math.pow(2, 8)) + b7;

		if (exponent === 1024) {
			if (mantissa !== 0) {
				return NaN;
			} else {
				return sign * Infinity;
			}
		}

		if (exponent === -1023) { // Denormalized
			return sign * mantissa * Math.pow(2, -1022 - 52);
		}

		return sign * (1 + mantissa * Math.pow(2, -52)) * Math.pow(2, exponent);
	},

	_getFloat32: function (byteOffset, littleEndian) {
		var b0 = this._getUint8(this._endianness(byteOffset, 0, 4, littleEndian)),
			b1 = this._getUint8(this._endianness(byteOffset, 1, 4, littleEndian)),
			b2 = this._getUint8(this._endianness(byteOffset, 2, 4, littleEndian)),
			b3 = this._getUint8(this._endianness(byteOffset, 3, 4, littleEndian)),

			sign = 1 - (2 * (b0 >> 7)),
			exponent = (((b0 << 1) & 0xff) | (b1 >> 7)) - 127,
			mantissa = ((b1 & 0x7f) << 16) | (b2 << 8) | b3;

		if (exponent === 128) {
			if (mantissa !== 0) {
				return NaN;
			} else {
				return sign * Infinity;
			}
		}

		if (exponent === -127) { // Denormalized
			return sign * mantissa * Math.pow(2, -126 - 23);
		}

		return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
	},

	_getInt32: function (byteOffset, littleEndian) {
		var b = this._getUint32(byteOffset, littleEndian);
		return b > Math.pow(2, 31) - 1 ? b - Math.pow(2, 32) : b;
	},

	_getUint32: function (byteOffset, littleEndian) {
		var b3 = this._getUint8(this._endianness(byteOffset, 0, 4, littleEndian)),
			b2 = this._getUint8(this._endianness(byteOffset, 1, 4, littleEndian)),
			b1 = this._getUint8(this._endianness(byteOffset, 2, 4, littleEndian)),
			b0 = this._getUint8(this._endianness(byteOffset, 3, 4, littleEndian));

		return (b3 * Math.pow(2, 24)) + (b2 << 16) + (b1 << 8) + b0;
	},

	_getInt16: function (byteOffset, littleEndian) {
		var b = this._getUint16(byteOffset, littleEndian);
		return b > Math.pow(2, 15) - 1 ? b - Math.pow(2, 16) : b;
	},

	_getUint16: function (byteOffset, littleEndian) {
		var b1 = this._getUint8(this._endianness(byteOffset, 0, 2, littleEndian)),
			b0 = this._getUint8(this._endianness(byteOffset, 1, 2, littleEndian));

		return (b1 << 8) + b0;
	},

	_getInt8: function (byteOffset) {
		var b = this._getUint8(byteOffset);
		return b > Math.pow(2, 7) - 1 ? b - Math.pow(2, 8) : b;
	},

	_getUint8: function (byteOffset) {
		if (this._isArrayBuffer) {
			return new Uint8Array(this.buffer, byteOffset, 1)[0];
		}
		else if (this._isNodeBuffer) {
			return this.buffer[byteOffset];
		} else {
			return this.buffer.charCodeAt(byteOffset) & 0xff;
		}
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
var nodeNaming = {
	'Int8': 'Int8',
	'Int16': 'Int16',
	'Int32': 'Int32',
	'Uint8': 'UInt8',
	'Uint16': 'UInt16',
	'Uint32': 'UInt32',
	'Float32': 'Float',
	'Float64': 'Double'
};

for (var type in dataTypes) {
	if (!dataTypes.hasOwnProperty(type)) {
		continue;
	}

	// Bind the variable type
	(function (type) {
		var size = dataTypes[type];

		// Create the function
		jDataView.prototype['get' + type] =
			function (byteOffset, littleEndian) {
				var value;

				// Handle the lack of endianness
				if (littleEndian === undefined) {
					littleEndian = this._littleEndian;
				}

				// Handle the lack of byteOffset
				if (byteOffset === undefined) {
					byteOffset = this._offset;
				}

				// Dispatch on the good method
				if (this._isDataView) {
					// DataView: we use the direct method
					value = this._view['get' + type](byteOffset, littleEndian);
				}
				// ArrayBuffer: we use a typed array of size 1 if the alignment is good
				// ArrayBuffer does not support endianess flag (for size > 1)
				else if (this._isArrayBuffer && (this._start + byteOffset) % size === 0 && (size === 1 || littleEndian)) {
					value = new global[type + 'Array'](this.buffer, this._start + byteOffset, 1)[0];
				}
				// NodeJS Buffer
				else if (this._isNodeBuffer && compatibility.NodeBufferFull) {
					if (littleEndian) {
						value = this.buffer['read' + nodeNaming[type] + 'LE'](this._start + byteOffset);
					} else {
						value = this.buffer['read' + nodeNaming[type] + 'BE'](this._start + byteOffset);
					}
				} else if (this._isNodeBuffer && compatibility.NodeBufferEndian) {
					value = this.buffer['read' + nodeNaming[type]](this._start + byteOffset, littleEndian);
				}
				else {
					// Error Checking
					if (typeof byteOffset !== 'number') {
						throw new TypeError('Type error');
					}
					if (byteOffset + size > this.byteLength) {
						throw new Error('INDEX_SIZE_ERR: DOM Exception 1');
					}
					value = this['_get' + type](this._start + byteOffset, littleEndian);
				}

				// Move the internal offset forward
				this._offset = byteOffset + size;

				return value;
			};
	})(type);
}

if (typeof jQuery !== 'undefined' && jQuery.fn.jquery >= "1.6.2") {
	var convertResponseBodyToText = function (byteArray) {
		// http://jsperf.com/vbscript-binary-download/6
		var scrambledStr;
		try {
			scrambledStr = IEBinaryToArray_ByteStr(byteArray);
		} catch (e) {
			// http://stackoverflow.com/questions/1919972/how-do-i-access-xhr-responsebody-for-binary-data-from-javascript-in-ie
			// http://miskun.com/javascript/internet-explorer-and-binary-files-data-access/
			var IEBinaryToArray_ByteStr_Script =
				"Function IEBinaryToArray_ByteStr(Binary)\r\n"+
				"	IEBinaryToArray_ByteStr = CStr(Binary)\r\n"+
				"End Function\r\n"+
				"Function IEBinaryToArray_ByteStr_Last(Binary)\r\n"+
				"	Dim lastIndex\r\n"+
				"	lastIndex = LenB(Binary)\r\n"+
				"	if lastIndex mod 2 Then\r\n"+
				"		IEBinaryToArray_ByteStr_Last = AscB( MidB( Binary, lastIndex, 1 ) )\r\n"+
				"	Else\r\n"+
				"		IEBinaryToArray_ByteStr_Last = -1\r\n"+
				"	End If\r\n"+
				"End Function\r\n";

			// http://msdn.microsoft.com/en-us/library/ms536420(v=vs.85).aspx
			// proprietary IE function
			window.execScript(IEBinaryToArray_ByteStr_Script, 'vbscript');

			scrambledStr = IEBinaryToArray_ByteStr(byteArray);
		}

		var lastChr = IEBinaryToArray_ByteStr_Last(byteArray),
		result = "",
		i = 0,
		l = scrambledStr.length % 8,
		thischar;
		while (i < l) {
			thischar = scrambledStr.charCodeAt(i++);
			result += String.fromCharCode(thischar & 0xff, thischar >> 8);
		}
		l = scrambledStr.length
		while (i < l) {
			result += String.fromCharCode(
				(thischar = scrambledStr.charCodeAt(i++), thischar & 0xff), thischar >> 8,
				(thischar = scrambledStr.charCodeAt(i++), thischar & 0xff), thischar >> 8,
				(thischar = scrambledStr.charCodeAt(i++), thischar & 0xff), thischar >> 8,
				(thischar = scrambledStr.charCodeAt(i++), thischar & 0xff), thischar >> 8,
				(thischar = scrambledStr.charCodeAt(i++), thischar & 0xff), thischar >> 8,
				(thischar = scrambledStr.charCodeAt(i++), thischar & 0xff), thischar >> 8,
				(thischar = scrambledStr.charCodeAt(i++), thischar & 0xff), thischar >> 8,
				(thischar = scrambledStr.charCodeAt(i++), thischar & 0xff), thischar >> 8);
		}
		if (lastChr > -1) {
			result += String.fromCharCode(lastChr);
		}
		return result;
	};

	jQuery.ajaxSetup({
		converters: {
			'* dataview': function(data) {
				return new jDataView(data);
			}
		},
		accepts: {
			dataview: "text/plain; charset=x-user-defined"
		},
		responseHandler: {
			dataview: function (responses, options, xhr) {
				// Array Buffer Firefox
				if ('mozResponseArrayBuffer' in xhr) {
					responses.text = xhr.mozResponseArrayBuffer;
				}
				// Array Buffer Chrome
				else if ('responseType' in xhr && xhr.responseType === 'arraybuffer' && xhr.response) {
					responses.text = xhr.response;
				}
				// Internet Explorer (Byte array accessible through VBScript -- convert to text)
				else if ('responseBody' in xhr) {
					responses.text = convertResponseBodyToText(xhr.responseBody);
				}
				// Older Browsers
				else {
					responses.text = xhr.responseText;
				}
			}
		}
	});

	jQuery.ajaxPrefilter('dataview', function(options, originalOptions, jqXHR) {
		// trying to set the responseType on IE 6 causes an error
		if (jQuery.support.ajaxResponseType) {
			if (!options.hasOwnProperty('xhrFields')) {
				options.xhrFields = {};
			}
			options.xhrFields.responseType = 'arraybuffer';
		}
		options.mimeType = 'text/plain; charset=x-user-defined';
	});
}

global.jDataView = (global.module || {}).exports = jDataView;

})(this);
