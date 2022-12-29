const { Command } = require('../../util/structures/command');

module.exports = class UserCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'prefix',
            cooldown: 5000,
            description: 'Config your prefix',
        });
    }

    async run({ message, args }) {
        const { client } = this;
        const { guildId } = message;

        const prefix = args[0];

        if (!prefix) return message.reply('Please provide the new prefix');

        let newData = await client._prisma.guild.update({ where: { guildId }, data: { prefix } }).catch(() => null);
        if (!newData) newData = await client._prisma.guild.create({ data: { prefix, guildId } });

        return message.reply(`New prefix is ${newData.prefix}`);
    }
}