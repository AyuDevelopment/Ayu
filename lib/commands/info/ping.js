const { Command } = require('../../util/structures/command');

module.exports = class UserCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            cooldown: 5,
            aliases: ['pong'],
            description: 'Pong!',
        });
    }

    async run({ message }) {
        message.reply(`${this.client.ws.ping}ms`);
    }
}