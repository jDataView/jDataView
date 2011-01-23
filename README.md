[jsDataView](http://blog.vjeux.com/) - Wrapper for DataView API
================================

WebGL came with a (specification for reading binary data called Typed Arrays)[http://www.khronos.org/registry/webgl/doc/spec/TypedArray-spec.html#6]: 

* **Array Buffer** - Stores a binary file.
* **Array Buffer Views** (Typed Arrays such as Int32Array or Float64Array) - Access the binary file through a typed array.
* **Data View** - Read a binary file through usual BinaryReader functions.

As of end of January 2011, only Chrome 9 offers the ability to use the DataView  API. The goal of this wrapper is to be able to read binary data using the DataView API even if the browser does not support it yet.

The official DataView API requires an ArrayBuffer as a data source. The wrapper is extended to support a plain string as a source (obtained with [charset=x-user-defined](https://developer.mozilla.org/en/using_xmlhttprequest#Receiving_binary_data)). This means that you can use the DataView on any browser (even IE!).

Licence: [Do What The Fuck You Want To Public License](http://sam.zoy.org/wtfpl/)


Example
======
We first need to get a file. You will retrieve it through a XHR request. For this example we will use the createBinaryStream helper to create a sample file.
    var file = cDataView.createBinaryStream(
        0x10, 0x1, 0x0, 0x0, // Int32 - 272
        0x90, 0xcf, 0x1b, 0x47, // Float32 - 39887.5625
        0, 0, 0, 0, 0, 0, 0, 0, // 8 blank bytes
        0x4d, 0x44, 0x32, 0x30, // String - MD20
        0x61 // Char - a
    );

Now we use the DataView as defined in the specification, the only thing that changes is the c before cDataView.
   var view = new cDataView(file);
   var version = view.getInt32(0); // 272
   var float = view.getFloat32(4); // 39887.5625

The wrapper extends the specification to make the DataView easier to use.

    // A position counter is managed. Remove the argument to read right after the last read.
    version = view.getInt32(); // 272
    float = view.getFloat32(); // 39887.5625

    // You can move around with tell() and seek()
    view.seek(view.tell() + 8);

    // Two helpers: getChar and getString will make your life easier
    var tag = view.getString(undefined, 4); // MD20
    var char = view.getChar(); // a
