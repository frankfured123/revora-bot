const {
    ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder,
    ButtonBuilder, ButtonStyle,
} = require('discord.js');
const { createTicket, closeTicket } = require('../utils/ticketManager');
const config = require('../config');

const PRODUCTS = [
    { label: 'CS2 Internal',             value: 'CS2 Internal' },
    { label: 'CS2 External',             value: 'CS2 External' },
    { label: 'Roblox External',          value: 'Roblox External' },
    { label: 'Minecraft Client',         value: 'Minecraft Client' },
    { label: 'Bloodstrike External',     value: 'Bloodstrike External' },
    { label: 'Combat Master External',   value: 'Combat Master External' },
    { label: '🎉 Claim Giveaway Prize',  value: 'Claim Giveaway Prize' },
    { label: 'Other / General',          value: 'Other / General' },
];

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {

        // ── Autocomplete ───────────────────────────────────────────────────
        if (interaction.isAutocomplete()) {
            const cmd = client.commands.get(interaction.commandName);
            if (cmd?.autocomplete) await cmd.autocomplete(interaction).catch(() => {});
            return;
        }

        // ── Slash Commands ─────────────────────────────────────────────────
        if (interaction.isChatInputCommand()) {
            const cmd = client.commands.get(interaction.commandName);
            if (!cmd) return;
            try {
                await cmd.execute(interaction);
            } catch (err) {
                console.error(err);
                const msg = { content: '❌ An error occurred.', ephemeral: true };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(msg).catch(() => {});
                } else {
                    await interaction.reply(msg).catch(() => {});
                }
            }
            return;
        }

        // ── Button: Verify ─────────────────────────────────────────────────
        if (interaction.isButton() && interaction.customId === 'verify_button') {
            const guild        = interaction.guild;
            const member       = interaction.member;
            const memberRole   = guild.roles.cache.find(r => r.name === 'Member');
            const unverified   = guild.roles.cache.find(r => r.name === 'Unverified');

            if (member.roles.cache.has(memberRole?.id)) {
                return interaction.reply({ content: '✅ You are already verified!', ephemeral: true });
            }

            try {
                if (memberRole)  await member.roles.add(memberRole);
                if (unverified)  await member.roles.remove(unverified);

                await interaction.reply({
                    content: '✅ **You have been verified!** Welcome to Revora — you now have full member access.',
                    ephemeral: true,
                });

                // Log to mod-logs
                const modLogs = guild.channels.cache.find(c => c.name.includes('mod-logs'));
                if (modLogs) {
                    const { EmbedBuilder } = require('discord.js');
                    await modLogs.send({ embeds: [new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('✅ Member Verified')
                        .setDescription(`${member} verified their account.`)
                        .setTimestamp()
                    ]}).catch(() => {});
                }
            } catch (err) {
                console.error('[Verify]', err);
                await interaction.reply({ content: '❌ Failed to assign role. Make sure the bot role is above the Member role in Server Settings → Roles.', ephemeral: true });
            }
            return;
        }

        // ── Button: Create Ticket (step 1 — show product select) ───────────
        if (interaction.isButton() && interaction.customId === 'create_ticket_button') {
            const select = new StringSelectMenuBuilder()
                .setCustomId('select_ticket_product')
                .setPlaceholder('Select the product you purchased...')
                .addOptions(PRODUCTS.map(p =>
                    new StringSelectMenuOptionBuilder().setLabel(p.label).setValue(p.value)
                ));

            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('🎫 Open a Ticket — Step 1 of 2')
                    .setDescription('Select the product you purchased, then click **Continue**.')
                    .setFooter({ text: 'Revora Support' })
                ],
                components: [new ActionRowBuilder().addComponents(select)],
                ephemeral: true,
            });
            return;
        }

        // ── Select: Product chosen (step 2 — open modal) ──────────────────
        if (interaction.isStringSelectMenu() && interaction.customId === 'select_ticket_product') {
            const product = interaction.values[0];

            const modal = new ModalBuilder()
                .setCustomId(`ticket_modal|${product}`)
                .setTitle('Open a Support Ticket');

            const issueInput = new TextInputBuilder()
                .setCustomId('ticket_issue')
                .setLabel('Describe your issue in detail')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Explain what happened, what you expected, and any error messages...')
                .setRequired(true)
                .setMinLength(20)
                .setMaxLength(1000);

            modal.addComponents(new ActionRowBuilder().addComponents(issueInput));
            await interaction.showModal(modal);
            return;
        }

        // ── Modal Submit: Ticket ───────────────────────────────────────────
        if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal|')) {
            const product = interaction.customId.split('|')[1];
            const issue   = interaction.fields.getTextInputValue('ticket_issue');

            await interaction.deferReply({ ephemeral: true });

            try {
                const channel = await createTicket(
                    interaction.guild,
                    interaction.member,
                    product,
                    issue
                );

                await interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('✅ Ticket Created')
                        .setDescription(`Your ticket has been opened in ${channel}.\n\nA support member will be with you shortly.`)
                        .setFooter({ text: 'Revora Support' })
                    ],
                });
            } catch (err) {
                console.error('[Ticket]', err);
                await interaction.editReply({ content: `❌ ${err.message}` });
            }
            return;
        }

        // ── Button: Enter Giveaway ────────────────────────────────────────
        if (interaction.isButton() && interaction.customId.startsWith('enter_giveaway_')) {
            const giveawayId = interaction.customId.replace('enter_giveaway_', '');
            const { db } = require('../database');
            const { buildEmbed } = require('../utils/giveawayManager');

            const giveaway = db.getGiveaway(giveawayId);
            if (!giveaway || giveaway.ended) {
                return interaction.reply({ content: '❌ This giveaway has already ended.', ephemeral: true });
            }

            const added = db.addGiveawayEntry(giveawayId, interaction.user.id);
            if (!added) {
                return interaction.reply({ content: '✅ You are already entered in this giveaway!', ephemeral: true });
            }

            // Update embed with new entry count
            const updated = db.getGiveaway(giveawayId);
            await interaction.message.edit({ embeds: [buildEmbed(updated)] }).catch(() => {});

            return interaction.reply({
                content: `🎉 You have entered the **${giveaway.product}** giveaway! Good luck!`,
                ephemeral: true,
            });
        }

        // ── Button: OGU Purchase ─────────────────────────────────────────
        if (interaction.isButton() && interaction.customId.startsWith('ogu_')) {
            const serviceMap = {
                ogu_discord: 'Discord OGU',
                ogu_steam:   'Steam OGU',
                ogu_roblox:  'Roblox OGU',
            };
            const product = serviceMap[interaction.customId] ?? 'OGU Purchase';

            const modal = new ModalBuilder()
                .setCustomId(`ticket_modal|${product}`)
                .setTitle(`Purchase — ${product}`);

            const issueInput = new TextInputBuilder()
                .setCustomId('ticket_issue')
                .setLabel('Your order details')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Tell us any preferences for your username, your payment method, and your Discord / username...')
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(1000);

            modal.addComponents(new ActionRowBuilder().addComponents(issueInput));
            await interaction.showModal(modal);
            return;
        }

        // ── Button: Close Ticket ──────────────────────────────────────────
        if (interaction.isButton() && interaction.customId === 'close_ticket') {
            const supportRole = interaction.guild.roles.cache.find(r => r.name === 'Support');
            const adminRole   = interaction.guild.roles.cache.find(r => r.name === 'Admin');
            const ownerRole   = interaction.guild.roles.cache.find(r => r.name === 'Owner');

            const hasPermission =
                interaction.member.roles.cache.has(supportRole?.id) ||
                interaction.member.roles.cache.has(adminRole?.id)   ||
                interaction.member.roles.cache.has(ownerRole?.id);

            if (!hasPermission) {
                return interaction.reply({
                    content: '❌ Only Support staff can close tickets.',
                    ephemeral: true,
                });
            }

            await interaction.reply({
                content: '🔒 Closing ticket in 5 seconds...',
                ephemeral: false,
            });

            await closeTicket(interaction.channel, interaction.member);
            return;
        }
    },
};
