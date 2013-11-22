module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['src/**/*.js'],
			options: {
				jshintrc: true
			}
		},
		uglify: {
			browser: {
				options: {
					compress: {
						global_defs: {NODE: false}
					},
					sourceMap: 'dist/<%= pkg.name %>.js.map',
					sourceMapRoot: '//raw.github.com/jDataView/<%= pkg.name %>/master'
				},
				files: {
					'dist/<%= pkg.name %>.js': ['src/<%= pkg.name %>.js']
				}
			},
			node: {
				options: {
					compress: {
						global_defs: {NODE: true}
					}
				},
				files: {
					'dist/<%= pkg.name %>.node.js': ['src/<%= pkg.name %>.js']
				}
			}
		},
		release: {
			options: {
				npm: false,
				tagName: 'v<%= version %>', //default: '<%= version %>'
				github: { 
					repo: 'jDataView/jDataView', //put your user/repo here
					usernameVar: 'GITHUB_USERNAME', //ENVIRONMENT VARIABLE that contains Github username 
					passwordVar: 'GITHUB_PASSWORD' //ENVIRONMENT VARIABLE that contains Github password
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-release');

	grunt.registerTask('browser', ['jshint', 'uglify:browser']);
	grunt.registerTask('node', ['jshint', 'uglify:node']);

	grunt.registerTask('default', ['jshint', 'uglify:browser', 'uglify:node']);
	
	grunt.registerTask('publish', ['default', 'release']);
};