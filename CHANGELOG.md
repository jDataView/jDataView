* **August 23 2013**
  * Added bitfield support (was considered to be borrowed from [jBinary](https://github.com/jDataView/jBinary), but implemented faster and simpler version).
  * Completely dynamic one-time write* definition for all the set* methods.
  * Restructured tests using Mocha's BDD style, so now possible to test separate features and/or engines.
* **May 15 2013**
  * jDataView got [own account](https://github.com/jDataView)! More projects and demos coming soon.
* **May 30 2013**:
  * [RReverser](https://github.com/rreverser) added support for UTF-8 strings
  * Added support for 64-bit signed and unsigned integers (with precision loss outside the ±2^53 range when using primitive JS numbers due to IEEE.754 restrictions)
  * Added support for CanvasPixelArray as fast byte array for browsers that don't support Typed Arrays yet (like IE9)
  * Refactored code.
  * Added ability to test library on all the engines that are supported on current platform at once.
  * Added JSHint configuration according to project code guidelines and implemented corresponding QUnit test.
* **April 8 2013**:
  * [mmthomas](http://blog.coolmuse.com/) implemented support for denormalized float values in setters
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