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
import { jDataView } from "jdataview";

// jDataView maintains an internal byte-cursor, which lets you use the API in a much more ergonomic way
const view = new jDataView(new ArrayBuffer(100));

const msg = "Hello there";

// jDataView's writeXXX methods are the same as the setXXX methods,
// but the byte-cursor position is used instead of passing an offset
view.writeString(msg);
view.writeBigInt64(2011n);

// seek(pos) changes the byte-position of jDataView's internal 'cursor' 
view.seek(0);

// You need to specify the byte-length for strings (which for ascii text is just the length)
console.log(view.getString(msg.length)); // > Hello there

// Passing an offset is optional - if you don't, jDataView uses the byte-cursor position
// jDataView also has methods that let you use bigger Number's than JavaScript supports - you'll just lose precision
console.log(view.getInt64()); // > 2011
```
More examples are in [the docs](https://github.com/jDataView/jDataView/wiki). Here's a good [starting point](https://github.com/jDataView/jDataView/wiki/Example).

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
