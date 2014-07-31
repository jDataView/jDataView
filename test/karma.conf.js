module.exports = function (config) {
	var CI = process.env.CI;

	config.set({
		basePath: '..',
		frameworks: ['mocha', 'chai'],
		browsers: CI ? ['Firefox'] : ['Firefox', 'IE'],
		files: [
			'dist/browser/jdataview.js',
			'test/karma.mocha.conf.js',
			'test/test.js'
		],
		logLevel: CI ? config.LOG_ERROR : config.LOG_INFO,
		reporters: [CI ? 'dots' : 'progress']
	});
};