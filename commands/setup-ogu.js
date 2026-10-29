const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const { db } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-ogu')
        .setDescription('Post the OGU shop embed in a channel. (Admin only)')
        .addChannelOption(o => o
            .setName('channel')
            .setDescription('The channel to post the OGU shop in')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const oguChannel  = interaction.options.getChannel('channel');
        const customEmoji = db.getGenEmojis();

        const discordEmoji = customEmoji['Discord'] ?? '💬';
        const steamEmoji   = customEmoji['Steam']   ?? '🎮';
        const robloxEmoji  = customEmoji['Roblox']  ?? '🟥';

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🏷️ Revora.xyz — OG Usernames')
            .setDescription([
                '> Purchase rare **OG Usernames** for your favourite platforms.',
                '> All usernames are **3–4 letters** — short, clean, and unforgettable.',
                '',
                '━━━━━━━━━━━━━━━━━━━━━━━━━━',
                '',
                `${discordEmoji} **Discord OGU**`,
                '> Length: `3L – 4L`',
                '> Price: **$4 USD** each',
                '',
                `${steamEmoji} **Steam OGU**`,
                '> Length: `3L – 4L`',
                '> Price: **$4 USD** each',
                '',
                `${robloxEmoji} **Roblox OGU**`,
                '> Length: `3L – 4L`',
                '> Price: **$4 USD** each',
                '',
                '━━━━━━━━━━━━━━━━━━━━━━━━━━',
                '',
                '> 📩 Click a button below to open a ticket and claim your OGU.',
                '> 💳 Accepted: PayPal · CashApp · Crypto',
            ].join('\n'))
            .setFooter({ text: 'Revora.xyz • OGU Shop' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ogu_discord')
                .setLabel('Discord OGU — $4')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('ogu_steam')
                .setLabel('Steam OGU — $4')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('ogu_roblox')
                .setLabel('Roblox OGU — $4')
                .setStyle(ButtonStyle.Primary),
        );

        await oguChannel.send({ embeds: [embed], components: [row] });

        await interaction.reply({
            content: `✅ OGU shop embed posted in <#${oguChannel.id}>`,
            ephemeral: true,
        });
    },
};
