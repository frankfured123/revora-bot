const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db } = require('../database');
const { SERVICES, stockDot } = require('../utils/services');
const { updateStockEmbed } = require('../utils/genStockUpdater');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gen')
        .setDescription('Generate an account for a service. (Boosters only)')
        .addStringOption(o => o
            .setName('service')
            .setDescription('Which service to generate for')
            .setRequired(true)
            .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused().toLowerCase();
        const stock   = db.getGenStock();
        const choices = SERVICES
            .filter(s => s.name.toLowerCase().includes(focused))
            .map(s => ({
                name: `${s.name} — ${stock[s.name] ?? 0} in stock`,
                value: s.name,
            }))
            .slice(0, 25);
        await interaction.respond(choices);
    },

    async execute(interaction) {
        // Channel restriction — must be used in account-gen channel
        const genChannel = interaction.guild.channels.cache.find(c =>
            c.name === 'account-gen' || c.name === 'gen' || c.name === 'generator' || c.name === 'account-generator'
        );
        if (genChannel && interaction.channelId !== genChannel.id) {
            return interaction.reply({
                content: `❌ You can only use this command in <#${genChannel.id}>`,
                ephemeral: true,
            });
        }

        // Role check — Booster, Admin, or Owner only
        const boosterRole = interaction.guild.roles.cache.find(r => r.name === 'Booster');
        const adminRole   = interaction.guild.roles.cache.find(r => r.name === 'Admin');
        const ownerRole   = interaction.guild.roles.cache.find(r => r.name === 'Owner');

        const hasAccess =
            interaction.member.roles.cache.has(boosterRole?.id) ||
            interaction.member.roles.cache.has(adminRole?.id)   ||
            interaction.member.roles.cache.has(ownerRole?.id);

        if (!hasAccess) {
            return interaction.reply({
                content: '❌ This command is for **Boosters only**. Boost the server to unlock access!',
                ephemeral: true,
            });
        }

        const service    = interaction.options.getString('service');
        const serviceObj = SERVICES.find(s => s.name === service);
        const customEmoji = db.getGenEmojis();
        const emoji       = customEmoji[service] ?? serviceObj?.emoji ?? '🎁';
        const account     = db.getGenAccount(service);

        if (!account) {
            return interaction.reply({
                content: `⚫ ${emoji} **${service}** is currently out of stock. Check back later!`,
                ephemeral: true,
            });
        }

        try {
            await interaction.user.send([
                `${emoji} **Your ${service} Account — Revora.xyz**`,
                ``,
                `📧 **Email ────────** \`${account.email}\``,
                `🔑 **Password ───** \`${account.password}\``,
                ``,
                `⚠️ **Change the password** immediately after logging in.`,
                `🎫 Need help? Open a ticket in **Revora** and select **Claim Giveaway Prize**.`,
                `🔥 Enjoy your account!`,
            ].join('\n'));

            // Ephemeral reply to the user
            await interaction.reply({
                content: `✅ 📬 Check your DMs! Your **${service}** account has been sent.`,
                ephemeral: true,
            });

            // Public announcement
            await interaction.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(`${emoji} **${interaction.user}** just generated a **${service}** account × 1 — 📬 check your messages`)
                    .setTimestamp()
                ],
            });

            // Update live stock embed
            await updateStockEmbed(interaction.client);

        } catch {
            // DMs closed — put account back
            db.addGenAccounts(service, [account]);
            await interaction.reply({
                content: '❌ I couldn\'t DM you. Please enable **Direct Messages** from server members in your Privacy Settings, then try again.',
                ephemeral: true,
            });
        }
    },
};
