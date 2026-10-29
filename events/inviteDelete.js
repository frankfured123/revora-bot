module.exports = {
    name: 'inviteDelete',
    async execute(invite, client) {
        const cached = client.invites.get(invite.guild.id);
        if (cached) {
            cached.delete(invite.code);
            client.invites.set(invite.guild.id, cached);
        }
    },
};
