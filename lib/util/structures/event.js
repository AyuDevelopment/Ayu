module.exports.Event = class Event {
	constructor(client, {
        once = false
    }) {
        this.client = client;
        this.options = { once };
    }
}