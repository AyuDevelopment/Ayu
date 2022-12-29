const { MissingPermissionsException } = require('../../util/MissingPermissionsException');
const { checkPermissions } = require('../../util/checkPermissions');
const { Event } = require('../../util/structures/event');
const { Collection } = require('discord.js');

module.exports = class ClientEvent extends Event {
    constructor(client) {
        super(client, {
            once: false
        });
    }
        
    _cooldown = new Collection();

    _prefix = '!';

    escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    async run(message) {
        const { client } = this;

        if (message.author.bot || !message.inGuild()) return;

        // const prefix = (await client._prisma.guild.findUnique({ where: { guildId: message.guild.id } }).catch(() => null)).prefix || this._prefix;
				const prefix = "!";
        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${this.escapeRegex(prefix)})\\s*`);
        if (!prefixRegex.test(message.content)) return;

        const [, matchedPrefix] = message.content.match(prefixRegex);

        const args = message.content.slice(matchedPrefix.length).trim().split(/\s+/);
        const commandName = args.shift()?.toLowerCase();

        const command = client._commands.get(commandName) ?? client._commands.find((cmd) => cmd.info.aliases?.includes(commandName));
        if (!command) return;

        if (!command.isEnabled && !process.env.OWNERS.includes(message.author.id.toString())) return;
        if (!this._cooldown.has(command.name)) this._cooldown.set(command.name, new Collection());

        const now = Date.now()
        const timestamps = this._cooldown.get(command.name);
        const cooldownAmount = (command.cooldown || 1) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`You can't use this command again for ${timeLeft} seconds.`);
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try {
            const permissionsCheck = await checkPermissions(command, message);

            if (permissionsCheck.result) {
                command.run({ this: client, message, args });
            } else {
                throw new MissingPermissionsException(permissionsCheck.missing);
            }
        } catch (e) {
            console.error(e);

            if (e.message.includes('permissions')) {
                await message.reply(`You don't have the required permissions to use this command.`);
            } else {
                await message.reply(`Something went wrong with the command.`);
            }
        }
    }
}