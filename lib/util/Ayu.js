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

	/**
		* @param {import('discord.js').Guild} guild
		* @param {string} query
	*/
	 	async searchMembers(guild, query) {
		if (!query) return;
		query = query.toLowerCase();

		let a = [], b;

		try {
			b = guild.members.cache.find(x => x.displayName.toLowerCase() == query);
			if (!b) guild.members.cache.find(x => x.user.username.toLowerCase() == query);
		} catch (err) {}
		if (b) a.push(b);
		
		guild.members.cache.forEach(member => {
			if (
				(member.displayName.toLowerCase().startsWith(query) ||
					member.user.tag.toLowerCase().startsWith(query)) &&
				member.id != (b && b.id)
			) { a.push(member); }
		});
		
		return a;
	}

	// await client.wait(1000) para pausar 1 segundo
	 	async wait(ms) {
		return new Promise((resolve, reject) => {
			setTimeout(resolve, ms);
		});
	}
}