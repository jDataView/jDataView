# jDataView - JS Binary data made easy

[![Tests Status](https://github.com/jdataview/jdataview/actions/workflows/run-tests.yml/badge.svg)](https://github.com/jDataView/jDataView/actions/workflows/run-tests.yml)

[npm](https://www.npmjs.com/package/jdataview) | [GitHub](https://github.com/jDataView/jDataView/) | [Docs](https://github.com/jDataView/jDataView/wiki) | [Website](https://jdataview.github.io/jDataView/) | [Changelog](https://github.com/jDataView/jDataView/blob/master/CHANGELOG.md)

jDataView is a drop-in replacement for JavaScript's built-in `DataView` class,  adding methods for writing strings, individual bits, arbitrary-sized integers, and more.

## Usage

```bash
npm i jdataview
```
> Note that TypeScript definitions are now included in the `jDataView` package automatically.
```ts
import { jDataView } from "jDataView";

const view = new jDataView(new ArrayBuffer(100));

const msg = "Hello there";

view.writeString(msg);
view.writeBigInt64(2011n);

view.seek(0);
console.log(view.getString(msg.length)); // Hello there
console.log(view.getBigInt64()); // 2011n (the year jDataView was created)
```
More examples are in [the docs](). Here's a [starting point](https://github.com/jDataView/jDataView/wiki/Example).

## [Documentation](https://github.com/jDataView/jDataView/wiki)
jDataView extends the built-in JavaScript `DataView` class, so all of [it's documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) is applicable here. 

### API Reference

  * [jDataView constructor](https://github.com/jDataView/jDataView/wiki/jDataView-constructor)
  * jDataView Extensions
    * [Operation control](https://github.com/jDataView/jDataView/wiki/Operation-control)
    * [writeXXX methods](https://github.com/jDataView/jDataView/wiki/writeXXX-methods)
    * [Strings and Blobs](https://github.com/jDataView/jDataView/wiki/Strings-and-Blobs)
    * [Bitfields](https://github.com/jDataView/jDataView/wiki/Bitfields)
    * [Internal utilities](https://github.com/jDataView/jDataView/wiki/Internal-utilities)


## History

Check out the original [jDataView article](https://blog.vjeux.com/2011/javascript/jdataview-read-binary-file.html) by [Vjeux](https://github.com/vjeux), jDataView's original author.

There are three ways to read a binary file from the browser.

* The first one is to download the file through XHR with [charset=x-user-defined](https://developer.mozilla.org/en/using_xmlhttprequest#Receiving_binary_data). You get the file as a **String**, convert it to byte **Array** and you have to rewrite all the decoding and encoding functions (getUint16, getFloat32, ...). All the browsers support this.

* Then browsers that implemented **Canvas** also added **CanvasPixelArray** as part of **ImageData**. It is fast byte array that is created and used internally by `<canvas />` element for manipulating low-level image data. We can create such host element and use it as factory for our own instances of this array.

* Then browsers that implemented **WebGL** added **ArrayBuffer**. It is a plain buffer that can be read with views called **TypedArrays** (Int32Array, Float64Array, ...). You can use them to decode the file but this is not very handy. It has big drawback, it can't read non-aligned data (but we can actually hack that). So they replaced **CanvasPixelArray** with **Uint8ClampedArray** (same as Uint8Array, but cuts off numbers outside 0..255 range).

* A new revision of the specification added **DataViews**. It is a view around your buffer that can read/write arbitrary data types directly through functions: getUint32, getFloat64 ...

And one way to read a binary file from the server.

* **NodeJS Buffers**. They appeared in [Node 0.4.0](http://nodejs.org/docs/v0.4.0/api/buffers.html). [Node 0.5.0](http://nodejs.org/docs/v0.5.0/api/buffers.html) added a DataView-like API. And [Node 0.6.0](http://nodejs.org/docs/v0.6.0/api/buffers.html) changed the API naming convention.

**jDataView** provided a polyfill for the **DataView API** with own convenient extensions using the best available option between Arrays, TypedArrays, NodeJS Buffers and DataViews.

Now that `DataView` is natively available in all engines, **jDataView 3** acts as a layer on top of it with powerful methods for dealing with non-standard binary data types, such as strings and arbitrary-sized integers.

## Demos

- [PhotoSynth WebGL Viewer](http://www.visual-experiments.com/2011/04/05/photosynth-webgl-viewer/) by Visual Experiments. It uses jDataView to read the binary file and then WebGL to display it.
- [simple tar viewer](http://jdataview.github.io/jDataView/untar/). It is a "Hello World" demo of how easy it is to use the library.
- [TrueTypeFont library demo](http://ynakajima.github.io/ttf.js/demo/glyflist/) which uses jDataView to read and display glyphs from TrueType file.
- [jBinary.Repo](https://jdataview.github.io/jBinary.Repo) ready-to-use typesets and corresponding demos of using
[jDataView](https://github.com/jDataView/jDataView)+[jBinary](https://github.com/jDataView/jBinary)
for reading popular file formats like
[GZIP archives](https://jdataview.github.io/jBinary.Repo/demo/#gzip),
[TAR archives](https://jdataview.github.io/jBinary.Repo/demo/#tar),
[ICO images](https://jdataview.github.io/jBinary.Repo/demo/#ico),
[BMP images](https://jdataview.github.io/jBinary.Repo/demo/#bmp),
[MP3 tags](https://jdataview.github.io/jBinary.Repo/demo/#mp3)
etc.
- [Talking image](http://hacksparrow.github.io/talking-image/) - animation and audio in one package powered by
HTML5 Audio, [jDataView](https://github.com/jDataView/jDataView) and [jBinary](https://github.com/jDataView/jBinary).

---

*Please tell us if you made something with jDataView :)*


## Also check out [jBinary](https://github.com/jDataView/jBinary)


For complicated binary structures, it may be hard enough to use only low-level get/set operations for parsing,
processing and writing data.

In addition, most likely you might need convenient I/O methods for retrieving data from external sources such like
local files (using File API or from Node.js), remote files (via HTTP(S)), data-URIs, Node.js streams etc. as well
as for displaying generated content to user on webpage in image/video/audio/... containers
or even as simple download link.

If you faced any of these problems, you might want to check out new [jBinary](https://github.com/jDataView/jBinary)
library that works on top of **jDataView** and allows to operate with binary data in structured and convenient way.
