module.exports = function (grunt) {
	var jshintrc = grunt.file.readJSON('src/.jshintrc');
	jshintrc.reporter = require('jshint-stylish');

	return {
		options: jshintrc,
		grunt: {
			options: {
				camelcase: false,
				es3: false
			},
			src: 'grunt/**/*.js'
		},
		before_concat: {
			options: {
				undef: false, // ignore access to undefined vars since they may be defined in other files
				'-W079': true, // ignore redefinition of "global" vars since they are actually local
				'-W020': true // ...and ignore writing to read-only "global" vars
			},
			src: ['+(src|test)/**/*.js', '*.js']
		}
	};
};