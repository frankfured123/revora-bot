const { SlashCommandBuilder } = require('discord.js');
const { db } = require('../database');
const { buildStockEmbed } = require('../utils/genStockUpdater');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gen-stock')
        .setDescription('Show the current account generator stock. (Boosters only)'),

    async execute(interaction) {
        const boosterRole = interaction.guild.roles.cache.find(r => r.name === 'Booster');
        const adminRole   = interaction.guild.roles.cache.find(r => r.name === 'Admin');
        const ownerRole   = interaction.guild.roles.cache.find(r => r.name === 'Owner');

        const hasAccess =
            interaction.member.roles.cache.has(boosterRole?.id) ||
            interaction.member.roles.cache.has(adminRole?.id)   ||
            interaction.member.roles.cache.has(ownerRole?.id);

        if (!hasAccess) {
            return interaction.reply({
                content: '❌ This command is for **Boosters only**.',
                ephemeral: true,
            });
        }

        // Post publicly so everyone in channel can see
        await interaction.reply({ embeds: [buildStockEmbed()] });

        // Save this message as the live stock board (auto-updated on each /gen)
        const msg = await interaction.fetchReply();
        db.setGenStockMessage(interaction.channelId, msg.id);
    },
};
