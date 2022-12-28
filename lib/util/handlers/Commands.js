const glob = require('glob');

module.exports.load = (Ayu) => {
    glob.sync(`lib/commands/**/*.js`).forEach((path) => {
        const splitted = path.split('/');
        const command = new(require(`../../commands/${splitted[2]}/${splitted[3]}`))(Ayu);
        Ayu._commands.set(command.info.name, command);
    });
}