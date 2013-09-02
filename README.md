[![Build Status](https://travis-ci.org/jDataView/jDataView.png?branch=master)](https://travis-ci.org/jDataView/jDataView) <a href="http://blog.vjeux.com/2011/javascript/jdataview-read-binary-file.html">jDataView</a> - A unique way to work with a binary file in JavaScript.
================================

jDataView provides convenient way to read and/or modify binary data in all the browsers. It follows the [DataView Specification](http://www.khronos.org/registry/webgl/doc/spec/TypedArray-spec.html#8) and even extends it for a more practical use.

Explanation
===========

There are three ways to read a binary file from the browser.

* The first one is to download the file through XHR with [charset=x-user-defined](https://developer.mozilla.org/en/using_xmlhttprequest#Receiving_binary_data). You get the file as a **String**, convert it to byte **Array** and you have to rewrite all the decoding and encoding functions (getUint16, getFloat32, ...). All the browsers support this.

* Then browsers that implemented **Canvas** also added **CanvasPixelArray** as part of **ImageData**. It is fast byte array that is created and used internally by `<canvas />` element for manipulating low-level image data. We can create such host element and use it as factory for our own instances of this array.

* Then browsers that implemented **WebGL** added **ArrayBuffer**. It is a plain buffer that can be read with views called **TypedArrays** (Int32Array, Float64Array, ...). You can use them to decode the file but this is not very handy. It has big drawback, it can't read non-aligned data (but we can actually hack that). So they replaced **CanvasPixelArray** with **Uint8ClampedArray** (same as Uint8Array, but cuts off numbers outside 0..255 range).

* A new revision of the specification added **DataViews**. It is a view around your buffer that can read/write arbitrary data types directly through functions: getUint32, getFloat64 ...

And one way to read a binary file from the server.

* **NodeJS Buffers**. They appeared in [Node 0.4.0](http://nodejs.org/docs/v0.4.0/api/buffers.html). [Node 0.5.0](http://nodejs.org/docs/v0.5.0/api/buffers.html) added a DataView-like API. And [Node 0.6.0](http://nodejs.org/docs/v0.6.0/api/buffers.html) changed the API naming convention.

**jDataView** provides the **DataView API** with own convenient extensions using the best available option between Arrays, TypedArrays, NodeJS Buffers and DataViews.

Documentation
=============

  * API
    * [jDataView constructor](https://github.com/jDataView/jDataView/wiki/jDataView-constructor)
    * [DataView Specification](http://www.khronos.org/registry/typedarray/specs/latest/#8)
    * Extended Specification
      * [Operation control](https://github.com/jDataView/jDataView/wiki/Operation-control)
      * [writeXXX methods](https://github.com/jDataView/jDataView/wiki/writeXXX-methods)
      * [Strings and Blobs](https://github.com/jDataView/jDataView/wiki/Strings-and-Blobs)
      * [64-bit integers](https://github.com/jDataView/jDataView/wiki/64-bit-integers)
      * [Bitfields](https://github.com/jDataView/jDataView/wiki/Bitfields)
      * [Internal utilities](https://github.com/jDataView/jDataView/wiki/Internal-utilities)
  * [Example](https://github.com/jDataView/jDataView/wiki/Example)
  * [Changelog](https://github.com/jDataView/jDataView/blob/master/CHANGELOG.md)

Advanced usage ([jBinary](https://github.com/jDataView/jBinary))
========================

For complicated binary structures, it may be hard enough to use only low-level get/set operations for parsing,
processing and writing data.

In addition, most likely you might need convenient I/O methods for retrieving data from external sources such like
local files (using File API or from Node.js), remote files (via HTTP(S)), data-URIs, Node.js streams etc. as well
as for displaying generated content to user on webpage in image/video/audio/... containers
or even as simple download link.

If you faced any of these problems, you might want to check out new [jBinary](https://github.com/jDataView/jBinary)
library that works on top of **jDataView** and allows to operate with binary data in structured and convenient way.

Demos
=====

* A <a href="http://jdataview.github.io/jDataView/untar/">simple tar viewer</a>. It is a "Hello World" demo of how easy it is to use the library.

* <a href="http://rreverser.com/dev/bmp/">BMP viewer</a> with ability to load files by URL or using File API, parsing them using library and rendering with Canvas (no `<img />` elements at all).

* [jBinary.Repo](https://jdataview.github.io/jBinary.Repo) ready-to-use typesets and corresponding demos of using
[jDataView](https://github.com/jDataView/jDataView)+[jBinary](https://github.com/jDataView/jBinary)
for reading popular file formats like
[GZIP archives](https://jdataview.github.io/jBinary.Repo/demo/#gzip),
[TAR archives](https://jdataview.github.io/jBinary.Repo/demo/#tar),
[ICO images](https://jdataview.github.io/jBinary.Repo/demo/#ico),
[MP3 tags](https://jdataview.github.io/jBinary.Repo/demo/#mp3)
etc.

* A <a href="http://www.visual-experiments.com/2011/04/05/photosynth-webgl-viewer/">PhotoSynth WebGL Viewer</a> by Visual Experiments. It uses jDataView to read the binary file and then WebGL to display it.
<a href="http://www.visual-experiments.com/2011/04/05/photosynth-webgl-viewer/"><img src="http://i.imgur.com/HRHXo.jpg"/></a>

Please tell us if you made something with jDataView :)

License
=======

jDataView is issued under [Do What The Fuck You Want To Public License](http://sam.zoy.org/wtfpl/) :)
