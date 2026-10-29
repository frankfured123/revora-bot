const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../database');

const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sync-joins')
        .setDescription('Post a join message for every current member in order of join date.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const guild = interaction.guild;

        const joinsCh = guild.channels.cache.find(c =>
            c.name === 'joins' || c.name === 'join-logs' || c.name === 'welcome' || c.name === 'welcomes'
        );
        if (!joinsCh) {
            return interaction.reply({
                content: '❌ No **#joins** channel found. Create a channel named `joins` first.',
                ephemeral: true,
            });
        }

        await interaction.reply({
            content: '⏳ Fetching all members and posting join history... this may take a while.',
            ephemeral: true,
        });

        // Fetch ALL members (important — Discord lazy-loads)
        await guild.members.fetch();

        // Sort by joinedAt ascending (earliest first), skip bots
        const members = [...guild.members.cache.values()]
            .filter(m => !m.user.bot && m.joinedAt)
            .sort((a, b) => a.joinedAt - b.joinedAt);

        // Build a lookup of member ID -> invite record from DB
        const inviteUsage = db.getAllInviteUsage?.() ?? [];
        const inviteMap   = new Map(inviteUsage.map(r => [r.invitee_id, r]));

        let posted = 0;
        for (const member of members) {
            const record      = inviteMap.get(member.id);
            const inviterMention = record?.inviter_id && record.inviter_id !== 'unknown'
                ? `<@${record.inviter_id}>`
                : null;

            const description = inviterMention
                ? `${member} joined from ${inviterMention}'s invite link`
                : `${member} joined the server`;

            await joinsCh.send({ content: description }).catch(() => {});

            posted++;
            // Stay under Discord rate limits (5 msg / 5s) — 1.1s gap
            await sleep(1100);
        }

        await interaction.editReply({
            content: `✅ Done! Posted join history for **${posted}** member${posted === 1 ? '' : 's'} in ${joinsCh}.`,
        });
    },
};
