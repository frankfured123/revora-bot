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
            .setAuthor({ name: 'Revora.xyz — Verification' })
            .setTitle('👑 Welcome to Revora')
            .setDescription([
                '> To gain **full access** to the server, verify your Discord account below.',
                '> This only takes a few seconds.',
                '',
                '━━━━━━━━━━━━━━━━━━━━━━━━━━',
                '',
                '**What verification gives you:**',
                '> ✅ Confirms your Discord account is real',
                '> 🎭 Grants you the **Member** role',
                '> 🔓 Unlocks all member-only channels',
            ].join('\n'))
            .setFooter({ text: 'Revora.xyz • One click and you\'re in' })
            .setTimestamp();

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
