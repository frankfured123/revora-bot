const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const axios  = require('axios');
const config = require('../config');
const { db } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rejoin-server')
        .setDescription('Re-add all verified users to a new server (use if original server was deleted).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt =>
            opt.setName('guild_id')
               .setDescription('The ID of the new Discord server to add users to')
               .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const newGuildId = interaction.options.getString('guild_id');
        const users = db.getAllVerifiedUsers();

        if (!users.length) return interaction.editReply('❌ No verified users found.');

        await interaction.editReply(`⏳ Adding ${users.length} users to server \`${newGuildId}\`...`);

        let success = 0, failed = 0;
        for (const user of users) {
            try {
                await axios.put(
                    `https://discord.com/api/guilds/${newGuildId}/members/${user.discord_id}`,
                    { access_token: user.access_token },
                    { headers: { Authorization: `Bot ${config.token}`, 'Content-Type': 'application/json' } }
                );
                success++;
            } catch { failed++; }
            await new Promise(r => setTimeout(r, 500));
        }

        await interaction.editReply({
            content: '',
            embeds: [new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('📋 Rejoin Results')
                .addFields(
                    { name: '✅ Added',  value: `${success}`, inline: true },
                    { name: '❌ Failed', value: `${failed}`,  inline: true },
                )
                .setTimestamp()
            ],
        });
    },
};
