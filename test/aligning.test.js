import { getPrefilledJDataView } from "./test-helpers.js";
import { describe, it, assert } from "vitest";

describe("Aligning", function () {
	const view = getPrefilledJDataView();

	function checkAlignBy(byteCount, expectedOffset) {
		const offset = view.alignBy(byteCount);
		assert.equal(view.tellBit(), 0);
		assert.equal(view.tell(), offset);
		assert.equal(offset, expectedOffset);
	}

	it("returns the correct offset", () => {
		view.seek(1);
		checkAlignBy(undefined, 1);
		view.getUnsigned(17);
		checkAlignBy(undefined, 4);
	});
	it("can move the offset correctly", () => {
		checkAlignBy(3, 6);
	});
});
