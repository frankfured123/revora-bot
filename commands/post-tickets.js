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
            .setAuthor({
                name: 'Revora.xyz — Support',
                iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Roblox_Logo_2022.svg/512px-Roblox_Logo_2022.svg.png',
            })
            .setTitle('👑 Open a Support Ticket')
            .setDescription([
                '> Need help? Our support team is here for you 24/7.',
                '> Click **Open Ticket** below to create a private support channel.',
                '',
                '━━━━━━━━━━━━━━━━━━━━━━━━━━',
                '',
                '**Have the following ready:**',
                '> • A clear description of your issue',
                '> • Which product you purchased',
                '> • Any screenshots or error messages',
            ].join('\n'))
            .addFields(
                { name: '⏱️ Response Time',    value: 'Typically within a few hours',                                    inline: true  },
                { name: '🛍️ Products Covered', value: 'CS2 · Roblox · Minecraft · Bloodstrike · Combat Master · OGU', inline: false },
            )
            .setFooter({ text: 'Revora.xyz • Support' })
            .setTimestamp();

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
