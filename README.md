[jDataView](http://blog.vjeux.com/) - A unique way to read a binary file in the browser.
================================

jDataView provides a standard way to read binary files in all the browsers. It follows the [DataView Specification](http://www.khronos.org/registry/webgl/doc/spec/TypedArray-spec.html#6) and even extends it for a more practical use.

Explanation
=========

There are three ways to read a binary file from the browser.

* The first one is to download the file through XHR with [charset=x-user-defined](https://developer.mozilla.org/en/using_xmlhttprequest#Receiving_binary_data). You get the file as a **String**, and you have to rewrite all the decoding functions (getUint16, getFloat32, ...). All the browsers support this.

* Then browsers that implemented WebGL also added **ArrayBuffers**. It is a plain buffer that can be read with views called **TypedArrays** (Int32Array, Float64Array, ...). You can use them to decode the file but this is not very handy. It has big drawback, it can't read non-aligned data. It is supported by Firefox 4 and Chrome 7.

* A new revision of the specification added **DataViews**. It is a view around your buffer that can read arbitrary data types directly through functions: getUint32, getFloat64 ... Only Chrome 9 supports it.

jDataView provides the DataView API for all the browsers using the best available option between Strings, TypedArrays and DataViews.

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


==== Demos

A World of Warcraft Model Parser and Viewer. It uses jDataView to read the binary file and then WebGL to display it.
<a href="http://fooo.fr/~vjeux/github/jsWoWModelViewer/modelviewer.html"><img src="http://fooo.fr/~vjeux/github/jsWoWModelViewer/images/modelviewer.png"></a>

Licence: [Do What The Fuck You Want To Public License](http://sam.zoy.org/wtfpl/)
