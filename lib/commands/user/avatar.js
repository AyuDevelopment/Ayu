const { Command } = require('../../util/structures/command');

module.exports = class UserCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'avatar',
			cooldown: 5000,
			aliases: ['av'],
			description: 'Display user\'s avatar',
		});
	}

	async run({ this: client, message, args }) {
		let user = message.mentions.users.first();
		let users;

		if (!args.at(0)) user = message.author;
		if (!user && message.guild) {
			users = client.searchMembers(message.guild, args.at(0));

			if (users.length > 1) {
				return message.reply('I find many users with that name.');
			} else if (users.length === 0) {
				return message.reply('I can\'t find any users with that name.');
			}

			user = users[0].user;
		}

		const Avatar = new (require('discord.js')).EmbedBuilder()
			.setColor("#2f3136")
			.setImage(user.displayAvatarURL({ format: "png", size: 4096 }))

		message.reply({
			embeds: [Avatar]
		});
	}
}