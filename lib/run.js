const config = require('../config.json');
Object.assign(process.env, config);

process.on('unhandledRejection', (e) => console.log(e));
process.on('uncaughtException', (e) => console.log(e));