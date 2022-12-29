const glob = require('glob');

module.exports.load = (Ayu) => {
    glob.sync(`lib/events/**/*.js`).forEach((path) => {
        const splitted = path.split('/');
        const event = new(require(`../../events/${splitted[2]}/${splitted[3]}`))(Ayu);

        Ayu[event.options.once ? 'once' : 'on'](splitted[3].replace('.js', ''), (...args) => event.run(...args));
    });
}