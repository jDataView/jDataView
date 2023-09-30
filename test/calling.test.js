import { describe, expect, it } from "vitest";
import { getPrefilledJDataView } from "./test-helpers";

describe("Method calling (this)", () => {
	it("Throws when 'this' is undefined", () => {
		const view = getPrefilledJDataView();

		const writeUint8 = view.writeUint8;
		expect(() => writeUint8()).toThrowError();

		const setBytes = view.setBytes;
		expect(() => setBytes()).toThrowError();

		const getBigInt64 = view.getBigInt64;
		expect(() => getBigInt64()).toThrowError();
	});

	it("Throws when 'this' is something unusual", () => {
		const view = getPrefilledJDataView();

		expect(() => view.writeUint8.call(this, 1)).toThrowError();

		expect(() =>
			view.setBytes.call(this, 0, new Uint8Array(0))
		).toThrowError();

		expect(() => view.getBigInt64.call(this)).toThrowError();
	});

	it("Works when called properly", () => {
		const view = getPrefilledJDataView();

		expect(() => view.writeUint8(1)).not.toThrowError();

		expect(() => view.setBytes(0, new Uint8Array(0))).not.toThrowError();

		expect(() => view.getBigInt64()).not.toThrowError();
	});
});
