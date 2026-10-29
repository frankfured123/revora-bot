const { EmbedBuilder } = require('discord.js');
const { findUsedInvite } = require('../utils/inviteTracker');
const { db } = require('../database');

const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        const guild = member.guild;

        // Assign Unverified role
        const unverifiedRole = guild.roles.cache.find(r => r.name === 'Unverified');
        if (unverifiedRole) await member.roles.add(unverifiedRole).catch(() => {});

        // ── Invite detection (best-effort, 7 strategies) ───────────────────
        // Wait for Discord's API to update invite use counts before comparing
        await sleep(1500);

        let invite = null;
        try {
            invite = await findUsedInvite(guild, client);
            if (invite) {
                db.recordInviteUsage(invite.code, invite.inviterId ?? 'unknown', member.id);
            }
        } catch (_) {}

        const inviterMention = invite?.inviterId ? `<@${invite.inviterId}>` : null;

        // ── #joins announcement ────────────────────────────────────────────
        const joinsCh = guild.channels.cache.find(c =>
            c.name === 'joins' || c.name === 'join-logs' || c.name === 'welcome' || c.name === 'welcomes'
        );

        if (joinsCh) {
            let description;
            if (inviterMention) {
                description = `${member} joined from ${inviterMention}'s invite link`;
            } else if (invite?.code === guild.vanityURLCode) {
                description = `${member} joined using the server's vanity URL`;
            } else {
                description = `${member} joined the server`;
            }

            await joinsCh.send({ content: description }).catch(() => {});
        }

        // ── mod-logs (detailed) ────────────────────────────────────────────
        const modLogs = guild.channels.cache.find(c => c.name.includes('mod-logs'));
        if (modLogs) {
            let inviteText;
            if (invite) {
                const method = {
                    use_count:  'use count increase',
                    one_time:   'one-time invite consumed',
                    last_slot:  'last slot used',
                    vanity:     'vanity URL',
                    only_invite:'only invite in server',
                }[invite.method] ?? invite.method;

                inviteText = inviterMention
                    ? `\`${invite.code}\` — created by ${inviterMention} *(${method})*`
                    : `\`${invite.code}\` — no creator found *(${method})*`;
            } else {
                inviteText = 'Could not determine — joined via unknown link';
            }

            await modLogs.send({
                embeds: [new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('📥 Member Joined')
                    .setThumbnail(member.user.displayAvatarURL())
                    .addFields(
                        { name: '👤 Member',         value: `${member} (${member.user.tag})`,                                        inline: false },
                        { name: '🔗 Invite',          value: inviteText,                                                              inline: false },
                        { name: '📅 Account Age',     value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,              inline: true  },
                        { name: '📊 Member Count',    value: `${guild.memberCount}`,                                                  inline: true  },
                    )
                    .setFooter({ text: `ID: ${member.id}` })
                    .setTimestamp()
                ],
            }).catch(() => {});
        }

        // ── DM welcome ─────────────────────────────────────────────────────
        const verifyCh = guild.channels.cache.find(c => c.name.includes('verify-here'));
        await member.send({
            embeds: [new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('👋 Welcome to Revora!')
                .setDescription([
                    `Hey **${member.user.username}**, welcome to **Revora**!`,
                    '',
                    'Before you can access the server you need to **verify your account**.',
                    '',
                    `Head to ${verifyCh ? `<#${verifyCh.id}>` : '#verify-here'} and click **Verify Now**.`,
                    'It only takes a few seconds.',
                ].join('\n'))
                .setFooter({ text: 'Revora • 2026' })
            ],
        }).catch(() => {});
    },
};
