var npm = require('npm'), env = process.env;

npm.load(function () {
	npm.registry.adduser(env.NPM_USERNAME, env.NPM_PASSWORD, env.NPM_EMAIL, function (err) {
		if (err) throw err;

		npm.config.set('email', env.NPM_EMAIL, 'user');
		npm.commands.publish(function (err) {
			if (err) throw err;
			console.log('Published to registry');
		});
	});
});