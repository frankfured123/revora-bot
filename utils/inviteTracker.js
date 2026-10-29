/**
 * Snapshot-based invite tracker.
 *
 * The cache (client.invites) stores Map<guildId, Map<code, {uses, inviterId, maxUses}>>
 * so that inviter info survives after a one-time invite is auto-deleted.
 *
 * Detection order:
 *   1. Invite whose use count increased
 *   2. Brand-new invite that appeared already used (race condition)
 *   3. Invite that disappeared AND was a one-time link (maxUses === 1, uses === 0 before)
 *   4. Invite that disappeared AND any maxUses (someone may have used the last slot)
 *   5. Vanity URL (uses ticked up)
 *   6. Only one invite exists in the guild — must be it
 *   7. Unknown — give up gracefully
 */

async function buildSnapshot(guild) {
    const map = new Map();
    try {
        const invites = await guild.invites.fetch();
        for (const [code, inv] of invites) {
            map.set(code, {
                uses:      inv.uses      ?? 0,
                inviterId: inv.inviter?.id ?? null,
                maxUses:   inv.maxUses   ?? 0,
            });
        }
    } catch (_) {}
    return map;
}

async function findUsedInvite(guild, client) {
    const oldSnapshot = client.invites.get(guild.id) ?? new Map();
    const newSnapshot = await buildSnapshot(guild);

    let usedCode   = null;
    let inviterId  = null;
    let method     = 'unknown';

    // Strategy 1 & 2 — use count increased, or brand-new already used
    for (const [code, data] of newSnapshot) {
        const old = oldSnapshot.get(code);
        const increased = old ? data.uses > old.uses : data.uses > 0;
        if (increased) {
            usedCode  = code;
            inviterId = data.inviterId;
            method    = 'use_count';
            break;
        }
    }

    // Strategy 3 & 4 — invite disappeared (one-time or last slot)
    if (!usedCode) {
        for (const [code, old] of oldSnapshot) {
            if (!newSnapshot.has(code)) {
                usedCode  = code;
                inviterId = old.inviterId;
                method    = old.maxUses === 1 ? 'one_time' : 'last_slot';
                break;
            }
        }
    }

    // Strategy 5 — vanity URL
    if (!usedCode && guild.vanityURLCode) {
        try {
            const vanity    = await guild.fetchVanityData();
            const lastUses  = client.vanityUses?.get(guild.id) ?? 0;
            if (vanity.uses > lastUses) {
                if (!client.vanityUses) client.vanityUses = new Map();
                client.vanityUses.set(guild.id, vanity.uses);
                usedCode  = guild.vanityURLCode;
                inviterId = null;
                method    = 'vanity';
            }
        } catch (_) {}
    }

    // Strategy 6 — only one invite in the whole server
    if (!usedCode && newSnapshot.size === 1) {
        const [[code, data]] = newSnapshot.entries();
        usedCode  = code;
        inviterId = data.inviterId;
        method    = 'only_invite';
    }

    // Persist updated snapshot
    client.invites.set(guild.id, newSnapshot);

    return usedCode ? { code: usedCode, inviterId, method } : null;
}

module.exports = { buildSnapshot, findUsedInvite };
