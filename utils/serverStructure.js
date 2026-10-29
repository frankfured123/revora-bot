const { PermissionFlagsBits } = require('discord.js');

const ROLES = [
    { name: 'Owner',      color: 0xFF0000, hoist: true,  mentionable: false, position: 8 },
    { name: 'Admin',      color: 0xCC0000, hoist: true,  mentionable: false, position: 7 },
    { name: 'Support',    color: 0xFF4500, hoist: true,  mentionable: false, position: 6 },
    { name: 'Customer',   color: 0xFF6666, hoist: true,  mentionable: true,  position: 5 },
    { name: 'Booster',    color: 0xFF1493, hoist: false, mentionable: false, position: 4 },
    { name: 'Member',     color: 0x8B0000, hoist: false, mentionable: false, position: 3 },
    { name: 'Unverified', color: 0x1C1C1C, hoist: false, mentionable: false, position: 2 },
];

const VIEW  = PermissionFlagsBits.ViewChannel;
const READ  = PermissionFlagsBits.ReadMessageHistory;
const SEND  = PermissionFlagsBits.SendMessages;
const CONN  = PermissionFlagsBits.Connect;
const SPEAK = PermissionFlagsBits.Speak;
const EMBED = PermissionFlagsBits.EmbedLinks;
const ATTACH = PermissionFlagsBits.AttachFiles;
const REACT = PermissionFlagsBits.AddReactions;
const THREAD = PermissionFlagsBits.CreatePublicThreads;

// Permission builders (roles resolved at runtime)
const everyone = (guild) => guild.roles.everyone;
const role     = (guild, name) => guild.roles.cache.find(r => r.name === name);

function viewOnlyPerms(guild, allowedRoles) {
    const perms = [
        { id: everyone(guild).id, deny: [VIEW] },
    ];
    for (const name of allowedRoles) {
        const r = role(guild, name);
        if (r) perms.push({ id: r.id, allow: [VIEW, READ], deny: [SEND] });
    }
    return perms;
}

function talkPerms(guild, allowedRoles) {
    const perms = [
        { id: everyone(guild).id, deny: [VIEW] },
    ];
    for (const name of allowedRoles) {
        const r = role(guild, name);
        if (r) perms.push({ id: r.id, allow: [VIEW, READ, SEND, EMBED, ATTACH, REACT] });
    }
    return perms;
}

function voicePerms(guild, allowedRoles) {
    const perms = [
        { id: everyone(guild).id, deny: [VIEW, CONN] },
    ];
    for (const name of allowedRoles) {
        const r = role(guild, name);
        if (r) perms.push({ id: r.id, allow: [VIEW, CONN, SPEAK] });
    }
    return perms;
}

function adminOnlyPerms(guild) {
    return [
        { id: everyone(guild).id, deny: [VIEW] },
        ...['Admin', 'Owner'].map(name => {
            const r = role(guild, name);
            return r ? { id: r.id, allow: [VIEW, READ, SEND, EMBED, ATTACH] } : null;
        }).filter(Boolean),
    ];
}

function supportTeamPerms(guild) {
    return [
        { id: everyone(guild).id, deny: [VIEW] },
        ...['Support', 'Admin', 'Owner'].map(name => {
            const r = role(guild, name);
            return r ? { id: r.id, allow: [VIEW, READ, SEND, EMBED, ATTACH] } : null;
        }).filter(Boolean),
    ];
}

// Returns the full category + channel tree
function getStructure(guild) {
    const membersAndAbove = ['Member', 'Customer', 'Booster', 'Support', 'Admin', 'Owner'];
    const supportAndAbove = ['Support', 'Admin', 'Owner'];
    const adminAndAbove   = ['Admin', 'Owner'];

    return [
        {
            name: '✅  VERIFICATION',
            permissionOverwrites: [
                { id: everyone(guild).id, deny: [VIEW] },
                ...([ role(guild, 'Unverified') ].filter(Boolean).map(r => ({
                    id: r.id, allow: [VIEW, READ], deny: [SEND],
                }))),
            ],
            channels: [
                { name: '🔐・verify-here', type: 'text', permissionOverwrites: [] },
            ],
        },
        {
            name: '📋  ABOUT REVORA',
            permissionOverwrites: viewOnlyPerms(guild, membersAndAbove),
            channels: [
                { name: '👋・welcome',       type: 'text' },
                { name: '📜・rules-and-terms', type: 'text' },
                { name: 'ℹ️・about-us',      type: 'text' },
            ],
        },
        {
            name: '📢  NEWS',
            permissionOverwrites: viewOnlyPerms(guild, membersAndAbove),
            channels: [
                { name: '📣・announcements',  type: 'text' },
                { name: '🎁・giveaways',      type: 'text' },
                { name: '🚀・server-boost',   type: 'text' },
                { name: '💳・payment-info',   type: 'text' },
                { name: '🔄・status-updates', type: 'text' },
            ],
        },
        {
            name: '🛍️  PRODUCTS',
            permissionOverwrites: viewOnlyPerms(guild, membersAndAbove),
            channels: [
                { name: '🎮・cs2-internal-external',    type: 'text' },
                { name: '🎲・roblox-external',          type: 'text' },
                { name: '⛏️・minecraft-client',         type: 'text' },
                { name: '🎯・bloodstrike-external',     type: 'text' },
                { name: '⚔️・combat-master-external',  type: 'text' },
            ],
        },
        {
            name: '🎫  SUPPORT',
            permissionOverwrites: viewOnlyPerms(guild, membersAndAbove),
            channels: [
                { name: '🎫・create-ticket', type: 'text' },
                { name: '🔊・support-vc',    type: 'voice', permissionOverwrites: voicePerms(guild, membersAndAbove) },
            ],
        },
        {
            name: '🔒  SUPPORT TEAM',
            permissionOverwrites: supportTeamPerms(guild),
            channels: [
                { name: '📋・support-logs', type: 'text' },
                { name: '💬・support-chat', type: 'text' },
                { name: '🔊・support-team-vc', type: 'voice', permissionOverwrites: voicePerms(guild, supportAndAbove) },
            ],
        },
        {
            name: '💬  COMMUNITY',
            permissionOverwrites: talkPerms(guild, membersAndAbove),
            channels: [
                { name: '💬・general',              type: 'text' },
                { name: '🎁・community-giveaways',  type: 'text' },
                { name: '🖼️・media',               type: 'text', permissionOverwrites: [
                    { id: everyone(guild).id, deny: [VIEW] },
                    ...membersAndAbove.map(name => {
                        const r = role(guild, name);
                        return r ? { id: r.id, allow: [VIEW, READ, SEND, ATTACH, EMBED] } : null;
                    }).filter(Boolean),
                ]},
            ],
        },
        {
            name: '🔧  MODERATION',
            permissionOverwrites: adminOnlyPerms(guild),
            channels: [
                { name: '📋・mod-logs',  type: 'text' },
                { name: '💬・mod-chat',  type: 'text' },
                { name: '🚨・reports',   type: 'text' },
                { name: '🔊・mod-vc',    type: 'voice', permissionOverwrites: voicePerms(guild, adminAndAbove) },
            ],
        },
        {
            name: '🎫  TICKETS',
            permissionOverwrites: [
                { id: everyone(guild).id, deny: [VIEW] },
                ...supportAndAbove.map(name => {
                    const r = role(guild, name);
                    return r ? { id: r.id, allow: [VIEW, READ, SEND, EMBED, ATTACH] } : null;
                }).filter(Boolean),
            ],
            channels: [],
        },
    ];
}

module.exports = { ROLES, getStructure };
