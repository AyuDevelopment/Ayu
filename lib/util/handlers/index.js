const { load: loadEvents } = require('./Events');
const { load: loadCommands } = require('./Commands');

module.exports.load = (Ayu) => {
    loadEvents(Ayu);
    loadCommands(Ayu);
}