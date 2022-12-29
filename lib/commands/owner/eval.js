const { Command } = require('../../util/structures/command');
const { inspect } = require('util');

module.exports = class UserCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'eval',
            cooldown: 5000,
            aliases: ['ev'],
            isEnabled: false,
            description: 'Eval something',
        });
    }

    async run(message, args) {
        
    }

    /**
        *@private
    */
    eval(message, code, options = {}) {
        let success = true;
        let result;

        try {
            result = eval(code);
        } catch (e) {
            result = e;
            success = false;
        }

        const type = typeof result;

        if (typeof result !== 'string') {
            result = inspect(result, {
                depth: options.depth || 0,
                showHidden: options.showHidden || false
            })
        }

        return { result, success, type }
    }
}