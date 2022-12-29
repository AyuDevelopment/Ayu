module.exports.Event = class Event {
	constructor(client, {
		once = false
	}) {
		/**
			* @type {import('discord.js').Client}
		*/
		this.client = client;
		this.options = { once };
	}
}