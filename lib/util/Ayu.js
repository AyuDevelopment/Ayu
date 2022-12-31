const { MissingPermissionsException } = require('./MissingPermissionsException');
const {
	Client,
	GatewayIntentBits,
	Collection,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	Message
} = require('discord.js');
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
		} catch (err) { }
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

	/**
	 * @param {Client} client
	 * @param {Message} message
	 * @param {string} text
	*/
	async pagination(client, message, text, title = "Random text", elements_per_page = 5) {
		let embeds = [], split = elements_per_page;
		for (let i = 0; i < text.length; i += split) {
			let desc = text.slice(i, elements_per_page);
			elements_per_page += split;

			let embed = new EmbedBuilder()
				.setTitle(title.toString())
				.setDescription(desc.join(" "))
				.setColor(0x2f3136)

			embeds.push(embed);
		}

		let current_page = 0;

		if (embeds.length == 1) return message.reply({ embeds: [embeds.at(0)] }).catch(() => { });

		let back = new ButtonBuilder().setStyle('Success').setCustomId('back').setLabel('←')
		let home = new ButtonBuilder().setStyle('Danger').setCustomId('home').setLabel('🏠')
		let next = new ButtonBuilder().setStyle('Success').setCustomId('next').setLabel('→')

		let embed_pages = await message.reply({
			content: `**Interact with the buttons to change pages**`,
			embeds: [embeds.at(0).setFooter({ text: `Current: ${current_page + 1} / ${embeds.length}` })],
			components: [new ActionRowBuilder().addComponents(back, home, next)]
		});

		const collector = embed_pages.createMessageComponentCollector({
			filter: i => i?.isButton() && i?.user && i?.user.id === message.author.id && i?.message.author.id === client.user.id,
			time: 180e3
		});

		collector.on('collect', async b => {
			if (b?.user.id !== message.author.id) return b?.reply("You can't use this button!");

			switch (b?.customId) {
				case 'back': {
					collector.resetTimer();

					if (current_page != 0) {
						current_page--;
						await embed_pages.edit({
							embeds: [embeds.at(current_page).setFooter({ text: `Current ${current_page + 1} / ${embeds.length}` })],
							components: [embed_pages.components.at(0)]
						}).catch(() => { });
					} else {
						current_page = embeds.length - 1;
						await embed_pages.edit({
							embeds: [embeds.at(current_page).setFooter({ text: `Current ${current_page + 1} / ${embeds.length}` })],
							components: [embed_pages.components.at(0)]
						}).catch(() => { });
						await b?.deferUpdate();
					}
					break;
				}

				case "home": {
					collector.resetTimer();

					current_page = 0;
					await embed_pages.edit({
						embeds: [embeds.at(current_page).setFooter({ text: `Current ${current_page + 1} / ${embeds.length}` })],
						components: [embed_pages.components.at(0)]
					}).catch(() => { });
					await b?.deferUpdate();

					break;
				}

				case "next": {
					collector.resetTimer();

					if (current_page < embeds.length - 1) {
						current_page++;
						await embed_pages.edit({
							embeds: [embeds.at(current_page).setFooter({ text: `Current ${current_page + 1} / ${embeds.length}` })],
							components: [embed_pages.components.at(0)]
						}).catch(() => { });
						await b?.deferUpdate();
					} else {
						current_page = 0;
						await embed_pages.edit({
							embeds: [embeds.at(current_page).setFooter({ text: `Current ${current_page + 1} / ${embeds.length}` })],
							components: [embed_pages.components.at(0)]
						}).catch(() => { });
						await b?.deferUpdate();
					}

					break;
				}

				default: break;
			}
		});

		collector.on('end', () => {
			embed_pages.components.at(0).map(b => b.disabled = true)
			embed_pages.edit({
				content: 'Collector ended!',
				embeds: [embeds.at(current_page).setFooter({ text: `Current ${current_page + 1} / ${embeds.length}` })],
				components: [embed_pages.components.at(0)]
			}).catch(() => { });
		});
	}
}