const {
    SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const { parseDuration, buildEmbed, scheduleGiveaway } = require('../utils/giveawayManager');
const { db } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Start a giveaway.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o.setName('product').setDescription('Prize / product name').setRequired(true))
        .addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setRequired(true).setMinValue(1).setMaxValue(10))
        .addStringOption(o => o.setName('duration').setDescription('Duration e.g. 1h, 30m, 1d, 2h30m').setRequired(true))
        .addChannelOption(o => o.setName('channel').setDescription('Channel to post in (defaults to current)').setRequired(false)),

    async execute(interaction) {
        const product   = interaction.options.getString('product');
        const winners   = interaction.options.getInteger('winners');
        const durationStr = interaction.options.getString('duration');
        const channel   = interaction.options.getChannel('channel') || interaction.channel;

        const ms = parseDuration(durationStr);
        if (ms < 10000) return interaction.reply({ content: '❌ Duration must be at least 10 seconds.', ephemeral: true });

        const endsAt = Date.now() + ms;

        const giveaway = {
            guild_id:   interaction.guildId,
            channel_id: channel.id,
            host_id:    interaction.user.id,
            product,
            winners,
            ends_at:    endsAt,
            entries:    '[]',
            ended:      0,
        };

        // Temporary ID for the embed
        const tempId = db.createGiveaway(giveaway);
        giveaway.id = tempId;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`enter_giveaway_${tempId}`)
                .setLabel('🎉  Enter Giveaway')
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ content: `✅ Giveaway started in ${channel}!`, ephemeral: true });

        const msg = await channel.send({ embeds: [buildEmbed(giveaway)], components: [row] });

        db.setGiveawayMessage(tempId, msg.id);
        giveaway.message_id = msg.id;

        scheduleGiveaway(interaction.client, { ...giveaway, message_id: msg.id });
    },
};
