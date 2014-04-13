module.exports = function (grunt) {
	return {
		options: {
			separator: Array(3).join(grunt.util.linefeed),
			sourceRoot: process.env.CI ? 'https://raw.github.com/' + process.env.TRAVIS_REPO_SLUG + '/' + process.env.TRAVIS_COMMIT : '../..'
		},
		all: {
			files: {
				'dist/<%= pkgName %>.js': [
					'umd/header.js',
					'src/jdataview.js',
					'umd/footer.js'
				]
			}
		}
	};
};