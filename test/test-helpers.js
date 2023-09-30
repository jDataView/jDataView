import jDataView from "../src/jdataview";
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

export function compareBytes(value, expected, message) {
	value = Array.prototype.slice.call(value);
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
