module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		repo: 'jDataView/jDataView',
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
					sourceMapRoot: '//raw.github.com/<%= repo %>/master',
					sourceMappingURL: '<%= pkg.name %>.js.map'
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
		component: {
			repo: '<%= repo %>',
			main: 'dist/<%= pkg.name %>.js',
			scripts: ['<%= component.main %>'],
			license: '<%= pkg.licenses[0].type %>'
		},
		release: {
			options: {
				tagName: 'v<%= version %>', //default: '<%= version %>'
				github: { 
					repo: '<%= repo %>', //put your user/repo here
					usernameVar: 'GITHUB_USERNAME', //ENVIRONMENT VARIABLE that contains Github username 
					passwordVar: 'GITHUB_PASSWORD' //ENVIRONMENT VARIABLE that contains Github password
				}
			}
		}
	});

	grunt.registerTask('component', 'Build component.json', function () {
		var component = Object.create(null);

		function mergeOpts(source, keys) {
			(keys || Object.keys(source)).forEach(function (key) {
				component[key] = source[key];
			});
		}

		mergeOpts(grunt.config('pkg'), ['name', 'description', 'version', 'keywords']);
		mergeOpts(grunt.config('component'));

		grunt.file.write('component.json', JSON.stringify(component, true, 2));
		grunt.log.ok('component.json written');
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-release');

	grunt.registerTask('build:browser', ['uglify:browser', 'component']);
	grunt.registerTask('build:node', ['uglify:node']);

	grunt.registerTask('default', ['jshint', 'build:browser', 'build:node']);
	
	grunt.registerTask('publish', ['default', 'release']);
};