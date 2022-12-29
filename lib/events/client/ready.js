const { Event } = require('../../util/structures/event');

module.exports = class ClientEvent extends Event {
	constructor(client) {
		super(client, {
			once: true
		});
	}

	async run() {
		this.client.user.setPresence({
			activities: [{
				name: 'Hello world'
			}]
		});
		console.log('Ready');
	}
};