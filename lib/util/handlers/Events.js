const glob = require('glob');

module.exports.load = (Ayu) => {
    //glob.sync(`lib/events/**/*.js`).forEach((path) => {
        /*const splitted = path.split('/');
        const event = require(`../../commands/${splitted[2]}/${splitted[3]}`);

        client.on(splitted[3], (...args) => event.run(Ayu, ...args));
    });*/
}