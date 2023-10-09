import jDataView from "../src/jdataview.js";
import { assert } from "vitest";

// Aliases
export const b = jDataView.from;
export const chr = String.fromCharCode;
// prettier-ignore
const testDataBytes = [
    0x00,
    0xff, 0xfe, 0xfd, 0xfc,
    0xfa, 0x00, 0xba, 0x01
];

/**
 *
 * @param {Uint8Array} value
 * @param {ArrayLike<number>} expected
 * @param {string} [message=_]
 */
export function compareBytes(value, expected, message) {
	expected = Uint8Array.from(expected);

	assert.deepEqual(
		value,
		expected,
		message || "[" + value + "] != [" + expected + "]"
	);
}

export function compareWithNaN(value, expected, message) {
	assert.ok(Number.isNaN(value), message || value + " != NaN");
}

export function getPrefilledJDataView() {
	return new jDataView(testDataBytes.slice(), 1, undefined, true);
}
