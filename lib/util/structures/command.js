module.exports.Command = class Command {
    constructor(client, {
        name = null,
        aliases = [],
        cooldown = 0,
        isEnabled = true,
        description = null,
    }) {
        this.client = client;
        this.info = { name, description, aliases };
        this.options = { cooldown, isEnabled }
    }
}