const express = require('express');
const axios   = require('axios');
const config  = require('../config');
const { db }  = require('../database');

const app = express();

app.get('/verify', async (req, res) => {
    const { code, state: userId } = req.query;
    if (!code || !userId) return res.status(400).send(errorPage('Missing parameters.'));

    try {
        console.log('[OAuth Debug] client_id:', config.clientId);
        console.log('[OAuth Debug] client_secret length:', config.clientSecret?.length);
        console.log('[OAuth Debug] redirect_uri:', config.redirectUri);
        console.log('[OAuth Debug] code length:', code?.length);

        const tokenRes = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id:     config.clientId,
                client_secret: config.clientSecret,
                grant_type:    'authorization_code',
                code,
                redirect_uri:  config.redirectUri,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        const { access_token, refresh_token } = tokenRes.data;

        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const user = userRes.data;

        if (user.id !== userId) return res.status(403).send(errorPage('User ID mismatch.'));

        let guildsJson = '[]';
        try {
            const gr = await axios.get('https://discord.com/api/users/@me/guilds', {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            guildsJson = JSON.stringify(gr.data.map(g => g.id));
        } catch (_) {}

        db.saveUser(user.id, user.username, access_token, refresh_token, guildsJson);

        await assignVerifiedRoles(userId);
        res.send(successPage(user.username));
    } catch (err) {
        console.error('[OAuth]', err.response?.data || err.message);
        res.status(500).send(errorPage('Verification failed. Please try again.'));
    }
});

async function assignVerifiedRoles(userId) {
    const guild = global.discordClient?.guilds.cache.get(config.guildId);
    if (!guild) return;
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return;

    const memberRole     = guild.roles.cache.find(r => r.name === 'Member');
    const unverifiedRole = guild.roles.cache.find(r => r.name === 'Unverified');
    if (memberRole)     await member.roles.add(memberRole).catch(console.error);
    if (unverifiedRole) await member.roles.remove(unverifiedRole).catch(console.error);

    const general = guild.channels.cache.find(c => c.name.includes('general'));
    await member.send({
        embeds: [{
            color: 0xFF0000,
            title: '✅ Verification Successful',
            description: `Welcome to **Revora**, ${member.user.username}!\n\nYou now have full member access.${general ? ` Head to <#${general.id}> to say hello.` : ''}`,
            footer: { text: 'Revora • 2026' },
        }],
    }).catch(() => {});
}

function startWebServer(client) {
    global.discordClient = client;
    const server = app.listen(config.port, () => console.log(`[Web] OAuth server on port ${config.port}`));
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`[Web] Port ${config.port} in use — OAuth verification disabled. Kill other processes on that port to enable it.`);
        } else {
            console.error('[Web]', err);
        }
    });
}

function successPage(username) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Revora</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0d0d0d;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Segoe UI',sans-serif;color:#fff}.card{background:#1a0000;border:1px solid #ff0000;border-radius:12px;padding:48px 40px;text-align:center;max-width:420px}h1{color:#ff0000;font-size:2rem;margin-bottom:12px}p{color:#ccc;line-height:1.6}.badge{display:inline-block;background:#ff0000;color:#fff;padding:6px 18px;border-radius:20px;font-weight:600;margin-top:20px}</style>
</head><body><div class="card"><h1>✅ Verified</h1><p>Welcome to <strong>Revora</strong>, <strong>${username}</strong>!</p><p style="margin-top:12px">Return to Discord — you now have full member access.</p><div class="badge">Member</div></div></body></html>`;
}

function errorPage(msg) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Revora</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0d0d0d;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Segoe UI',sans-serif;color:#fff}.card{background:#1a0000;border:1px solid #ff0000;border-radius:12px;padding:48px 40px;text-align:center;max-width:420px}h1{color:#ff0000;font-size:2rem;margin-bottom:12px}p{color:#ccc}</style>
</head><body><div class="card"><h1>❌ Error</h1><p>${msg}</p></div></body></html>`;
}

module.exports = { startWebServer };
