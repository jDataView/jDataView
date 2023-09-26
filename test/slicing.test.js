import { compareBytes, getJDataView, chr } from "./test-helpers";
import { describe, test, assert } from 'vitest'


describe('Slicing', function () {

	const view = getJDataView();

	test("with bound check", function () {
		assert.Throw(function () {
			view.slice(5, 10);
		});
	});

	test("as pointer to original data", function () {
		const pointerCopy = view.slice(1, 4);
		compareBytes(pointerCopy.getBytes(), [0xfe, 0xfd, 0xfc]);
		pointerCopy.setChar(0, chr(1));
		assert.equal(view.getChar(1), chr(1));
		pointerCopy.setChar(0, chr(0xfe));
	});

	test("as copy of original data", function () {
		const copy = view.slice(1, 4, true);
		compareBytes(copy.getBytes(), [0xfe, 0xfd, 0xfc]);
		copy.setChar(0, chr(1));
		assert.notEqual(view.getChar(1), chr(1));
	});

	test("with only start offset argument given", function () {
		const pointerCopy = view.slice(1);
		compareBytes(
			pointerCopy.getBytes(),
			[0xfe, 0xfd, 0xfc, 0xfa, 0x00, 0xba, 0x01]
		);
	});

	test("with negative start offset given", function () {
		const pointerCopy = view.slice(-2);
		compareBytes(pointerCopy.getBytes(), [0xba, 0x01]);
	});

	test("with negative end offset given", function () {
		const pointerCopy = view.slice(1, -2);
		compareBytes(
			pointerCopy.getBytes(),
			[0xfe, 0xfd, 0xfc, 0xfa, 0x00]
		);
	});
});
