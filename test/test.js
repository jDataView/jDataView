
if (typeof jDataView === 'undefined') {
	jDataView = require('..');
}
var module = QUnit.module;
var test = QUnit.test;

var dataBytes = [
	0x00,
	0xff, 0xfe, 0xfd, 0xfc,
	0xfa, 0x00, 0xba, 0x01
];
var dataStart = 1;
var buffer = jDataView.createBuffer.apply(jDataView, dataBytes);
var view = new jDataView(buffer, dataStart, undefined, true);

function b() {
	return new jDataView(jDataView.createBuffer.apply(jDataView, arguments));
}

module('Engine support');

function testEngine(name) {
	test(name, function () {
	    ok(jDataView.prototype.compatibility[name]);
	});
}

testEngine('ArrayBuffer');
testEngine('DataView');
testEngine('NodeBuffer');

module('Bound Check');

function testBounds(type) {
	var args = Array.prototype.slice.call(arguments, 1);
	test(type, function () {
	    try {
		    view['get' + type].apply(view, args);
		    ok(false);
	    } catch(e) {
		    ok(true, e);
	    }
	});
}

testBounds('Char', 8);
testBounds('String', 2, 7);
testBounds('Int8', 8);
testBounds('Uint8', 8);
testBounds('Char', 8);
testBounds('Int16', 7);
testBounds('Uint16', 7);
testBounds('Int32', 5);
testBounds('Uint32', 5);
testBounds('Float32', 5);
testBounds('Float64', 1);

module('Value Read');

function chr (x) {
	return String.fromCharCode(x);
}

// getter = [value || checkFn, args, view]
function testGetters(type, getters) {
	test(type, function () {
	    for (var i = 0; i < getters.length; i++) {
		    var getter = getters[i];

		    if (!(getter instanceof Array)) {
			    getter = [getter];
		    }

		    var value = getter[0],
			    args = getter[1] === undefined ? [] : getter[1] instanceof Array ? getter[1] : [getter[1]],
			    contextView = getter[2] || view,
			    check = value instanceof Function ? value : equal;

		    check(contextView['get' + type].apply(contextView, args), value);
	    }
	})
}

testGetters('Char', [
	[chr(0xff), 0],
	chr(0xfe),
	chr(0xfd),
	chr(0xfc),
	chr(0xfa),
	chr(0),
	chr(0xba),
	chr(1)
]);

testGetters('String', [
	[chr(0xff), [1, 0]],
	[chr(0), [1, 5]],
	[chr(1), [1, 7]],
	[chr(127) + chr(0) + chr(1) + chr(65) + chr(66), 5, b(127, 0, 1, 65, 66)]
]);

testGetters('Int8', [
	[-1, 0],
	-2,
	-3,
	-4,
	-6,
	0,
	-70,
	1
]);

testGetters('Uint8', [
	[255, 0],
	254,
	253,
	252,
	250,
	0,
	186,
	1
]);

testGetters('Int16', [
	[-257, 0],
	[-514, 1],
	[-771, 2],
	[-1284, 3],
	[250, 4],
	[-17920, 5],
	[442, 6]
]);

testGetters('Uint16', [
	[65279, 0],
	[65022, 1],
	[64765, 2],
	[64252, 3],
	[250, 4],
	[47616, 5],
	[442, 6]
]);

testGetters('Uint32', [
	[4244504319, 0],
	[4210884094, 1],
	[16448765, 2],
	[3120626428, 3],
	[28967162, 4]
]);

testGetters('Int32', [
	[-50462977, 0],
	[-84083202, 1],
	[16448765, 2],
	[-1174340868, 3],
	[28967162, 4]
]);

testGetters('Float32', [
	[-1.055058432344064e+37, 0],
	[-6.568051909668895e+35, 1],
	[2.30496291345398e-38, 2],
	[-0.0004920212086290121, 3],
	[6.832701044000979e-38, 4],
	[Infinity, , b(0x7f, 0x80, 0x00, 0x00)],
	[-Infinity, , b(0xff, 0x80, 0x00, 0x00)],
	[0, , b(0x00, 0x00, 0x00, 0x00)],
	[function (value) { ok(isNaN(value)) }, , b(0xff, 0x80, 0x00, 0x01)]
]);

testGetters('Float64', [
	[2.426842827241402e-300, 0],
	[Infinity, , b(0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)],
	[-Infinity, , b(0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)],
	[0, , b(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)],
	[-0, , b(0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)],
	[1, , b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)],
	[1.0000000000000002, , b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01)],
	[1.0000000000000004, , b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02)],
	[2, , b(0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)],
	[-2, , b(0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)],
	[5e-324, , b(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01)],
	[2.225073858507201e-308, , b(0x00, 0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff)],
	[2.2250738585072014e-308, , b(0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)],
	[1.7976931348623157e+308, , b(0x7f, 0xef, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff)],
	[function (value) { ok(isNaN(value)) }, , b(0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01)]
]);
