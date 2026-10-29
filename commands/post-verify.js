const {
    SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle,
    ActionRowBuilder, PermissionFlagsBits,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('post-verify')
        .setDescription('Post the verification embed in #verify-here.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.guild.channels.cache.find(
            c => c.name.includes('verify-here')
        );
        if (!channel) return interaction.reply({ content: '❌ #verify-here not found. Run /setup first.', ephemeral: true });

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🔐 Verify Your Account')
            .setDescription([
                'To gain full access to **Revora**, you must verify your Discord account.',
                '',
                '**Click the button below** to begin the verification process.',
                '',
                '> By verifying, you authorise Revora to confirm your Discord identity',
                '> and automatically grant you Member access.',
            ].join('\n'))
            .addFields({
                name: '✅ What verification does',
                value: '• Confirms your Discord account is real\n• Gives you the **Member** role\n• Unlocks all member channels',
            })
            .setFooter({ text: 'Revora • This only takes a few seconds' });

        const btn = new ButtonBuilder()
            .setCustomId('verify_button')
            .setLabel('✅  Verify Now')
            .setStyle(ButtonStyle.Danger);

        await channel.send({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(btn)],
        });

        await interaction.reply({ content: '✅ Verification embed posted.', ephemeral: true });
    },
};
