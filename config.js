require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/verify',
    port: parseInt(process.env.PORT) || 3000,
    guildId: process.env.GUILD_ID,
};
