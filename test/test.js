if (typeof require !== 'undefined') {
	if (typeof jDataView === 'undefined') {
		jDataView = require('..');
	}

	if (typeof JSHINT === 'undefined') {
		JSHINT = require('jshint').JSHINT;
	}
}

if (typeof JSHINT !== 'undefined') {
	asyncTest('JSHint', function () {
		var paths = {
			source: '../src/jDataView.js',
			options: '../src/.jshintrc'
		},
		contents = {};

		function onLoad(err, name, text) {
			if (err) {
				start();
				return ok(false, 'Error while loading ' + name + ': ' + err);
			}

			contents[name] = text;
			for (var name in paths) {
				if (!(name in contents)) {
					return;
				}
			}

			var options = JSON.parse(contents.options), globals = options.globals;
			delete options.globals;

			start();

			if (JSHINT(contents.source, options, globals)) {
				ok(true);
			} else {
				var errors = JSHINT.errors;
				for (var i = 0, length = errors.length; i < length; i++) {
					var error = errors[i];
					if (error) {
						ok(false, 'Line ' + error.line + ', character ' + error.character + ': ' + error.reason);
					}
				}
			}
		}

		function load(name) {
			if (typeof XMLHttpRequest !== 'undefined') {
				var ajax = new XMLHttpRequest();
				ajax.onload = function () {
					(this.status === 0 || this.status === 200) ? onLoad(null, name, this.responseText) : onLoad(this.statusText, name);
				};
				ajax.open('GET', paths[name], true);
				ajax.send();
			} else {
				require('fs').readFile(paths[name], function (err, data) {
					onLoad(err, name, String(data));
				});
			}
		}

		for (var name in paths) {
			load(name);
		}
	});
}

var
	test = QUnit.test,
	chr = String.fromCharCode,
	// workaround for http://code.google.com/p/v8/issues/detail?id=2578
	_isNaN = Number.isNaN || (function () { return this })().isNaN,
	isNaN = function (obj) {
		return _isNaN(obj) || (typeof obj === 'number' && obj.toString() === 'NaN');
	},
	dataBytes = [
		0x00,
		0xff, 0xfe, 0xfd, 0xfc,
		0xfa, 0x00, 0xba, 0x01
	],
	dataStart = 1,
	compatibility = jDataView.prototype.compatibility,
	engines = [],
	view,
	engineName;

compatibility.Array = true;

for (engineName in compatibility) {
	engines.push(engineName);
}

function b() {
	return new jDataView(arguments);
}

function compareInt64(value, expected) {
	equal(Number(value), expected);
}

function compareBytes(value, expected) {
	deepEqual(Array.prototype.slice.call(value), expected);
}

function compareWithNaN(value) {
	ok(isNaN(value));
}

function module(name) {
	name = engineName + (name ? ': ' + name : '');
	QUnit.module.apply(this, arguments);
}

function testBounds(type) {
	var args = Array.prototype.slice.call(arguments, 1);
	test(type, function () {
		try {
			view['get' + type].apply(view, args);
			ok(false);
		} catch(e) {
			ok(true);
		}
	});
}

// getter = value || {value, check?, view?, args?}
function testGetters(type, getters) {
	test(type, function () {
		for (var i = 0; i < getters.length; i++) {
			var getter = getters[i];

			if (typeof getter !== 'object') {
				getter = {value: getter};
			}

			var args = getter.args || [],
				contextView = getter.view || view,
				check = getter.check || equal,
				value = getter.value;

			check(contextView['get' + type].apply(contextView, args), value);
		}
	});
}

// setter = value || {value, args?, getterArgs?, check?}
function testSetters(type, setters) {
	test(type, function () {
		for (var i = 0; i < setters.length; i++) {
			var setter = setters[i];

			if (typeof setter !== 'object') {
				setter = {value: setter};
			}

			var args = setter.args || [0],
				offset = args[0],
				getterArgs = setter.getterArgs || [offset],
				check = setter.check || equal,
				value = setter.value;

			view['set' + type].apply(view, [offset, value].concat(args.slice(1)));
			check(view['get' + type].apply(view, getterArgs), value);
		}
	});
}

function testNextEngine() {
	engineName = engines.shift();

	if (!engineName) return;

	var isSupported = compatibility[engineName];

	if (isSupported) {
		view = new jDataView(dataBytes.slice(), dataStart, undefined, true);

		module('Bound Check');

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

		module('Value Read', {
			teardown: function () {
				view.seek(0);
			}
		});

		testGetters('Bytes', [
			{args: [2, 1], value: [0xfe, 0xfd], check: compareBytes},
			{args: [3, 0, false], value: [0xfd, 0xfe, 0xff], check: compareBytes}
		]);

		testGetters('Char', [
			chr(0xff),
			chr(0xfe),
			chr(0xfd),
			chr(0xfc),
			chr(0xfa),
			chr(0),
			chr(0xba),
			chr(1)
		]);

		testGetters('String', [
			{args: [1, 0], value: chr(0xff)},
			{args: [1, 5], value: chr(0)},
			{args: [1, 7], value: chr(1)},
			{view: b(127, 0, 1, 65, 66), args: [5], value: chr(127) + chr(0) + chr(1) + chr(65) + chr(66)},
			{view: b(0xd1, 0x84, 0xd1, 0x8b, 0xd0, 0xb2), args: [, , 'utf8'], value: chr(1092) + chr(1099) + chr(1074)}
		]);

		test('Big String', function () {
			var view = new jDataView(2000000);
			try {
				view.getString();
				ok(true);
			} catch(e) {
				ok(false);
			}
		});

		testGetters('Int8', [
			-1,
			-2,
			-3,
			-4,
			-6,
			0,
			-70,
			1
		]);

		testGetters('Uint8', [
			255,
			254,
			253,
			252,
			250,
			0,
			186,
			1
		]);

		testGetters('Int16', [
			{args: [0], value: -257},
			{args: [1], value: -514},
			{args: [2], value: -771},
			{args: [3], value: -1284},
			{args: [4], value: 250},
			{args: [5], value: -17920},
			{args: [6], value: 442}
		]);

		testGetters('Uint16', [
			{args: [0], value: 65279},
			{args: [1], value: 65022},
			{args: [2], value: 64765},
			{args: [3], value: 64252},
			{args: [4], value: 250},
			{args: [5], value: 47616},
			{args: [6], value: 442}
		]);

		testGetters('Uint32', [
			{args: [0], value: 4244504319},
			{args: [1], value: 4210884094},
			{args: [2], value: 16448765},
			{args: [3], value: 3120626428},
			{args: [4], value: 28967162}
		]);

		testGetters('Int32', [
			{args: [0], value: -50462977},
			{args: [1], value: -84083202},
			{args: [2], value: 16448765},
			{args: [3], value: -1174340868},
			{args: [4], value: 28967162}
		]);

		testGetters('Float32', [
			{args: [0], value: -1.055058432344064e+37},
			{args: [1], value: -6.568051909668895e+35},
			{args: [2], value: 2.30496291345398e-38},
			{args: [3], value: -0.0004920212086290121},
			{args: [4], value: 6.832701044000979e-38},
			{view: b(0x7f, 0x80, 0x00, 0x00), value: Infinity},
			{view: b(0xff, 0x80, 0x00, 0x00), value: -Infinity},
			{view: b(0x00, 0x00, 0x00, 0x00), value: 0},
			{view: b(0xff, 0x80, 0x00, 0x01), check: compareWithNaN}
		]);

		testGetters('Float64', [
			{args: [0], value: 2.426842827241402e-300},
			{view: b(0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: Infinity},
			{view: b(0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: -Infinity},
			{view: b(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: 0},
			{view: b(0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: -0},
			{view: b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: 1},
			{view: b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01), value: 1.0000000000000002},
			{view: b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02), value: 1.0000000000000004},
			{view: b(0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: 2},
			{view: b(0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: -2},
			{view: b(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01), value: 5e-324},
			{view: b(0x00, 0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff), value: 2.225073858507201e-308},
			{view: b(0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: 2.2250738585072014e-308},
			{view: b(0x7f, 0xef, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff), value: 1.7976931348623157e+308},
			{view: b(0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01), check: compareWithNaN}
		]);

		testGetters('Uint64', [
			{view: b(0x00, 0x67, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe), value: 29273397577908224, check: compareInt64},
			{view: b(0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77), value: 4822678189205111, check: compareInt64}
		]);

		testGetters('Int64', [
			{args: [0, false], value: -283686985483775, check: compareInt64},
			{view: b(0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe), value: -2, check: compareInt64},
			{view: b(0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77), value: 4822678189205111, check: compareInt64}
		]);

		module('Value Write', {
			teardown: function () {
				view.setBytes(0, dataBytes.slice(dataStart), true);
			}
		});

		testSetters('Bytes', [
			{args: [1], getterArgs: [2, 1], value: [0xfe, 0xfd], check: compareBytes},
			{args: [0, false], getterArgs: [3, 0, false], value: [0xfd, 0xfe, 0xff], check: compareBytes}
		]);

		testSetters('Char', [
			chr(0xdf),
			chr(0x03),
			chr(0x00),
			chr(0xff)
		]);

		testSetters('String', [
			{args: [2], getterArgs: [3, 2], value: chr(1) + chr(2) + chr(3)},
			{args: [1], getterArgs: [2, 1], value: chr(8) + chr(9)},
			{args: [0, 'utf8'], getterArgs: [6, 0, 'utf8'], value: chr(1092) + chr(1099) + chr(1074)}
		]);

		testSetters('Int8', [
			-10,
			29
		]);

		testSetters('Uint8', [
			19,
			129,
			0,
			255,
			254
		]);

		testSetters('Int16', [
			-17593,
			23784
		]);

		testSetters('Uint16', [
			39571,
			35
		]);

		testSetters('Int32', [
			-1238748268,
			69359465
		]);

		testSetters('Uint32', [
			3592756249,
			257391
		]);

		testSetters('Float32', [
			Math.pow(2, -149),
			-Math.pow(2, -149),
			Math.pow(2, -126),
			-Math.pow(2, -126),
			-1.055058432344064e+37,
			-6.568051909668895e+35,
			2.30496291345398e-38,
			-0.0004920212086290121,
			6.832701044000979e-38,
			Infinity,
			-Infinity,
			0,
			{value: NaN, check: compareWithNaN}
		]);

		testSetters('Float64', [
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
			{value: NaN, check: compareWithNaN}
		]);

		testSetters('Uint64', [
			{value: 29273397577908224, check: compareInt64},
			{value: 4822678189205111, check: compareInt64}
		]);

		testSetters('Int64', [
			{value: -283686985483775, check: compareInt64},
			{value: -2, check: compareInt64},
			{value: 4822678189205111, check: compareInt64}
		]);

		test('slice', function () {
			try {
				view.slice(5, 10);
				ok(false);
			} catch(e) {
				ok(true);
			}

			var pointerCopy = view.slice(1, 4);
			compareBytes(pointerCopy.getBytes(), [0xfe, 0xfd, 0xfc]);
			pointerCopy.setChar(0, chr(1));
			equal(view.getChar(1), chr(1));
			pointerCopy.setChar(0, chr(0xfe));

			var copy = view.slice(1, 4, true);
			compareBytes(copy.getBytes(), [0xfe, 0xfd, 0xfc]);
			copy.setChar(0, chr(1));
			notEqual(view.getChar(1), chr(1));
		});
	}

	module('');

	test('Support check', function () {
		ok(true, engineName + ' is' + (isSupported ? '' : ' not') + ' supported.');
	});
}

QUnit.testDone(function (test) {
	if (test.name === 'Support check') {
		compatibility[test.module] = false;
		testNextEngine();
	}
});

testNextEngine();