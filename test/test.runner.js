var testrunner = require('qunit');

testrunner.setup({
	log: {
		assertions: false,
		errors: true,
		tests: false,
		summary: true,
		globalSummary: false,
		testing: true
	}
});

testrunner.run({
	code: '../src/jDataView.js',
	tests: './test.js'
}, function (err, stats) {
	// ignoring PixelData support "error", counting others
	if (err || stats.failed) {
		throw new Error('Some tests failed.');
	}
});
