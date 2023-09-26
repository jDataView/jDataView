import jDataView from "../src/jdataview"
import { assert } from "vitest"

// Aliases
export const b = jDataView.from;
export const chr = String.fromCharCode;
// prettier-ignore
const dataBytes = [
    0x00,
    0xff, 0xfe, 0xfd, 0xfc,
    0xfa, 0x00, 0xba, 0x01
];
const dataStart = 1;



export function compareInt64(value, expected, message) {
    value = Number(value);
    assert.equal(value, expected, message || value + " != " + expected);
}

export function compareBytes(value, expected, message) {
    value = Array.prototype.slice.call(value);
    assert.deepEqual(
        value,
        expected,
        message || "[" + value + "] != [" + expected + "]"
    );
}

function isNaN(obj) {
    return Number.isNaN(obj) || (typeof obj === 'number' && obj.toString() === 'NaN');
}

export function compareWithNaN(value, expected, message) {
    assert.ok(isNaN(value), message || value + " != NaN");
}

export function getJDataView() {
    return new jDataView(dataBytes.slice(), dataStart, undefined, true);
}