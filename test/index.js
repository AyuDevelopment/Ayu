const { DISCORD_TOKEN } = require('../config.json');
const fetch = require('node-fetch');

(async () => {
	const x = await fetch("https://discord.com/api/v10/experiments?with_guild_experiments=true", {
		headers: {
			"Authorization": "Bot " + DISCORD_TOKEN
		}
	})
	.then((res) => res.json());
	console.log(x);
})();