module.exports = function(config) {
	var CI = process.env.CI;

	var browsers = ['PhantomJS'];

	if (CI) {
		browsers.push('Firefox');
	} else {
		browsers.push('ChromeCanary', 'FirefoxDeveloper');

		if (process.platform === 'win32') {
			browsers.push('IE', 'Edge');
		} else if (process.platform === 'darwin') {
			browsers.push('Safari');
		}
	}

	config.set({
		basePath: '..',
		frameworks: ['mocha', 'chai'],
		browsers: browsers,
		files: [
			'dist/browser/jdataview.js',
			'test/karma.mocha.conf.js',
			'test/test.js'
		],
		logLevel: CI ? config.LOG_ERROR : config.LOG_INFO,
		reporters: [CI ? 'dots' : 'progress']
	});
};
