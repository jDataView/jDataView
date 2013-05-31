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
			source: '../src/jdataview.js',
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
					this.status === 200 ? onLoad(null, name, this.responseText) : onLoad(this.statusText, name);
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
	_isNaN = Number.isNaN || window.isNaN,
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
	});
}

function testForInt64(expected) {
	return function (value) {
		equal(Number(value), expected);
	};
}

// setter = [value, args, getterArgs, checkFn]
function testSetters(type, setters) {
	test(type, function () {
		for (var i = 0; i < setters.length; i++) {
			var setter = setters[i];

			if (!(setter instanceof Array)) {
				setter = [setter];
			}

			var value = setter[0],
				args = setter[1] instanceof Array ? setter[1] : [setter[1] || 0],
				offset = args[0],
				getterArgs = setter[2] === undefined ? [offset] : setter[2] instanceof Array ? setter[2] : [setter[2]],
				check = setter[3] || equal;

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

		module('Value Read');

		testGetters('Bytes', [
			[function (bytes) { deepEqual(Array.prototype.slice.call(bytes), [0xfe, 0xfd]) }, [2, 1]],
			[function (bytes) { deepEqual(Array.prototype.slice.call(bytes), [0xfd, 0xfe, 0xff]) }, [3, 0, false]]
		]);

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
			[chr(127) + chr(0) + chr(1) + chr(65) + chr(66), 5, b(127, 0, 1, 65, 66)],
			[chr(1092) + chr(1099) + chr(1074), [, , 'utf8'], b(0xd1, 0x84, 0xd1, 0x8b, 0xd0, 0xb2)]
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

		testGetters('Int64', [
			[testForInt64(-283686985483775), [0, false]],
			[testForInt64(-2), , b(0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe)],
			[testForInt64(4822678189205111), , b(0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77)]
		]);

		module('Value Write', {
			teardown: function () {
				view.setBytes(0, dataBytes.slice(dataStart), true);
			}
		});

		testSetters('Char', [
			chr(0xdf),
			chr(0x03),
			chr(0x00),
			chr(0xff)
		]);

		testSetters('String', [
			[chr(1) + chr(2) + chr(3), 2, [3, 2]],
			[chr(8) + chr(9), 1, [2, 1]],
			[chr(1092) + chr(1099) + chr(1074), [0, 'utf8'], [6, 0, 'utf8']]
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
			[NaN, , , function (value) { ok(isNaN(value)) }]
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
			[NaN, , , function (value) { ok(isNaN(value)) }]
		]);

		testSetters('Int64', [
			[-283686985483775, , , testForInt64(-283686985483775)],
			[-2, , , testForInt64(-2)],
			[4822678189205111, , , testForInt64(4822678189205111)]
		]);

		test('slice', function () {
			try {
				view.slice(5, 10);
				ok(false);
			} catch(e) {
				ok(true);
			}

			var pointerCopy = view.slice(1, 4);
			deepEqual(Array.prototype.slice.call(pointerCopy.getBytes()), [0xfe, 0xfd, 0xfc]);
			pointerCopy.setChar(0, chr(1));
			equal(view.getChar(1), chr(1));
			pointerCopy.setChar(0, chr(0xfe));

			var copy = view.slice(1, 4, true);
			deepEqual(Array.prototype.slice.call(copy.getBytes()), [0xfe, 0xfd, 0xfc]);
			copy.setChar(0, chr(1));
			notEqual(view.getChar(1), chr(1));
		});
	}

	module('');

	test('Supported', function () {
		ok(isSupported);
	});
}

QUnit.testDone(function (test) {
	if (test.name === 'Supported') {
		compatibility[test.module] = false;
		testNextEngine();
	}
});

testNextEngine();