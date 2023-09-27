export function getCharCodes(string) {
    const codes = new Uint8Array(string.length);

    for (let i = 0, length = string.length; i < length; i++) {
        codes[i] = string.charCodeAt(i) & 0xff;
    }
    return codes;
}

// mostly internal function for wrapping any supported input (String or Array-like) to best suitable buffer format
export function wrapBuffer(buffer) {
    switch (typeof buffer) {
        case 'number':
            buffer = new Uint8Array(buffer).buffer;

            break;

        case 'string':
            buffer = getCharCodes(buffer);
        /* falls through */
        default:
            if (!is(buffer, ArrayBuffer)) {
                buffer = new Uint8Array(buffer).buffer;
            }
    }
    return buffer;
};


export function is(obj, Ctor) {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    return (
        obj.constructor === Ctor ||
        Object.prototype.toString.call(obj) === '[object ' + Ctor.name + ']'
    );
}

export function arrayFrom(arrayLike, forceCopy) {
    return !forceCopy && is(arrayLike, Array)
        ? arrayLike
        : Array.prototype.slice.call(arrayLike);
}

