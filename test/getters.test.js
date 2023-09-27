import { jDataView } from "../src/jdataview";
import { compareInt64, compareBytes, compareWithNaN, getPrefilledJDataView, b, chr, bufferToHex } from "./test-helpers";
import { describe, test, assert } from 'vitest'


describe('Getters', function () {

	// getter = value || {value, check?, view?, args?}
	function testGetters(type, getters) {
		const view = getPrefilledJDataView();
		test(type, function () {
			getters.forEach(function (getter) {
				if (typeof getter !== "object") {
					getter = { value: getter };
				}

				const args = getter.args || [];
				const contextView = getter.view || view;
				const check = getter.check || assert.equal;
				const value = getter.value;
				const offset = contextView.tell();
				const realValue = contextView["get" + type].apply(
					contextView,
					args
				);

				check(
					realValue,
					value,
					"get" +
					type +
					"(" +
					args.join(", ") +
					") == " +
					realValue +
					" != " +
					value +
					" at offset " +
					offset +
					(getter.view
						? " in view [" +
						getter.view
							.getBytes(undefined, 0, true, true)
							.join(", ") +
						"]"
						: "")
				);
			});
		});
	}

	testGetters("Bytes", [
		{ args: [2, 1], value: [0xfe, 0xfd], check: compareBytes },
		{
			args: [3, 0, false],
			value: [0xfd, 0xfe, 0xff],
			check: compareBytes,
		},
	]);

	testGetters("Char", [
		chr(0xff),
		chr(0xfe),
		chr(0xfd),
		chr(0xfc),
		chr(0xfa),
		chr(0),
		chr(0xba),
		chr(1),
	]);

	testGetters("String", [
		{ args: [1, 0], value: chr(0xff) },
		{ args: [1, 5], value: chr(0) },
		{ args: [1, 7], value: chr(1) },
		{
			view: b(127, 0, 1, 65, 66),
			args: [5],
			value: chr(127) + chr(0) + chr(1) + chr(65) + chr(66),
		},
		{
			view: b(0xd1, 0x84, 0xd1, 0x8b, 0xd0, 0xb2),
			args: [undefined, undefined, "utf8"],
			value: chr(1092) + chr(1099) + chr(1074),
		},
	]);

	test("Big String", function () {
		const view = new jDataView(2000000);
		assert.doesNotThrow(function () {
			view.getString();
		});
	}, { timeout: 5000 });

	testGetters("Int8", [-1, -2, -3, -4, -6, 0, -70, 1]);

	testGetters("Uint8", [255, 254, 253, 252, 250, 0, 186, 1]);

	testGetters("Int16", [
		{ args: [0], value: -257 },
		{ args: [1], value: -514 },
		{ args: [2], value: -771 },
		{ args: [3], value: -1284 },
		{ args: [4], value: 250 },
		{ args: [5], value: -17920 },
		{ args: [6], value: 442 },
	]);

	testGetters("Uint16", [
		{ args: [0], value: 65279 },
		{ args: [1], value: 65022 },
		{ args: [2], value: 64765 },
		{ args: [3], value: 64252 },
		{ args: [4], value: 250 },
		{ args: [5], value: 47616 },
		{ args: [6], value: 442 },
	]);

	testGetters("Uint32", [
		{ args: [0], value: 4244504319 },
		{ args: [1], value: 4210884094 },
		{ args: [2], value: 16448765 },
		{ args: [3], value: 3120626428 },
		{ args: [4], value: 28967162 },
	]);

	testGetters("Int32", [
		{ args: [0], value: -50462977 },
		{ args: [1], value: -84083202 },
		{ args: [2], value: 16448765 },
		{ args: [3], value: -1174340868 },
		{ args: [4], value: 28967162 },
	]);

	testGetters("Float32", [
		{ args: [0], value: -1.055058432344064e37 },
		{ args: [1], value: -6.568051909668895e35 },
		{ args: [2], value: 2.30496291345398e-38 },
		{ args: [3], value: -0.0004920212086290121 },
		{ args: [4], value: 6.832701044000979e-38 },
		{ view: b(0x7f, 0x80, 0x00, 0x00), value: Infinity },
		{ view: b(0xff, 0x80, 0x00, 0x00), value: -Infinity },
		{ view: b(0x00, 0x00, 0x00, 0x00), value: 0 },
		{ view: b(0xff, 0x80, 0x00, 0x01), check: compareWithNaN },
	]);

	testGetters("Float64", [
		{ args: [0], value: 2.426842827241402e-300 },
		{
			view: b(0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00),
			value: Infinity,
		},
		{
			view: b(0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00),
			value: -Infinity,
		},
		{
			view: b(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00),
			value: 0,
		},
		{
			view: b(0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00),
			value: -0,
		},
		{
			view: b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00),
			value: 1,
		},
		{
			view: b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01),
			value: 1.0000000000000002,
		},
		{
			view: b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02),
			value: 1.0000000000000004,
		},
		{
			view: b(0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00),
			value: 2,
		},
		{
			view: b(0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00),
			value: -2,
		},
		{
			view: b(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01),
			value: 5e-324,
		},
		{
			view: b(0x00, 0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff),
			value: 2.225073858507201e-308,
		},
		{
			view: b(0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00),
			value: 2.2250738585072014e-308,
		},
		{
			view: b(0x7f, 0xef, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff),
			value: 1.7976931348623157e308,
		},
		{
			view: b(0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01),
			check: compareWithNaN,
		},
	]);

	testGetters("BigUint64", [
		{
			view: b(0x00, 0x67, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe),
			value: 29273397577908224n,
			check: compareInt64,
		},
		{
			view: b(0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77),
			value: 4822678189205111n,
			check: compareInt64,
		},
	]);

	testGetters("BigInt64", [
		{
			args: [0, false],
			value: -283686985483775n,
			check: compareInt64,
		},
		{
			view: b(0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe),
			value: -2n,
			check: compareInt64,
		},
		{
			view: b(0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77),
			value: 4822678189205111n,
			check: compareInt64,
		},
	]);

	testGetters("Unsigned", [
		// padded to byte here
		{ args: [3, 1], value: 7 },
		{ args: [5], value: 30 },
		// padded to byte here
		{ args: [15], value: 32510 },
		{ args: [17], value: 64000 },
		// padded to byte here
		{
			view: b(0xff, 0xff, 0xff, 0xff),
			args: [32],
			value: 0xffffffff,
		},
	]);

	testGetters("Signed", [
		// padded to byte here
		{ args: [3, 1], value: -1 },
		{ args: [5], value: -2 },
		// padded to byte here
		{ args: [15], value: -258 },
		{ args: [17], value: 64000 },
		// padded to byte here
		{ view: b(0xff, 0xff, 0xff, 0xff), args: [32], value: -1 },
	]);

	test("Debugging", () => {
		const view = new jDataView(20);

		view.writeChar("þ");
		assert.equal(view.getChar(0), "þ");
	})

});
