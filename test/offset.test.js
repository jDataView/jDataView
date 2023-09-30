import { describe, test, it, assert } from "vitest";
import jDataView from "../src/jdataview";

describe("Offset (pointer)", () => {
	it("starts at 0", () => {
		const view = new jDataView(10);
		assert.equal(view.tell(), 0);
	});
	it("can seek", () => {
		const view = new jDataView(10);
		view.seek(5);
		assert.equal(view.tell(), 5);
	});
	test("Setting a value moves the pointer", () => {
		const view = new jDataView(10);
		view.setUint8(2, 25);
		assert.equal(view.tell(), 3);
	});
	test("Writing a value moves the pointer", () => {
		const view = new jDataView(10);
		view.writeUint8(25);
		assert.equal(view.tell(), 1);
	});
	test("Getting a value at the start uses the pointer", () => {
		const view = new jDataView(10);
		view.writeUint8(25);
		view.seek(0);
		assert.equal(view.getUint8(), 25);
	});
	test("Getting a value in the middle uses the pointer", () => {
		const view = new jDataView(12);
		view.setUint8(4, 25);
		view.seek(4);
		const value = view.getUint8();
		assert.equal(value, 25);
		assert.equal(value, view.getUint8(4));
	});
	test("Skipping works with negatives", () => {
		const view = new jDataView(12);
		view.setUint8(2, 25);

		view.skip(-1);
		assert.equal(view.getUint8(), 25);
	});
	test("Get moves the pointer forwards properly", () => {
		const view = new jDataView(15);

		view.writeUint8(25);
		view.writeInt16(26);
		view.writeUint32(27);
		view.writeBigInt64(28n);

		view.seek(0);

		assert.equal(view.getUint8(), 25);
		assert.equal(view.getInt16(), 26);
		assert.equal(view.getUint32(), 27);
		assert.equal(view.getBigInt64(), 28n);
	});
	test("The demo works", () => {
		// This demo: https://github.com/jDataView/jDataView/wiki/Example

		const view = jDataView.from(
			0x10,
			0x01,
			0x00,
			0x00, // Int32 - 272
			0x90,
			0xcf,
			0x1b,
			0x47, // Float32 - 39887.5625
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0, // 8 blank bytes
			0x4d,
			0x44,
			0x32,
			0x30, // String - MD20
			0x61 // Char - a
		);

		// The demo assumes littleEndian, but that's not the default
		view.littleEndian = true;

		assert.equal(view.getInt32(), 272);
		assert.equal(view.getFloat32(), 39887.5625);

		view.skip(8);

		assert.equal(view.getString(4), "MD20");
		assert.equal(view.getChar(), "a");
	});
});
