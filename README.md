<a href="http://blog.vjeux.com/2011/javascript/jdataview-read-binary-file.html">jDataView</a> - A unique way to work with a binary file in JavaScript.
================================

jDataView provides a standard way to read and/or modify binary files in all the browsers. It follows the [DataView Specification](http://www.khronos.org/registry/webgl/doc/spec/TypedArray-spec.html#6) and even extends it for a more practical use.

Explanation
=========

There are three ways to read a binary file from the browser.

* The first one is to download the file through XHR with [charset=x-user-defined](https://developer.mozilla.org/en/using_xmlhttprequest#Receiving_binary_data). You get the file as a **String**, convert it to byte **Array** and you have to rewrite all the decoding and encoding functions (getUint16, getFloat32, ...). All the browsers support this.

* Then browsers that implemented WebGL also added **ArrayBuffers**. It is a plain buffer that can be read with views called **TypedArrays** (Int32Array, Float64Array, ...). You can use them to decode the file but this is not very handy. It has big drawback, it can't read non-aligned data (but we can actually hack that).

* A new revision of the specification added **DataViews**. It is a view around your buffer that can read/write arbitrary data types directly through functions: getUint32, getFloat64 ...

And one way to read a binary file from the server.

* **NodeJS Buffers**. They appeared in [Node 0.4.0](http://nodejs.org/docs/v0.4.0/api/buffers.html). [Node 0.5.0](http://nodejs.org/docs/v0.5.0/api/buffers.html) added a DataView-like API. And [Node 0.6.0](http://nodejs.org/docs/v0.6.0/api/buffers.html) changed the API naming convention.

jDataView provides the DataView API using the best available option between Arrays, TypedArrays, NodeJS Buffers and DataViews.

API
===
See the [Typed Array Specification](http://www.khronos.org/registry/typedarray/specs/latest/#8) for a detailed API.

Constructor
-----------------
* new **jDataView**(buffer, offset, length, littleEndian = false)
    * buffer can be either a binary String, any Array-like byte storage (Array, Uint8Array, Arguments, jQuery(Array), ...) or count of bytes if you want to operate on new empty buffer.
    * littleEndian = false (Big Endian mode) is a default value for the view

Specification API
-------------------------
The wrapper satisfies all the specification getters:

* **getInt8**(byteOffset)
* **getUint8**(byteOffset)
* **getInt16**(byteOffset, littleEndian)
* **getUint16**(byteOffset, littleEndian)
* **getInt32**(byteOffset, littleEndian)
* **getUint32**(byteOffset, littleEndian)
* **getFloat32**(byteOffset, littleEndian)
* **getFloat64**(byteOffset, littleEndian)

And setters:

* **setInt8**(byteOffset, value)
* **setUint8**(byteOffset, value)
* **setInt16**(byteOffset, value, littleEndian)
* **setUint16**(byteOffset, value, littleEndian)
* **setInt32**(byteOffset, value, littleEndian)
* **setUint32**(byteOffset, value, littleEndian)
* **setFloat32**(byteOffset, value, littleEndian)
* **setFloat64**(byteOffset, value, littleEndian)

Extended Specification
---------------------------------
Addition of a littleEndian argument to the constructor. Big Endian will be the default mode of getters if their littleEndian value is undefined.

* **jDataView**(buffer, offset, length, littleEndian = false)

The byteOffset parameter is now optional. If you omit it, it will read right after the latest read offset. You can interact with the internal pointer with those two functions.

* **seek**(byteOffset)
    * Moves the internal pointer to the position
* **tell**()
    * Returns the current position
* **slice**(start, end, forceCopy = false)
    * Returns view (jDataView) on part of original one; may point to the same memory buffer or copy data into new one depending on forceCopy parameter.

Also, specification DataView setters require byteOffset as first argument, and passing "undefined" for sequential writes can be not very convenient.
You can use ```writeXXX``` methods instead, which will set values at current position automatically:

* **writeInt8**(value)
* **writeUint8**(value)
* **writeInt16**(value, littleEndian)
* **writeUint16**(value, littleEndian)
* **writeInt32**(value, littleEndian)
* **writeUint32**(value, littleEndian)
* **writeFloat32**(value, littleEndian)
* **writeFloat64**(value, littleEndian)

Addition of Char, String and Bytes utilities.

* **getChar**(byteOffset)
* **getString**(length, byteOffset)
* **getBytes**(length, byteOffset, littleEndian)
* **setChar**(byteOffset, char)
* **setString**(byteOffset, chars)
* **setBytes**(byteOffset, bytes, littleEndian)
* **writeChar**(char)
* **writeString**(chars)
* **writeBytes**(bytes, littleEndian)

Addition of wrapBuffer and createBuffer, utilities to easily create buffers with the latest available storage type (Node.js Buffer, ArrayBuffer or simple Array).

* **wrapBuffer**(string_or_bytes_or_byteCount)
* **createBuffer**(byte1, byte2, ...)

Example
======
First we need a file. Either you get it through XHR or use the createBuffer utility.

```javascript
var file = jDataView.createBuffer(
	0x10, 0x01, 0x00, 0x00, // Int32 - 272
	0x90, 0xcf, 0x1b, 0x47, // Float32 - 39887.5625
	0, 0, 0, 0, 0, 0, 0, 0, // 8 blank bytes
	0x4d, 0x44, 0x32, 0x30, // String - MD20
	0x61                    // Char - a
);
```

Now we use the DataView as defined in the specification, the only thing that changes is the j before jDataView.

```javascript
var view = new jDataView(file);
var version = view.getInt32(0); // 272
var float = view.getFloat32(4); // 39887.5625
```

The wrapper extends the specification to make the DataView easier to use.

```javascript
var view = new jDataView(file);
// A position counter is managed. Remove the argument to read right after the last read.
version = view.getInt32(); // 272
float = view.getFloat32(); // 39887.5625

// You can move around with tell() and seek()
view.seek(view.tell() + 8);

// Two helpers: getChar and getString will make your life easier
var tag = view.getString(4); // MD20
var char = view.getChar(); // a
```

You can use a <a href="http://blog.vjeux.com/2011/javascript/jquery-binary-ajax.html">patched version of jQuery</a> that supports ArrayBuffer for AJAX.

```javascript
$.get(
  'data.bin',
  function (view) {
    var tag = view.getString(4); // 'MD20'
    var version = view.getUint32(); // 732
  },
  'dataview'
);
```

Changelog
========
* **March 16 2013**:
  * [RReverser](https://github.com/rreverser) added support for setters in all supported implementations!
  * Performance improvements changing lower level constructs and type of inner buffers
  * Addition of [gs]etBytes, write*, wrapBuffer and slice helpers
  * Added support for any Array-like byte storage as input (Array, Uint8Array, Arguments, jQuery(Array), ...)
  * Added ability to create empty buffer (and operate on it) by passing count of bytes to wrapBuffer.
* **June 30 2012**: Thanks to [Mithgol](https://github.com/Mithgol) for the changes!
  * Changed default to big endian from little endian to be compatible with DataView specification
  * Dropped support for NodeJS < 0.5.5, it was buggy anyway
  * Fixed an issue where ArrayBuffer would not work on NodeJS
  * Moved the compatibility checks outside of the read functions for hopefully better performance
* **December 22 2011**: Added IE6-9 support by [scintill](https://github.com/scintill)
* **November 30 2011**:
  * Added NodeJS Buffer support + NPM Package.
  * Added support for NaN and Infinity in the float shim.
  * Added ```buffer```, ```byteLength``` and ```byteOffset``` attributes.
  * Fixed bugs using non zero ```byteOffset``` and added more bound checks.
* **September 21 2011**: Added a missing ```littleEndian``` argument on getInt16.
* **April 28 2011**: Seeking to the end of file no longer throws an error.
* **April 26 2011**: Fixed a bug with extremely large unsigned 32bit being considered as signed. ([Solution](http://stackoverflow.com/questions/1240408/reading-bytes-from-a-javascript-string/2954435#2954435)). 
* **April 8 2011**: Added littleEndian argument on the constructor. Opera 11.50 does not fully implement DataView, improved check.

Demos
==== 

* A <a href="http://fooo.fr/~vjeux/github/jsDataView/demo/untar/untar.html">simple tar viewer</a>. It is a "Hello World" demo of how easy it is to use the library.

* A <a href="http://fooo.fr/~vjeux/github/jsWoWModelViewer/modelviewer.html">World of Warcraft Model Viewer</a>. It uses jDataView to read the binary file and then WebGL to display it.
<a href="http://fooo.fr/~vjeux/github/jsWoWModelViewer/modelviewer.html"><img src="http://fooo.fr/~vjeux/github/jsWoWModelViewer/images/modelviewer.png"></a>

* A <a href="http://www.visual-experiments.com/2011/04/05/photosynth-webgl-viewer/">PhotoSynth WebGL Viewer</a> by Visual Experiments. It uses jDataView to read the binary file and then WebGL to display it.
<a href="http://www.visual-experiments.com/2011/04/05/photosynth-webgl-viewer/"><img src="http://i.imgur.com/HRHXo.jpg"/></a>

Please tell me if you made something with jDataView :)

Licence: [Do What The Fuck You Want To Public License](http://sam.zoy.org/wtfpl/)
