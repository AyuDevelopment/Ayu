const { Client, GatewayIntentBits } = require('discord.js');

module.exports = class Ayu extends Client {
	constructor() {
		super({
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
			],
			allowedMentions: {
				repliedUser: true,
				parse: ["roles", "users"],
			},
		})
	}

	static async login() {
		await super.login();
	}
}