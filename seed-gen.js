const fs   = require('fs');
const path = require('path');
const { generateAccounts } = require('./utils/accountGenerator');

const DB_PATH = path.join(__dirname, 'revora-data.json');
const data    = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

const SERVICES     = ['Activision','Crunchyroll','Dazn','Deezer','Disney','Fortnite','Hbo','Instagram','Ipvanish','Minecraft','Netflix','Nordvpn','Paramount','Spotify','Steam','Tiktok','Uplay','Valorant'];
const OUT_OF_STOCK = new Set(['Disney','Ipvanish','Tiktok','Crunchyroll']); // 3 specified + 1 extra

const usedEmails    = new Set();
const usedPasswords = new Set();

data.gen_accounts = {};

for (const service of SERVICES) {
    if (OUT_OF_STOCK.has(service)) {
        data.gen_accounts[service] = [];
        console.log(`⚫ ${service}: 0 (out of stock)`);
    } else {
        const count    = Math.floor(Math.random() * 59) + 51; // 51–109
        const accounts = generateAccounts(count, usedEmails, usedPasswords);
        data.gen_accounts[service] = accounts;
        console.log(`🟢 ${service}: ${accounts.length}`);
    }
}

fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
console.log('\n✅ Stock seeded.');
