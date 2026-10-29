const {
    SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle,
    ActionRowBuilder, PermissionFlagsBits,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('post-tickets')
        .setDescription('Post the ticket creation embed in #create-ticket.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.guild.channels.cache.find(
            c => c.name.includes('create-ticket')
        );
        if (!channel) return interaction.reply({ content: '❌ #create-ticket not found. Run /setup first.', ephemeral: true });

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🎫 Revora Support')
            .setDescription([
                'Need help? Our support team is here for you.',
                '',
                'Click **Open Ticket** below to create a private support ticket.',
                'Please have the following ready:',
                '',
                '• A clear description of your issue',
                '• Which product you purchased',
                '• Any relevant screenshots or error messages',
            ].join('\n'))
            .addFields(
                { name: '⏱️ Response Time', value: 'Typically within a few hours', inline: true },
                { name: '🛍️ Products Supported', value: 'CS2 · Roblox · Minecraft · Bloodstrike · Combat Master', inline: false },
            )
            .setFooter({ text: 'Revora Support • 2026' });

        const btn = new ButtonBuilder()
            .setCustomId('create_ticket_button')
            .setLabel('🎫  Open Ticket')
            .setStyle(ButtonStyle.Danger);

        await channel.send({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(btn)],
        });

        await interaction.reply({ content: '✅ Ticket embed posted.', ephemeral: true });
    },
};
