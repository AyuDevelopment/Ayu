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

    async run(message, args) {
        const input = args.join(' ');
        const flags = parseFlags(input);
        const { result, success, type } = await this.eval(message, input.replace(/--\S+/g, ''), flags);
        const output = success ? `${type}\n${codeBlock('js', result)}` : `Error: ${codeBlock('bash', result)}`;

        if (output.length >= 2000) return message.reply({
            files: [{ attachment: Buffer.from(output), name: 'output.js' }]
        });
        


        message.reply(output);
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