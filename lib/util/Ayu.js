const { Client } = require('discord.js');

module.exports = class Ayu extends Client {
	constructor(token) {
		this.token = token;
	}

	static async init() {
		await super.login(this.token);
	}
}