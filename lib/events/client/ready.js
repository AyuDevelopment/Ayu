const { Event } = require('../../util/structures/event');

module.exports = class ClientEvent extends Event {
    constructor(client) {
        super(client, {
            once: true
        });
    }

    run() {
        console.log('Ready');
    }
}