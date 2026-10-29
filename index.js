require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const { initDatabase } = require('./database');
const config = require('./config');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.commands = new Collection();
client.invites  = new Collection(); // { guildId -> Collection<code, Invite> }
client.pendingTicketProduct = new Map(); // userId -> product (temp storage between interactions)

// Load commands
const commandsDir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'))) {
    const cmd = require(path.join(commandsDir, file));
    if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
}

// Load events
const eventsDir = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsDir).filter(f => f.endsWith('.js'))) {
    const evt = require(path.join(eventsDir, file));
    const method = evt.once ? 'once' : 'on';
    client[method](evt.name, (...args) => evt.execute(...args, client));
}

initDatabase();
client.login(config.token).catch(err => {
    console.log('[Login Error]', err.message);
    process.exit(1);
});
