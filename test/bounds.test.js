import { getPrefilledJDataView, } from "./test-helpers";
import { describe, test, assert } from 'vitest'


describe('Bounds', function () {
	const view = getPrefilledJDataView();

	function testBounds(type, ...args) {
		test(type, function () {
			assert.Throw(function () {
				view["get" + type].apply(view, args);
			});
		});
	}

	testBounds("Char", 8);
	testBounds("String", 2, 7);
	testBounds("Int8", 8);
	testBounds("Uint8", 8);
	testBounds("Char", 8);
	testBounds("Int16", 7);
	testBounds("Uint16", 7);
	testBounds("Int32", 5);
	testBounds("Uint32", 5);
	testBounds("Float32", 5);
	testBounds("Float64", 1);
});
