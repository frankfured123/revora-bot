const {
    SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('post-terms')
        .setDescription('Post the Revora Terms of Service & Rules embed.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.guild.channels.cache.find(
            c => c.name.includes('rules-and-terms')
        );
        if (!channel) return interaction.reply({ content: '❌ #rules-and-terms not found. Run /setup first.', ephemeral: true });

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('📜  REVORA — TERMS OF SERVICE & RULES')
            .setDescription('Welcome to **Revora**. By joining this server you agree to all terms listed below.')
            .addFields(
                {
                    name: '🛡️  Community Standards',
                    value: '• Respect all members and staff at all times\n• No harassment, hate speech, spam or disruptive behaviour\n• All activity must comply with **Discord\'s Terms of Service**\n• Keep conversations relevant and professional\n• No impersonation of staff or members\n• No NSFW content in any channel',
                },
                {
                    name: '💼  Services & Purchases',
                    value: '• Review all product info before purchasing\n• **All sales are final** unless stated otherwise by staff\n• Only use Revora\'s official payment channels\n• Chargebacks without valid reason result in a permanent ban\n• Reselling or redistributing products is strictly prohibited',
                },
                {
                    name: '🎮  Product Usage',
                    value: '• All products are for **personal use only**\n• Redistribution or sharing of any product is prohibited\n• Revora is **not responsible** for account bans from product usage\n• Use all products at your own risk and discretion',
                },
                {
                    name: '🎫  Support',
                    value: '• Use the ticket system for all private support inquiries\n• Provide clear details when creating a ticket\n• Do not spam or abuse the ticket system\n• Do not ping staff directly — open a ticket instead',
                },
                {
                    name: '🔐  Privacy & Security',
                    value: '• Never share personal or sensitive info in public channels\n• Protect your account — do not share your credentials\n• Leaking private server conversations is prohibited',
                },
                {
                    name: '⚡  Enforcement',
                    value: '• Staff may remove content or members that violate these terms\n• Punishments range from warnings to permanent bans\n• Appeals can be submitted via a support ticket',
                },
                {
                    name: '⚠️  Disclaimer',
                    value: 'Revora fully complies with **Discord\'s Terms of Service** and Community Guidelines. All products are for educational and entertainment purposes. Product usage is solely at the user\'s own risk. Revora holds no liability for any consequences arising from product use.',
                },
                {
                    name: '✅  Acceptance',
                    value: 'By remaining in Revora you confirm that you have read, understood, and agreed to these Terms of Service and Rules.\n\n*© 2026 Revora. All rights reserved.*',
                },
            )
            .setFooter({ text: 'Revora • Last updated October 2026' });

        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: '✅ Terms & Rules posted.', ephemeral: true });
    },
};
