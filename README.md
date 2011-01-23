[jsDataView](http://blog.vjeux.com/) - Wrapper for DataView API
================================

WebGL came with a [Specification](http://www.khronos.org/registry/webgl/doc/spec/TypedArray-spec.html#6) for reading binary data called Typed Arrays:

* **Array Buffer** - Stores a binary file.
* **Array Buffer Views** (Typed Arrays such as Int32Array or Float64Array) - Access the binary file through a typed array.
* **Data View** - Read a binary file through usual BinaryReader functions.

As of end of January 2011, only Chrome 9 offers the ability to use the DataView  API. The goal of this wrapper is to be able to read binary data using the DataView API even if the browser does not support it yet.

The official DataView API requires an ArrayBuffer as a data source, the wrapper is extended to support a plain string as a source (obtained with [charset=x-user-defined](https://developer.mozilla.org/en/using_xmlhttprequest#Receiving_binary_data)). 

Licence: [Do What The Fuck You Want To Public License](http://sam.zoy.org/wtfpl/)

API
===
See the specification for a detailed API. [http://www.khronos.org/registry/webgl/doc/spec/TypedArray-spec.html](http://www.khronos.org/registry/webgl/doc/spec/TypedArray-spec.html#6)

Constructor
-----------------
* new **cDataView**(buffer, offset, length)
    * buffer can be either a String or an ArrayBuffer

Specification API
-------------------------
The wrapper satisfies all the specification getters.

* **getInt8**(byteOffset)
* **getUint8**(byteOffset)
* **getInt16**(byteOffset, littleEndian)
* **getUint16**(byteOffset, littleEndian)
* **getInt32**(byteOffset, littleEndian)
* **getUint32**(byteOffset, littleEndian)
* **getFloat32**(byteOffset, littleEndian)
* **getFloat64**(byteOffset, littleEndian)


Extended Specification
---------------------------------
The byteOffset parameter is optional. If you omit it, it will read right after the latest read offset. You can interact with the internal pointer with those two functions.

* **seek**(byteOffset)
    * Moves the internal pointer to the position
* **tell**()
    * Returns the current position

Added getChar and getString utilities.

* **getChar**(byteOffset)
* **getString**(byteOffset, length)

Shortcomings
==========

* Only the Read API is being wrapped, cDataView does not provide any set method.
* The Float64 implementation on strings does not have full precision.

Example
======

	var file = cDataView.createBinaryStream(
		0x10, 0x01, 0x00, 0x00, // Int32 - 272
		0x90, 0xcf, 0x1b, 0x47, // Float32 - 39887.5625
		0, 0, 0, 0, 0, 0, 0, 0, // 8 blank bytes
		0x4d, 0x44, 0x32, 0x30, // String - MD20
		0x61                    // Char - a
	);

Now we use the DataView as defined in the specification, the only thing that changes is the c before cDataView.
    var view = new cDataView(file);
    var version = view.getInt32(0); // 272
    var float = view.getFloat32(4); // 39887.5625

The wrapper extends the specification to make the DataView easier to use.
    var view = new cDataView(file);
    // A position counter is managed. Remove the argument to read right after the last read.
    version = view.getInt32(); // 272
    float = view.getFloat32(); // 39887.5625

    // You can move around with tell() and seek()
    view.seek(view.tell() + 8);

    // Two helpers: getChar and getString will make your life easier
    var tag = view.getString(undefined, 4); // MD20
    var char = view.getChar(); // a
