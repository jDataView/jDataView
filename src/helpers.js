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
		case "number":
			buffer = new Uint8Array(buffer).buffer;

			break;

		case "string":
			buffer = getCharCodes(buffer);
		/* falls through */
		default:
			if (!(buffer instanceof ArrayBuffer)) {
				buffer = new Uint8Array(buffer).buffer;
			}
	}
	return buffer;
}
