const { startWebServer } = require('../web/server');
const { restoreGiveaways } = require('../utils/giveawayManager');
const { buildSnapshot } = require('../utils/inviteTracker');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`[Bot] Logged in as ${client.user.tag}`);

        // Build rich invite snapshot (preserves inviter IDs)
        for (const guild of client.guilds.cache.values()) {
            const snapshot = await buildSnapshot(guild);
            client.invites.set(guild.id, snapshot);
        }
        console.log('[Invites] Invite snapshot built.');

        // Restore any active giveaways after restart
        restoreGiveaways(client);

        // Start OAuth2 web server
        startWebServer(client);
    },
};
