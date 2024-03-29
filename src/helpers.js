export function getCharCodes(string) {
	const codes = new Uint8Array(string.length);

	for (let i = 0, length = string.length; i < length; i++) {
		// Wraparound handled by typed array
		codes[i] = string.charCodeAt(i);
	}
	return codes;
}

// mostly internal function for wrapping any supported input (String or Array-like) to best suitable buffer format
export function wrapBuffer(buffer) {
	switch (typeof buffer) {
		case "number": {
			buffer = new Uint8Array(buffer).buffer;
			break;
		}

		case "string": {
			buffer = getCharCodes(buffer).buffer;
			break;
		}

		default: {
			if (
				!(
					buffer instanceof ArrayBuffer ||
					(typeof SharedArrayBuffer !== "undefined" &&
						buffer instanceof SharedArrayBuffer)
				)
			) {
				buffer = new Uint8Array(buffer).buffer;
			}
		}
	}
	return buffer;
}
