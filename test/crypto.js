const fetch = require('node-fetch');

const urls = {
    all: 'https://api.coinlore.net/api/tickers/?start=0&limit=1200',
    unique: 'https://api.coinlore.net/api/ticker/?id='
}

async function getInfoByName(name) {
    return await fetch(urls.all).then(res => res.json()).then(body => body.data.find(i => i.symbol.toLowerCase() === name.toLocaleLowerCase() || i.name.toLowerCase() === name.toLowerCase()));
}

getInfoByName('btc').then(console.log);