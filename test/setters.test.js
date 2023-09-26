import { jDataView } from "../src/jdataview";
import { compareInt64, compareBytes, compareWithNaN, getJDataView, b, chr } from "./test-helpers";
import { describe, it, test, assert } from 'vitest'


describe('Setters', function () {

	const view = getJDataView();

	// setter = value || {value, args?, getterArgs?, check?}
	function testSetters(type, setters) {
		test(type, function () {
			setters.forEach(function (setter) {
				if (typeof setter !== "object") {
					setter = { value: setter };
				}

				const offset = setter.args ? setter.args[0] : 0;
				const value = setter.value;
				const args = [offset, value].concat(
					setter.args ? setter.args.slice(1) : []
				);
				const getterArgs = setter.getterArgs || [offset];
				const check = setter.check || assert.equal;

				assert.ok(('write' + type) in view, 'jDataView does not have `write' + type + '` method.');
				view["set" + type].apply(view, args);

				const realValue = view["get" + type].apply(
					view,
					getterArgs
				);

				check(
					realValue,
					value,
					"set" +
					type +
					"(" +
					args.join(", ") +
					") != get" +
					type +
					"(" +
					getterArgs.join(", ") +
					") == " +
					realValue
				);
			});
		});
	}

	testSetters("Bytes", [
		{
			args: [1],
			getterArgs: [2, 1],
			value: [0xfe, 0xfd],
			check: compareBytes,
		},
		{
			args: [0, false],
			getterArgs: [3, 0, false],
			value: [0xfd, 0xfe, 0xff],
			check: compareBytes,
		},
	]);

	testSetters("Char", [chr(0xdf), chr(0x03), chr(0x00), chr(0xff)]);

	testSetters("String", [
		{
			args: [2],
			getterArgs: [3, 2],
			value: chr(1) + chr(2) + chr(3),
		},
		{ args: [1], getterArgs: [2, 1], value: chr(8) + chr(9) },
		{
			args: [0, "utf8"],
			getterArgs: [6, 0, "utf8"],
			value: chr(1092) + chr(1099) + chr(1074),
		},
	]);

	testSetters("Int8", [-10, 29]);

	testSetters("Uint8", [19, 129, 0, 255, 254]);

	testSetters("Int16", [-17593, 23784]);

	testSetters("Uint16", [39571, 35]);

	testSetters("Int32", [-1238748268, 69359465]);

	testSetters("Uint32", [3592756249, 257391]);

	testSetters("Float32", [
		Math.pow(2, -149),
		-Math.pow(2, -149),
		Math.pow(2, -126),
		-Math.pow(2, -126),
		-1.055058432344064e37,
		-6.568051909668895e35,
		2.30496291345398e-38,
		-0.0004920212086290121,
		6.832701044000979e-38,
		Infinity,
		-Infinity,
		0,
		{ value: NaN, check: compareWithNaN },
	]);

	testSetters("Float64", [
		Math.pow(2, -1074),
		-Math.pow(2, -1074),
		Math.pow(2, -1022),
		-Math.pow(2, -1022),
		2.426842827241402e-300,
		Infinity,
		-Infinity,
		0,
		1,
		1.0000000000000004,
		-2,
		{ value: NaN, check: compareWithNaN },
	]);

	testSetters("BigUint64", [
		{ value: 29273397577908224n, check: compareInt64 },
		{ value: 4822678189205111n, check: compareInt64 },
	]);

	testSetters("BigInt64", [
		{ value: -283686985483775n, check: compareInt64 },
		{ value: -2n, check: compareInt64 },
		{ value: 4822678189205111n, check: compareInt64 },
	]);

	// setter = {value, bitLength}
	function testBitfieldSetters(type, setters) {
		test(type, function () {
			const view = new jDataView(13);

			function eachValue(callback) {
				view.seek(0);

				setters.forEach(function (setter) {
					callback.call(view, setter.value, setter.bitLength);
				});
			}

			eachValue(function (value, bitLength) {
				view["write" + type](0, value, bitLength);
			});

			eachValue(function (value, bitLength) {
				const realValue = view["get" + type](bitLength);
				assert.equal(
					realValue,
					value,
					"write" +
					type +
					"(" +
					value +
					", " +
					bitLength +
					") != get" +
					type +
					"(" +
					bitLength +
					") == " +
					realValue
				);
			});
		});
	}

	testBitfieldSetters("Unsigned", [
		// padded to byte here
		{ value: 5, bitLength: 3 },
		{ value: 29, bitLength: 5 },
		// padded to byte here
		{ value: 19781, bitLength: 15 },
		{ value: 68741, bitLength: 17 },
		// padded to byte here
		{ value: 0xffffffff, bitLength: 32 },
		// padded to byte here
		{ value: 0x7fffffff, bitLength: 31 },
		{ value: 1, bitLength: 1 },
	]);

	testBitfieldSetters("Signed", [
		// padded to byte here
		{ value: -1, bitLength: 3 },
		{ value: -2, bitLength: 5 },
		// padded to byte here
		{ value: -258, bitLength: 15 },
		{ value: 64000, bitLength: 17 },
		// padded to byte here
		{ value: -1, bitLength: 32 },
		// padded to byte here
		{ value: -0x40000000, bitLength: 31 },
		{ value: -1, bitLength: 1 },
	]);

});
