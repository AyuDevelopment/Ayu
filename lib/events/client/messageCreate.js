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

        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${this.escapeRegex(this._prefix)})\\s*`);
        if (!prefixRegex.test(message.content)) return;

        const [, matchedPrefix] = message.content.match(prefixRegex);

        const args = message.content.slice(matchedPrefix.length).trim().split(/\s+/);
        const commandName = args.shift()?.toLowerCase();

        const command = client._commands.get(commandName) ?? client._commands.find((cmd) => cmd.aliases?.includes(command));
        if (!command) return;

        if (!command.isEnabled && !process.env.OWNERS.includes(message.author.id.toString())) return;
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
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try {
            const permissionsCheck = await checkPermissions(command, message);

            if (permissionsCheck.result) {
                command.run(message, args);
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