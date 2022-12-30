const { Command } = require('../../util/structures/command');
const { codeBlock } = require('discord.js');
const parseFlags = require('yargs-parser');
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

    async run({ message, args }) {
        const flags = parseFlags(args.join(' '));
        const { result, success } = await this.eval(message, flags._.join(' '), flags);

        if (result.length >= 2000) return message.reply({
            files: [{ attachment: Buffer.from(result), name: 'output.js' }]
        });
        
        message.reply(success ? codeBlock('js', result) : `Error: ${codeBlock('bash', result)}`);
    }

    /**
        *@private
    */
    async eval(message, code, options = {}) {

        if (options.async) code = `(async () => {\n${code}\n})();`;

        const { client } = this; //use `client` instead of `this.client` at eval

        let success = true;
        let result;

        try {
            result = await eval(code);
        } catch (e) {
            result = e;
            success = false;
        }

        if (typeof result !== 'string') {
            result = inspect(result, {
                depth: options.depth || 0,
                showHidden: options.showHidden || false
            })
        }

        return { result, success }
    }
}