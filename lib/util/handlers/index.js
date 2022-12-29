const { load: loadEvents } = require('./Events');
const { load: loadCommands } = require('./Commands');

module.exports.loadHandlers = (Ayu) => {
    loadEvents(Ayu);
    loadCommands(Ayu);
}