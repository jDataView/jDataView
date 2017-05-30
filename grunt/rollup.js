var uglify = require('rollup-plugin-uglify');

function uglifyOpts(isBrowser) {
	return uglify({
		compress: {
			pure_getters: true,
			global_defs: {
				NODE: !isBrowser,
				BROWSER: isBrowser
			}
		},
		mangle: isBrowser,
		output: {
			beautify: !isBrowser
		}
	});
}

module.exports = function() {
	return {
		options: {
			format: 'umd',
			legacy: true,
			moduleName: 'jDataView',
			sourceMap: true
			// sourceRoot: process.env.CI ? 'https://raw.github.com/' + process.env.TRAVIS_REPO_SLUG + '/' + process.env.TRAVIS_COMMIT : '../..'
		},
		browser: {
			options: {
				plugins: [uglifyOpts(true)]
			},
			files: {
				'dist/browser/<%= pkgName %>.js': 'src/<%= pkgName %>.js'
			}
		},
		node: {
			options: {
				plugins: [uglifyOpts(false)]
			},
			files: {
				'dist/node/<%= pkgName %>.js': 'src/<%= pkgName %>.js'
			}
		}
	};
};
