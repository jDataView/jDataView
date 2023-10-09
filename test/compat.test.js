import { jDataView } from "../src/jdataview";
import { describe, it } from "vitest";
import { compareBytes } from "./test-helpers";
import { expect } from "vitest";

describe("Compatibility", function () {
	it("Can be used in jDataView from Uint8Array::subarray", () => {
		const bytes = [1, 2, 3];
		const offset = 1;
		const original = new Uint8Array(bytes);
		const view = new jDataView(original.subarray(offset));

		compareBytes(view.getBytes(), bytes.slice(offset));
	});
	it("Works with SharedArrayBuffer", () => {
		const sharedBuffer = new SharedArrayBuffer(100);
		const view = new jDataView(sharedBuffer);

		expect(view.buffer).toBe(sharedBuffer);
	});
});
