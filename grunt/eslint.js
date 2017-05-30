module.exports = function() {
	return {
		toplevel: {
			options: {
				configFile: '.eslintrc'
			},
			src: ['+(test|grunt)/**/*.js', '*.js']
		},
		src: {
			options: {
				configFile: 'src/.eslintrc'
			},
			src: 'src/**/*.js'
		}
	};
};
