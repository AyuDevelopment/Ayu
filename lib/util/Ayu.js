const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { load } = require('./handlers');
const { checkPermissions } = require('./checkPermissions');;
const { MissingPermissionsException } = require('./MissingPermissionsException');

module.exports = class Ayu extends Client {
	/**
	 * @readonly
	*/
	prefix = '!';
	/**
		* @param {string} str
		* @private
	*/
	escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	_commands = new Collection();
	_cooldown = new Collection(); // Algo así lo considero: Collection<string, Collection<Snowflake, number>>

	/**
		 * @param {Client} client
	 */
	constructor(client) {
		this.client = client;

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

		client.on('error', console.error);
		client.on('warn', (info) => console.log(info));

		this.onMessageCreate();
	}

	async login() {
		await super.login();
		load(this);
	}

	static parse(data) {
		try {
			return JSON.parse(data);
		} catch {
			return null;
		}
	}

	/**
	/* @private
	*/
	async onMessageCreate() {
		this.client.on('messageCreate', (message) => {
			if (message.author.bot || !message.inGuild()) return;

			const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${this.escapeRegex(this.prefix)})\\s*`);
			if (!prefixRegex.test(message.content)) return;

			const [, matchedPrefix] = message.content.match(prefixRegex);

			const args = message.content.slice(matchedPrefix.length).trim().split(/\s+/);
			const commandName = args.shift()?.toLowerCase();

			const command = this._commands.get(commandName) ?? this._commands.find((cmd) => cmd.aliases?.includes(command));
			if (!command) return;

			if (!this._cooldown.has(command.name)) this._cooldown.set(command.name, new Collection());

			const now = Date.now()
			const timestamps = this._cooldown.get(command.name);
			const cooldownAmount = (command.cooldown || 1) * 1000;

			if (timestamps.has(message.author.id)) {
				const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

				if (now < expirationTime) {
					const timeLefr = (expirationTime - now) / 1000;
					return message.reply(`You can't use this command again for ${timeLefr} seconds.`);
				}
			}

			timestamps.set(message.author.id, now);
			setTimeput(() => timestamps.delete(message.author.id), cooldownAmount);

			try {
				const permissionsCheck = await checkPermissions(command, message);

				if (permissionsCheck.result) {
					command.run(this, message, args);
				} else {
					throw new MissingPermissionsException(permissionsCheck.missing);
				}
			} catch (e) {
				console.error(e);

				if (e.message.includes('permissions')) {
					message.reply(`You don't have the required permissions to use this command.`);
				} else {
					message.reply(`Something went wrong with the command.`);
				}
			}
		});
	}
}