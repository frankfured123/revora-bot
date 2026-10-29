module.exports = {
    name: 'inviteCreate',
    async execute(invite, client) {
        const snapshot = client.invites.get(invite.guild.id) ?? new Map();
        snapshot.set(invite.code, {
            uses:      invite.uses      ?? 0,
            inviterId: invite.inviter?.id ?? null,
            maxUses:   invite.maxUses   ?? 0,
        });
        client.invites.set(invite.guild.id, snapshot);
    },
};
