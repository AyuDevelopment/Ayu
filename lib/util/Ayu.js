const { MissingPermissionsException } = require('./MissingPermissionsException');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { checkPermissions } = require('./checkPermissions');
const { loadHandlers } = require('./handlers');
const { prisma } = require('./database');

module.exports = class Ayu extends Client {
	/**
		* @param {string} str
		* @private
	*/
	_commands = new Collection();
    _prisma = prisma;

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
		});

		this.on('error', console.error);
		this.on('warn', (info) => console.log(info));
	}

	async login() {
		await super.login();
		loadHandlers(this);
        this._prisma.$connect()
            .then(console.log('Connected to Postgres'))
            .catch(console.log);
	}

	static parse(data) {
		try {
			return JSON.parse(data);
		} catch {
			return null;
		}
	}
}