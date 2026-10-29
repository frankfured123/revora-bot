const { PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { db } = require('../database');

const VIEW  = PermissionFlagsBits.ViewChannel;
const READ  = PermissionFlagsBits.ReadMessageHistory;
const SEND  = PermissionFlagsBits.SendMessages;
const EMBED = PermissionFlagsBits.EmbedLinks;
const ATTACH = PermissionFlagsBits.AttachFiles;

async function createTicket(guild, member, product, issue) {
    const ticketCategory = guild.channels.cache.find(c => c.name === '🎫  TICKETS' && c.type === 4);
    if (!ticketCategory) throw new Error('Tickets category not found. Run /setup first.');

    const ticketNumber = db.getTicketCount() + 1;
    const channelName  = `ticket-${ticketNumber}-${member.user.username.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}`;

    const supportRole = guild.roles.cache.find(r => r.name === 'Support');
    const adminRole   = guild.roles.cache.find(r => r.name === 'Admin');
    const ownerRole   = guild.roles.cache.find(r => r.name === 'Owner');

    const overwrites = [
        { id: guild.roles.everyone.id, deny: [VIEW] },
        { id: member.id,               allow: [VIEW, READ, SEND, EMBED, ATTACH] },
    ];
    if (supportRole) overwrites.push({ id: supportRole.id, allow: [VIEW, READ, SEND, EMBED, ATTACH] });
    if (adminRole)   overwrites.push({ id: adminRole.id,   allow: [VIEW, READ, SEND, EMBED, ATTACH] });
    if (ownerRole)   overwrites.push({ id: ownerRole.id,   allow: [VIEW, READ, SEND, EMBED, ATTACH] });

    const channel = await guild.channels.create({
        name: channelName,
        parent: ticketCategory.id,
        permissionOverwrites: overwrites,
    });

    db.createTicket(channel.id, member.id, product, issue);

    const closeBtn = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('🔒 Close Ticket')
        .setStyle(ButtonStyle.Danger);

    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(`🎫 Ticket #${ticketNumber}`)
        .setDescription('Support will be with you shortly. Please be patient.')
        .addFields(
            { name: '👤 Member',  value: `${member}`, inline: true },
            { name: '🛍️ Product', value: product,     inline: true },
            { name: '📋 Issue',   value: issue },
        )
        .setFooter({ text: 'Revora Support • 2026' })
        .setTimestamp();

    await channel.send({
        content: `${member} | ${supportRole || ''} — A new ticket has been opened.`,
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(closeBtn)],
    });

    return channel;
}

async function closeTicket(channel, closer) {
    const ticket = db.getTicket(channel.id);
    if (!ticket) return;

    db.closeTicket(channel.id);

    const embed = new EmbedBuilder()
        .setColor(0x1C1C1C)
        .setTitle('🔒 Ticket Closed')
        .setDescription(`This ticket has been closed by ${closer}.`)
        .setTimestamp();

    await channel.send({ embeds: [embed] });

    const logsChannel = channel.guild.channels.cache.find(c => c.name.includes('support-logs'));
    if (logsChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('📋 Ticket Closed')
            .addFields(
                { name: 'Channel',   value: channel.name,           inline: true },
                { name: 'Closed by', value: closer.toString(),      inline: true },
                { name: 'User',      value: `<@${ticket.user_id}>`, inline: true },
                { name: 'Product',   value: ticket.product,         inline: true },
            )
            .setTimestamp();
        await logsChannel.send({ embeds: [logEmbed] });
    }

    setTimeout(() => channel.delete().catch(() => {}), 5000);
}

module.exports = { createTicket, closeTicket };
