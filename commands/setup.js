const {
    SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder,
} = require('discord.js');
const { ROLES, getStructure } = require('../utils/serverStructure');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Full Revora server setup — creates all roles, channels and permissions.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;
        await interaction.editReply('⏳ Creating roles...');

        // --- ROLES ---
        const createdRoles = {};
        for (const roleDef of ROLES) {
            const existing = guild.roles.cache.find(r => r.name === roleDef.name);
            if (existing) { createdRoles[roleDef.name] = existing; continue; }
            const r = await guild.roles.create({
                name:        roleDef.name,
                color:       roleDef.color,
                hoist:       roleDef.hoist,
                mentionable: roleDef.mentionable,
                reason:      'Revora setup',
            });
            createdRoles[roleDef.name] = r;
            await sleep(600);
        }

        // Deny @everyone view channel at guild level
        await guild.roles.everyone.setPermissions(0n).catch(() => {});
        await sleep(500);

        await interaction.editReply('⏳ Creating channels...');

        // --- CATEGORIES & CHANNELS ---
        const structure = getStructure(guild);
        const channelMap = {};

        for (const cat of structure) {
            // Create or find category
            let category = guild.channels.cache.find(
                c => c.name === cat.name && c.type === ChannelType.GuildCategory
            );
            if (!category) {
                category = await guild.channels.create({
                    name:                cat.name,
                    type:                ChannelType.GuildCategory,
                    permissionOverwrites: cat.permissionOverwrites,
                    reason:              'Revora setup',
                });
            } else {
                await category.permissionOverwrites.set(cat.permissionOverwrites).catch(() => {});
            }
            await sleep(600);

            for (const ch of cat.channels) {
                const isVoice = ch.type === 'voice';
                let channel = guild.channels.cache.find(c => c.name === ch.name);
                if (!channel) {
                    channel = await guild.channels.create({
                        name:                ch.name,
                        type:                isVoice ? ChannelType.GuildVoice : ChannelType.GuildText,
                        parent:              category.id,
                        permissionOverwrites: ch.permissionOverwrites ?? cat.permissionOverwrites,
                        reason:              'Revora setup',
                    });
                }
                channelMap[ch.name] = channel;
                await sleep(600);
            }
        }

        // --- INITIAL EMBEDS ---
        await interaction.editReply('⏳ Posting initial embeds...');

        // Welcome embed
        const welcomeCh = guild.channels.cache.find(c => c.name.includes('welcome'));
        if (welcomeCh) {
            await welcomeCh.send({
                embeds: [new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('🔴 Welcome to Revora')
                    .setDescription([
                        'You have been verified and granted full member access.',
                        '',
                        '📜 Read **#rules-and-terms** before anything else.',
                        'ℹ️ Learn about us in **#about-us**.',
                        '📢 Stay updated in **#announcements**.',
                        '🛍️ Browse products in the **Products** section.',
                        '💬 Chat in **#general**.',
                        '🎫 Need help? Open a ticket in **#create-ticket**.',
                        '',
                        '*We\'re glad to have you here. Welcome to Revora.*',
                    ].join('\n'))
                    .setFooter({ text: 'Revora • 2026' })
                ],
            }).catch(() => {});
        }

        // About us embed
        const aboutCh = guild.channels.cache.find(c => c.name.includes('about-us'));
        if (aboutCh) {
            await aboutCh.send({
                embeds: [new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('🔴 About Revora')
                    .setDescription([
                        '**Revora** is a premium software community offering high-quality game clients and tools.',
                        '',
                        '🎮 **CS2** — Internal & External',
                        '🎲 **Roblox** — External Executor',
                        '⛏️ **Minecraft** — Utility Client',
                        '🎯 **Bloodstrike** — External',
                        '⚔️ **Combat Master** — External',
                        '',
                        'We are committed to quality, security, and dedicated support.',
                        'All products are kept up to date and thoroughly tested before release.',
                    ].join('\n'))
                    .setFooter({ text: 'Revora • 2026' })
                ],
            }).catch(() => {});
        }

        await interaction.editReply('✅ Setup complete! Run `/post-verify`, `/post-tickets`, and `/post-terms` to finish.');
    },
};
