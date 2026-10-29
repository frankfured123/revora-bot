const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { db } = require('../database');

// giveawayId -> { endTimer, tickInterval }
const activeTimers = new Map();

function parseDuration(str) {
    const regex = /(\d+)(d|h|m|s)/g;
    let ms = 0, match;
    while ((match = regex.exec(str)) !== null) {
        const v = parseInt(match[1]);
        switch (match[2]) {
            case 'd': ms += v * 86400000; break;
            case 'h': ms += v * 3600000;  break;
            case 'm': ms += v * 60000;    break;
            case 's': ms += v * 1000;     break;
        }
    }
    return ms;
}

function formatTimeLeft(ms) {
    if (ms <= 0) return 'Ended';
    const d = Math.floor(ms / 86400000); ms %= 86400000;
    const h = Math.floor(ms / 3600000);  ms %= 3600000;
    const m = Math.floor(ms / 60000);    ms %= 60000;
    const s = Math.floor(ms / 1000);
    return [d && `${d}d`, h && `${h}h`, m && `${m}m`, s && `${s}s`].filter(Boolean).join(' ') || '0s';
}

function buildEmbed(giveaway, ended = false) {
    const entries  = giveaway.entries ? JSON.parse(giveaway.entries) : [];
    const timeLeft = ended ? 'Ended' : formatTimeLeft(giveaway.ends_at - Date.now());

    return new EmbedBuilder()
        .setColor(ended ? 0x1C1C1C : 0xFF0000)
        .setTitle(ended ? '🎉 GIVEAWAY ENDED' : '🎉 GIVEAWAY')
        .setDescription(ended
            ? `This giveaway has ended!`
            : `Click **Enter Giveaway** below to participate!`
        )
        .addFields(
            { name: '🛍️ Prize',     value: giveaway.product,         inline: true },
            { name: '🏆 Winners',   value: `${giveaway.winners}`,    inline: true },
            { name: '⏰ Time Left', value: timeLeft,                  inline: true },
            { name: '👥 Entries',   value: `${entries.length}`,       inline: true },
            { name: '🎫 Hosted by', value: `<@${giveaway.host_id}>`, inline: true },
        )
        .setFooter({ text: `Revora Giveaway • Ends ${new Date(giveaway.ends_at).toUTCString()}` });
}

async function endGiveaway(client, giveawayId) {
    const giveaway = db.getGiveaway(giveawayId);
    if (!giveaway || giveaway.ended) return;

    // Stop all timers for this giveaway
    const timers = activeTimers.get(giveawayId);
    if (timers) {
        clearTimeout(timers.endTimer);
        clearInterval(timers.tickInterval);
        activeTimers.delete(giveawayId);
    }

    db.endGiveaway(giveawayId);

    const guild   = client.guilds.cache.get(giveaway.guild_id);
    if (!guild) return;
    const channel = guild.channels.cache.get(giveaway.channel_id);
    if (!channel) return;

    const entries     = giveaway.entries ? JSON.parse(giveaway.entries) : [];
    const winnerCount = Math.min(giveaway.winners, entries.length);
    const shuffled    = [...entries].sort(() => Math.random() - 0.5);
    const winners     = shuffled.slice(0, winnerCount);

    // Edit original message to ended state
    const msg = await channel.messages.fetch(giveaway.message_id).catch(() => null);
    if (msg) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('giveaway_ended')
                .setLabel('Giveaway Ended')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );
        await msg.edit({ embeds: [buildEmbed(giveaway, true)], components: [row] }).catch(() => {});
    }

    const ticketCh = guild.channels.cache.find(c => c.name.includes('create-ticket'));

    if (winners.length === 0) {
        await channel.send({
            embeds: [new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🎉 Giveaway Ended')
                .setDescription(`No winners could be selected for **${giveaway.product}** — no one entered.`)
            ],
        });
        return;
    }

    const winnerLines = winners.map(id =>
        ticketCh
            ? `<@${id}> won **${giveaway.product}**! Please claim your prize in <#${ticketCh.id}>`
            : `<@${id}> won **${giveaway.product}**! Please create a support ticket to claim your prize.`
    ).join('\n');

    await channel.send({ content: winnerLines });
}

// Edit the giveaway message with current time left
async function tickGiveaway(client, giveawayId) {
    const g = db.getGiveaway(giveawayId);
    if (!g || g.ended) return;

    try {
        const guild = client.guilds.cache.get(g.guild_id);
        if (!guild) return;
        const channel = guild.channels.cache.get(g.channel_id);
        if (!channel) return;
        const msg = await channel.messages.fetch(g.message_id).catch(() => null);
        if (!msg) return;
        await msg.edit({ embeds: [buildEmbed(g)] }).catch(() => {});
    } catch { /* ignore rate limit errors */ }
}

function scheduleGiveaway(client, giveaway) {
    if (activeTimers.has(giveaway.id)) return;

    const delay = Math.max(giveaway.ends_at - Date.now(), 1000);

    // Fire exactly when giveaway ends
    const endTimer = setTimeout(() => endGiveaway(client, giveaway.id), delay);

    // Countdown ticker — 5s normally, switches to 1s in final 30s
    let fastMode = delay <= 30000;
    let tickInterval = setInterval(async () => {
        const remaining = giveaway.ends_at - Date.now();

        // Switch to 1s ticks for the final 30 seconds
        if (!fastMode && remaining <= 30000) {
            fastMode = true;
            const entry = activeTimers.get(giveaway.id);
            if (entry) {
                clearInterval(entry.tickInterval);
                entry.tickInterval = setInterval(async () => {
                    await tickGiveaway(client, giveaway.id);
                }, 1000);
            }
            return;
        }

        await tickGiveaway(client, giveaway.id);
    }, fastMode ? 1000 : 5000);

    activeTimers.set(giveaway.id, { endTimer, tickInterval });
}

function restoreGiveaways(client) {
    const active = db.getActiveGiveaways();
    for (const g of active) {
        if (g.ends_at <= Date.now()) {
            endGiveaway(client, g.id);
        } else {
            scheduleGiveaway(client, g);
        }
    }
    if (active.length) console.log(`[Giveaways] Restored ${active.length} active giveaway(s).`);
}

module.exports = { parseDuration, buildEmbed, scheduleGiveaway, restoreGiveaways, endGiveaway };
