const { Client } = require('discord.js');

module.exports = class Ayu extends Client {
	static async login() {
		await super.login();
	}
}