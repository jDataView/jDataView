import { jDataView } from "../src/jdataview";
import { describe, test, } from 'vitest'
import { compareBytes } from "./test-helpers";

describe("Compatibility", function () {
    test("can be used in jDataView from Uint8Array::subarray", function () {
        const bytes = [1, 2, 3],
            offset = 1,
            original = new Uint8Array(bytes),
            view = new jDataView(original.subarray(offset));

        compareBytes(view.getBytes(), bytes.slice(offset));
    });

});

