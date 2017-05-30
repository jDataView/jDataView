module.exports = {
	options: {
		atBegin: true,
		interrupt: true
	},
	all: {
		files: ['+(src|test|grunt)/**/*.js', '*.js'],
		tasks: ['build', 'karma:watch:run', 'mochaTest:node']
	}
};