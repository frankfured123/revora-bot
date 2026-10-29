require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { REST, Routes } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const config = require('./config');

const commands = [];
const commandsDir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'))) {
    const cmd = require(path.join(commandsDir, file));
    if (cmd.data) commands.push(cmd.data.toJSON());
}

const rest = new REST().setToken(config.token);

(async () => {
    try {
        console.log(`Registering ${commands.length} application commands...`);
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );
        console.log('Commands registered successfully.');
    } catch (err) {
        console.error(err);
    }
})();
