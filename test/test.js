
if (typeof jDataView === 'undefined') {
	jDataView = require('..');
}
var module = QUnit.module;
var test = QUnit.test;

var buffer = jDataView.createBuffer(
	0x00,
	0xff, 0xfe, 0xfd, 0xfc,
	0xfa, 0x00, 0xba, 0x01);
var view = new jDataView(buffer, 1, undefined, true);

function b() {
	return new jDataView(jDataView.createBuffer.apply(this, arguments));
}

module('Engine support');

test('Array Buffer', function () {
	equal(jDataView.prototype.compatibility.ArrayBuffer, true);
});
test('Data View', function () {
	equal(jDataView.prototype.compatibility.DataView, true);
});
test('Node Buffer', function () {
	equal(jDataView.prototype.compatibility.NodeBuffer, true);
});

module('Bound Check');

test('Char', function () {
	try { view.getChar(8); ok(false); } catch (e) { ok(true, e); }
});
test('String', function () {
	try { view.getString(2, 7); ok(false); } catch (e) { ok(true, e); }
});
test('Int8', function () {
	try { view.getInt8(8); ok(false); } catch (e) { ok(true, e); }
});
test('Uint8', function () {
	try { view.getUint8(8); ok(false); } catch (e) { ok(true, e); }
});
test('Char', function () {
	try { view.getChar(8); ok(false); } catch (e) { ok(true, e); }
});
test('Int16', function () {
	try { view.getInt16(7); ok(false); } catch (e) { ok(true, e); }
});
test('Uint16', function () {
	try { view.getUint16(7); ok(false); } catch (e) { ok(true, e); }
});
test('Int32', function () {
	try { view.getInt32(5); ok(false); } catch (e) { ok(true, e); }
});
test('Uint32', function () {
	try { view.getUint32(5); ok(false); } catch (e) { ok(true, e); }
});
test('Float32', function () {
	try { view.getFloat32(5); ok(false); } catch (e) { ok(true, e); }
});
test('Float64', function () {
	try { view.getFloat64(1); ok(false); } catch (e) { ok(true, e); }
});

module('Value Read');

function chr (x) {
	return String.fromCharCode(x);
}

test('Char', function () {
	equal(view.getChar(0), chr(0xff));
	equal(view.getChar(1), chr(0xfe));
	equal(view.getChar(2), chr(0xfd));
	equal(view.getChar(3), chr(0xfc));
	equal(view.getChar(4), chr(0xfa));
	equal(view.getChar(5), chr(0));
	equal(view.getChar(6), chr(0xba));
	equal(view.getChar(7), chr(1));
});

test('String', function () {
	equal(view.getString(1, 0), chr(0xff));
	equal(view.getString(1, 5), chr(0));
	equal(view.getString(1, 7), chr(1));
	equal(b(127, 0, 1, 65, 66).getString(5), chr(127) + chr(0) + chr(1) + chr(65) + chr(66));
});

test('Int8', function () {
	equal(view.getInt8(0), -1);
	equal(view.getInt8(1), -2);
	equal(view.getInt8(2), -3);
	equal(view.getInt8(3), -4);
	equal(view.getInt8(4), -6);
	equal(view.getInt8(5), 0);
	equal(view.getInt8(6), -70);
	equal(view.getInt8(7), 1);
});

test('Uint8', function () {
	equal(view.getUint8(0), 255);
	equal(view.getUint8(1), 254);
	equal(view.getUint8(2), 253);
	equal(view.getUint8(3), 252);
	equal(view.getUint8(4), 250);
	equal(view.getUint8(5), 0);
	equal(view.getUint8(6), 186);
	equal(view.getUint8(7), 1);
});

test('Int16', function () {
	equal(view.getInt16(0), -257);
	equal(view.getInt16(1), -514);
	equal(view.getInt16(2), -771);
	equal(view.getInt16(3), -1284);
	equal(view.getInt16(4), 250);
	equal(view.getInt16(5), -17920);
	equal(view.getInt16(6), 442);
});

test('Uint16', function () {
	equal(view.getUint16(0), 65279);
	equal(view.getUint16(1), 65022);
	equal(view.getUint16(2), 64765);
	equal(view.getUint16(3), 64252);
	equal(view.getUint16(4), 250);
	equal(view.getUint16(5), 47616);
	equal(view.getUint16(6), 442);
});

test('Uint32', function () {
	equal(view.getUint32(0), 4244504319);
	equal(view.getUint32(1), 4210884094);
	equal(view.getUint32(2), 16448765);
	equal(view.getUint32(3), 3120626428);
	equal(view.getUint32(4), 28967162);
});

test('Int32', function () {
	equal(view.getInt32(0), -50462977);
	equal(view.getInt32(1), -84083202);
	equal(view.getInt32(2), 16448765);
	equal(view.getInt32(3), -1174340868);
	equal(view.getInt32(4), 28967162);
});

test('Float32', function () {
	equal(view.getFloat32(0), -1.055058432344064e+37);
	equal(view.getFloat32(1), -6.568051909668895e+35);
	equal(view.getFloat32(2), 2.30496291345398e-38);
	equal(view.getFloat32(3), -0.0004920212086290121);
	equal(view.getFloat32(4), 6.832701044000979e-38);
	equal(b(0x7f, 0x80, 0x00, 0x00).getFloat32(), Infinity)
	equal(b(0xff, 0x80, 0x00, 0x00).getFloat32(), -Infinity)
	equal(b(0x00, 0x00, 0x00, 0x00).getFloat32(), 0);
	ok(isNaN(b(0xff, 0x80, 0x00, 0x01).getFloat32()))
});

test('Float64', function () {
	equal(view.getFloat64(0), 2.426842827241402e-300);
	equal(b(0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00).getFloat64(), Infinity)
	equal(b(0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00).getFloat64(), -Infinity)
	equal(b(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00).getFloat64(), 0);
	equal(b(0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00).getFloat64(), -0);
	equal(b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00).getFloat64(), 1);
	equal(b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01).getFloat64(), 1.0000000000000002);
	equal(b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02).getFloat64(), 1.0000000000000004);
	equal(b(0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00).getFloat64(), 2);
	equal(b(0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00).getFloat64(), -2);
	equal(b(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01).getFloat64(), 5e-324);
	equal(b(0x00, 0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff).getFloat64(), 2.225073858507201e-308);
	equal(b(0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00).getFloat64(), 2.2250738585072014e-308);
	equal(b(0x7f, 0xef, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff).getFloat64(), 1.7976931348623157e+308);
	ok(isNaN(b(0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01).getFloat64()))
});
