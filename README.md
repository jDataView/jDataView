[jsDataView](http://blog.vjeux.com/) - Wrapper for DataView API
================================

WebGL came with a (specification for reading binary data called Typed Arrays)[http://www.khronos.org/registry/webgl/doc/spec/TypedArray-spec.html#6]: 

* **Array Buffer** - Stores a binary file.
* **Array Buffer Views** (Typed Arrays such as Int32Array or Float64Array) - Access the binary file through a typed array.
* **Data View** - Read a binary file through usual BinaryReader functions.

As of end of January 2011, only Chrome 9 offers the ability to use the DataView  API. The goal of this wrapper is to be able to read binary data using the DataView API even if the browser does not support it yet.

The official DataView API requires an ArrayBuffer as a data source, the wrapper is extended to support a plain string as a source (obtained with [charset=x-user-defined](https://developer.mozilla.org/en/using_xmlhttprequest#Receiving_binary_data)). 

Licence: [Do What The Fuck You Want To Public License](http://sam.zoy.org/wtfpl/)