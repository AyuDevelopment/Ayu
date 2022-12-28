const { Client, GatewayIntentBits } = require('discord.js');

module.exports = class Ayu extends Client {
	constructor() {
		super({
			allowedMentions: {
				repliedUser: true,
				parse: ["roles", "users"],
				intents: [
					GatewayIntentBits.Guilds,
					GatewayIntentBits.GuildMembers,
					GatewayIntentBits.GuildBans,
					GatewayIntentBits.GuildEmojisAndStickers,
					GatewayIntentBits.GuildInvites,
					GatewayIntentBits.GuildVoiceStates,
					GatewayIntentBits.GuildPresences,
					GatewayIntentBits.GuildMessages,
					GatewayIntentBits.MessageContent,
				]
			},
		})
	}

	static async login() {
		await super.login();
	}
}