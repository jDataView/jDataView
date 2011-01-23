[jDataView](http://blog.vjeux.com/) - A unique way to read a binary file in the browser.
================================

jDataView provides a standard way to read binary files in all the browsers. It follows the DataView standard and even extends it for a more practical use. The best available option is being used under the hood.

Explanation
=========

There are three ways to read a binary file from the browser.

The first one is to download the file through XHR with [charset=x-user-defined](https://developer.mozilla.org/en/using_xmlhttprequest#Receiving_binary_data). You get the file as a string, and you have to rewrite all the decoding functions (getUint16, getFloat32, ...).

Then WebGL came with [Typed Arrays](http://www.khronos.org/registry/webgl/doc/spec/TypedArray-spec.html#6) and the file is now stored as an **ArrayBuffer*. 

The default implemented way to read data from an array buffer is to use a **Typed Array**(Int32Array, Float64Array, ...). If your file contains many different data types, it is not handy to use as you have to create many arrays around your buffer. Also, it imposes the data to be aligned.

The best way to read binary data is through a **DataView**. It is a view around your buffer that can read arbitrary data types through well named functions: getUint32, getFloat64 ...

As of end of January 2011, the string way works on all browsers but Internet Explorer. Firefox 4 and Chrome 7 have Typed Arrays and only Chrome 9 has DataViews.

API
===
See the specification for a detailed API. [http://www.khronos.org/registry/webgl/doc/spec/TypedArray-spec.html](http://www.khronos.org/registry/webgl/doc/spec/TypedArray-spec.html#6)

Constructor
-----------------
* new **jDataView**(buffer, offset, length)
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
The byteOffset parameter is now optional. If you omit it, it will read right after the latest read offset. You can interact with the internal pointer with those two functions.

* **seek**(byteOffset)
    * Moves the internal pointer to the position
* **tell**()
    * Returns the current position

Addition of getChar and getString utilities.

* **getChar**(byteOffset)
* **getString**(byteOffset, length)

Addition of createBuffer, a utility to easily create buffers with the latest available storage type (String or ArrayBuffer).

* **createBuffer**(byte1, byte2, ...)

Shortcomings
==========

* Only the Read API is being wrapped, jDataView does not provide any set method.
* The Float64 implementation on strings does not have full precision.

Example
======
First we need a file. Either you get it through XHR or use the createBuffer utility.
	var file = jDataView.createBuffer(
		0x10, 0x01, 0x00, 0x00, // Int32 - 272
		0x90, 0xcf, 0x1b, 0x47, // Float32 - 39887.5625
		0, 0, 0, 0, 0, 0, 0, 0, // 8 blank bytes
		0x4d, 0x44, 0x32, 0x30, // String - MD20
		0x61                    // Char - a
	);

Now we use the DataView as defined in the specification, the only thing that changes is the c before jDataView.
    var view = new jDataView(file);
    var version = view.getInt32(0); // 272
    var float = view.getFloat32(4); // 39887.5625

The wrapper extends the specification to make the DataView easier to use.
    var view = new jDataView(file);
    // A position counter is managed. Remove the argument to read right after the last read.
    version = view.getInt32(); // 272
    float = view.getFloat32(); // 39887.5625

    // You can move around with tell() and seek()
    view.seek(view.tell() + 8);

    // Two helpers: getChar and getString will make your life easier
    var tag = view.getString(undefined, 4); // MD20
    var char = view.getChar(); // a

Licence: [Do What The Fuck You Want To Public License](http://sam.zoy.org/wtfpl/)
