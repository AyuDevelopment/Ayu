const { Command } = require('../../util/structures/command');

module.exports = class UserCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            cooldown: 5000,
            aliases: ['pong'],
            description: 'Pong!',
        });
    }
    
    async run(message) {
        
    }
}