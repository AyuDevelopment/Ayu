const { Command } = require('../../util/structures/command');
const { EmbedBuilder } = require('discord.js');
const parseFlags = require('yargs-parser');
const fetch = require('node-fetch');

module.exports = class UserCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'crypto',
            cooldown: 5_000,
            description: 'Get information about a crypto',
        });
    }

    async run({ message, args }) {
        if (!args.at(0)) return message.reply('Try to ad the crypto name id or use `--all` option to show all');
        const { _, all, random } = parseFlags(args.join(' '));
        const cryptoName = _.at(0);

        if (all) {
            const allCrypto = await this.getAll();

            return message.reply(allCrypto.slice(0, 10).map((i) => `> -[${i.symbol}] ${i.name} - $${i.price_usd}`).join('\n'));
        } else if (random) {
            const allCrypto = await this.getAll();
            const crypto = allCrypto[Math.floor(Math.random() * allCrypto.length)];

            return message.reply({ embeds: [this.getEmbed(crypto)] });
        }

        const info =
            this.isId(cryptoName) ?
            await this.getInfoById(cryptoName) :
            await this.getInfoByName(cryptoName);

        if (!info) return message.reply('Cant find the crypto');

        return message.reply({ embeds: [this.getEmbed(info)] });
    }

    getEmbed(info) {
        const formatPercentage = (input) => !input.startsWith('-') ? `+${input}%` : input + '%';

        return new EmbedBuilder()
            .addFields(
                    {
                        name: 'Main information',
                        value: `> **ID:** ${info.id}\n> **Symbol:** ${info.symbol}\n> **Price:** $${info.price_usd}`,
                        inline: true
                    },
                    {
                        name: 'Percentages',
                        value: `> **Last hour:** ${formatPercentage(info.percent_change_1h)}\n> **Last day:** ${formatPercentage(info.percent_change_24h)}\n> **Last week:** ${formatPercentage(info.percent_change_7d)}`,
                        inline: true
                    }
            )
            .setColor('#2f3136')
            .setFooter({ text: info.name });
    }

    isId(input) {
        return !isNaN(input);
    }

    async getInfoByName(name) {
        return await fetch(this.#apiUrls.all)
            .then((res) => res.json())
            .then((body) =>
                    body.data.find((i) =>
                        i?.symbol?.toLowerCase() === name ||
                        i?.name?.toLowerCase() === name ||
                        i?.id === name
                    )
            )
    }

    async getInfoById(id) {
        return await fetch(this.#apiUrls.unique + id)
            .then((res) => res.json())
            .then((body) => body[0]);
    }

    async getAll() {
        return await fetch(this.#apiUrls.all)
            .then((res) => res.json())
            .then((body) => body.data);
    }

    #apiUrls = {
        all: 'https://api.coinlore.net/api/tickers/?start=0&limit=1200',
        unique: 'https://api.coinlore.net/api/ticker/?id='
    }
}