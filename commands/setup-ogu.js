const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');

// ── Paste your Revora banner GIF URL here ──────────────────────────────────
const BANNER_GIF = null; // e.g. 'https://i.imgur.com/yourGIF.gif'

const LOGOS = {
    discord: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/98/Discord_logo.svg/512px-Discord_logo.svg.png',
    steam:   'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png',
    roblox:  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Roblox_Logo_2022.svg/512px-Roblox_Logo_2022.svg.png',
};

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
        const oguChannel = interaction.options.getChannel('channel');

        const mainEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('👑 Revora.xyz — OG Usernames')
            .setDescription([
                '> Purchase rare **OG Usernames** for your favourite platforms.',
                '> All usernames are **3–4 letters** — short, clean, and unforgettable.',
                '',
                '━━━━━━━━━━━━━━━━━━━━━━━━━━',
                '',
                '> 📩 Click a button below to open a ticket and claim your OGU.',
                '> 💳 Accepted: **PayPal · CashApp · Crypto**',
            ].join('\n'))
            .setFooter({ text: 'Revora.xyz • OGU Shop' })
            .setTimestamp();

        if (BANNER_GIF) mainEmbed.setImage(BANNER_GIF);

        const discordEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setAuthor({ name: '👑 Discord OGU', iconURL: LOGOS.discord })
            .setThumbnail(LOGOS.discord)
            .addFields(
                { name: '📏 Length', value: '`3L – 4L`',  inline: true },
                { name: '💰 Price',  value: '**$4 USD**', inline: true },
            );

        const steamEmbed = new EmbedBuilder()
            .setColor(0x1B2838)
            .setAuthor({ name: '👑 Steam OGU', iconURL: LOGOS.steam })
            .setThumbnail(LOGOS.steam)
            .addFields(
                { name: '📏 Length', value: '`3L – 4L`',  inline: true },
                { name: '💰 Price',  value: '**$4 USD**', inline: true },
            );

        const robloxEmbed = new EmbedBuilder()
            .setColor(0xE52207)
            .setAuthor({ name: '👑 Roblox OGU', iconURL: LOGOS.roblox })
            .setThumbnail(LOGOS.roblox)
            .addFields(
                { name: '📏 Length', value: '`3L – 4L`',  inline: true },
                { name: '💰 Price',  value: '**$4 USD**', inline: true },
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ogu_discord')
                .setLabel('Discord OGU — $4')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('ogu_steam')
                .setLabel('Steam OGU — $4')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('ogu_roblox')
                .setLabel('Roblox OGU — $4')
                .setStyle(ButtonStyle.Danger),
        );

        await oguChannel.send({
            embeds: [mainEmbed, discordEmbed, steamEmbed, robloxEmbed],
            components: [row],
        });

        await interaction.reply({
            content: `✅ OGU shop embed posted in <#${oguChannel.id}>`,
            ephemeral: true,
        });
    },
};
