module.exports.Command = class Command {
    constructor(client, {
        name = null,
        aliases = [],
        cooldown = 0,
        isEnabled = true,
        description = null,
    }) {
			/**
				* @type {import('discord.js').Client}
			*/
        this.client = client;
        this.info = { name, description, aliases };
        this.options = { cooldown, isEnabled }
    }
}