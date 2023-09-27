import { describe, test, it, assert } from "vitest";
import jDataView from "../src/jdataview";



describe("Offset (pointer)", () => {
    it("starts at 0", () => {
        const view = new jDataView(10);
        assert.equal(view.tell(), 0)
    })
    it("can seek", () => {
        const view = new jDataView(10);
        view.seek(5);
        assert.equal(view.tell(), 5)
    })
    test("Setting a value moves the pointer", () => {
        const view = new jDataView(10);
        view.setUint8(2, 25);
        assert.equal(view.tell(), 3)
    })
    test("Writing a value moves the pointer", () => {
        const view = new jDataView(10);
        view.writeUint8(25);
        assert.equal(view.tell(), 1)
    })
    test("Getting a value at the start uses the pointer", () => {
        const view = new jDataView(10);
        view.writeUint8(25);
        view.seek(0);
        assert.equal(view.getUint8(), 25)
    })
    test("Getting a value in the middle uses the pointer", () => {
        const view = new jDataView(12);
        view.setUint8(4, 25);
        view.seek(4);
        const value = view.getUint8();
        assert.equal(value, 25)
        assert.equal(value, view.getUint8(4))
    })
    test("Skipping works with negatives", () => {
        const view = new jDataView(12);
        view.setUint8(2, 25);

        view.skip(-1)
        assert.equal(view.getUint8(), 25)

    })
    test("Get moves the pointer forwards properly", () => {
        const view = new jDataView(15);


        view.writeUint8(25);
        view.writeInt16(26);
        view.writeUint32(27);
        view.writeBigInt64(28n);


        view.seek(0)

        assert.equal(view.getUint8(), 25)
        assert.equal(view.getInt16(), 26)
        assert.equal(view.getUint32(), 27)
        assert.equal(view.getBigInt64(), 28n)
    })
})