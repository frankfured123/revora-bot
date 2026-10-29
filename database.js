const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'revora-data.json');

const EMPTY = { verified_users: {}, invite_usage: [], tickets: {}, giveaways: {}, gen_accounts: {} };

function load() {
    if (!fs.existsSync(DB_PATH)) return structuredClone(EMPTY);
    try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
    catch { return structuredClone(EMPTY); }
}

function save(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const db = {
    saveUser(discordId, username, accessToken, refreshToken, guildsJson) {
        const data = load();
        data.verified_users[discordId] = {
            discord_id: discordId, username, access_token: accessToken,
            refresh_token: refreshToken, verified_at: Date.now(), guilds: guildsJson,
        };
        save(data);
    },

    getAllVerifiedUsers() {
        return Object.values(load().verified_users);
    },

    recordInviteUsage(code, inviterId, inviteeId) {
        const data = load();
        // Avoid duplicate entries for the same invitee
        const exists = data.invite_usage.some(r => r.invitee_id === inviteeId);
        if (!exists) {
            data.invite_usage.push({ invite_code: code, inviter_id: inviterId, invitee_id: inviteeId, used_at: Date.now() });
            save(data);
        }
    },

    getAllInviteUsage() {
        return load().invite_usage ?? [];
    },

    getTicketCount() {
        return Object.keys(load().tickets).length;
    },

    createTicket(channelId, userId, product, issue) {
        const data = load();
        data.tickets[channelId] = {
            channel_id: channelId, user_id: userId, product, issue,
            status: 'open', created_at: Date.now(),
        };
        save(data);
    },

    getTicket(channelId) {
        return load().tickets[channelId] ?? null;
    },

    closeTicket(channelId) {
        const data = load();
        if (data.tickets[channelId]) data.tickets[channelId].status = 'closed';
        save(data);
    },

    createGiveaway(giveaway) {
        const data = load();
        if (!data.giveaways) data.giveaways = {};
        const id = Date.now().toString();
        data.giveaways[id] = { ...giveaway, id };
        save(data);
        return id;
    },

    setGiveawayMessage(id, messageId) {
        const data = load();
        if (data.giveaways[id]) data.giveaways[id].message_id = messageId;
        save(data);
    },

    getGiveaway(id) {
        return load().giveaways?.[id] ?? null;
    },

    getActiveGiveaways() {
        const data = load();
        return Object.values(data.giveaways || {}).filter(g => !g.ended);
    },

    addGiveawayEntry(id, userId) {
        const data = load();
        if (!data.giveaways[id]) return false;
        const entries = JSON.parse(data.giveaways[id].entries || '[]');
        if (entries.includes(userId)) return false;
        entries.push(userId);
        data.giveaways[id].entries = JSON.stringify(entries);
        save(data);
        return true;
    },

    endGiveaway(id) {
        const data = load();
        if (data.giveaways[id]) data.giveaways[id].ended = 1;
        save(data);
    },

    initGenAccounts(services, count) {
        const { generateAccounts } = require('./utils/accountGenerator');
        const data = load();
        if (!data.gen_accounts) data.gen_accounts = {};

        // Build global uniqueness sets from all existing accounts
        const usedEmails    = new Set();
        const usedPasswords = new Set();
        for (const accounts of Object.values(data.gen_accounts)) {
            for (const acc of accounts) {
                usedEmails.add(acc.email);
                usedPasswords.add(acc.password);
            }
        }

        let changed = false;
        for (const service of services) {
            if (!data.gen_accounts[service]) {
                data.gen_accounts[service] = generateAccounts(count, usedEmails, usedPasswords);
                changed = true;
            }
        }
        if (changed) save(data);
    },

    getGenAccount(service) {
        const data     = load();
        const accounts = data.gen_accounts?.[service];
        if (!accounts?.length) return null;
        const account  = accounts.shift();
        save(data);
        return account;
    },

    addGenAccounts(service, accounts) {
        const data = load();
        if (!data.gen_accounts) data.gen_accounts = {};
        if (!data.gen_accounts[service]) data.gen_accounts[service] = [];
        data.gen_accounts[service].push(...accounts);
        save(data);
    },

    getGenStock() {
        const data = load();
        const stock = {};
        for (const [service, accounts] of Object.entries(data.gen_accounts || {})) {
            stock[service] = accounts.length;
        }
        return stock;
    },

    setGenStockMessage(channelId, messageId) {
        const data = load();
        data.gen_stock_message = { channelId, messageId };
        save(data);
    },

    getGenStockMessage() {
        return load().gen_stock_message ?? null;
    },

    setGenEmoji(service, emojiString) {
        const data = load();
        if (!data.gen_emojis) data.gen_emojis = {};
        data.gen_emojis[service] = emojiString;
        save(data);
    },

    getGenEmojis() {
        return load().gen_emojis ?? {};
    },
};

function initDatabase() {
    if (!fs.existsSync(DB_PATH)) save(structuredClone(EMPTY));
    const { SERVICES } = require('./utils/services');
    db.initGenAccounts(SERVICES.map(s => s.name), 10);
    console.log('[DB] Database ready.');
}

module.exports = { db, initDatabase };
