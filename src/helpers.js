export function getCharCodes(string) {
    const codes = new Uint8Array(string.length);

    for (let i = 0, length = string.length; i < length; i++) {
        codes[i] = string.charCodeAt(i) & 0xff;
    }
    return codes;
}


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

export function defined(value, defaultValue) {
    return value !== undefined ? value : defaultValue;
}
