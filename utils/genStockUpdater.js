const { EmbedBuilder } = require('discord.js');
const { db } = require('../database');
const { SERVICES, stockDot } = require('./services');

function buildStockEmbed() {
    const stock      = db.getGenStock();
    const customEmoji = db.getGenEmojis();
    const total      = Object.values(stock).reduce((a, b) => a + b, 0);

    const lines = SERVICES.map(s => {
        const count = stock[s.name] ?? 0;
        const icon  = customEmoji[s.name] ?? s.emoji; // prefer custom server emoji
        return `${stockDot(count)} ${icon} **${s.name}** — 🎯 ${s.hitRate}% hit rate — ${count} stocked`;
    });

    return new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🎁 Revora.xyz — Account Generator')
        .setDescription([
            `**${SERVICES.length} services • ${total} accounts in stock**`,
            ``,
            ...lines,
            ``,
            `🟢 Green — Plenty of stock`,
            `🟠 Orange — Limited stock`,
            `🔴 Red — Almost gone`,
            `⚫ Black — Out of stock`,
            ``,
            `Generate with \`/gen\` • Boosters only`,
        ].join('\n'))
        .setFooter({ text: 'Revora Generator' })
        .setTimestamp();
}

async function updateStockEmbed(client) {
    const info = db.getGenStockMessage();
    if (!info) return;
    try {
        const channel = await client.channels.fetch(info.channelId).catch(() => null);
        if (!channel) return;
        const message = await channel.messages.fetch(info.messageId).catch(() => null);
        if (!message) return;
        await message.edit({ embeds: [buildStockEmbed()] });
    } catch (err) {
        console.error('[GenStock] Failed to update stock embed:', err.message);
    }
}

module.exports = { buildStockEmbed, updateStockEmbed };
