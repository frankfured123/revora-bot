const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const { db }  = require('../database');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Each entry lists URLs to try in order — first success wins
const EMOJI_LIST = [
    {
        service: 'Discord', name: 'rev_discord',
        urls: [
            'https://img.icons8.com/color/96/discord-logo.png',
            'https://img.icons8.com/fluency/96/discord-logo.png',
        ],
    },
    {
        service: 'Disney', name: 'rev_disney',
        urls: [
            'https://img.icons8.com/color/96/castle.png',
            'https://img.icons8.com/fluency/96/castle.png',
        ],
    },
    {
        service: 'Fortnite', name: 'rev_fortnite',
        urls: [
            'https://img.icons8.com/color/96/fortnite.png',
            'https://img.icons8.com/fluency/96/fortnite.png',
        ],
    },
    {
        service: 'Hbo', name: 'rev_hbo',
        urls: [
            'https://img.icons8.com/color/96/hbo.png',
            'https://img.icons8.com/fluency/96/hbo.png',
        ],
    },
    {
        service: 'Instagram', name: 'rev_instagram',
        urls: [
            'https://img.icons8.com/color/96/instagram-new--v1.png',
            'https://img.icons8.com/fluency/96/instagram-new.png',
        ],
    },
    {
        service: 'Ipvanish', name: 'rev_ipvanish',
        urls: [
            'https://img.icons8.com/color/96/vpn.png',
            'https://img.icons8.com/fluency/96/vpn.png',
        ],
    },
    {
        service: 'Minecraft', name: 'rev_minecraft',
        urls: [
            'https://img.icons8.com/color/96/minecraft-logo.png',
            'https://img.icons8.com/color/96/minecraft--v1.png',
        ],
    },
    {
        service: 'Netflix', name: 'rev_netflix',
        urls: [
            'https://img.icons8.com/color/96/netflix.png',
            'https://img.icons8.com/fluency/96/netflix.png',
        ],
    },
    {
        service: 'Nordvpn', name: 'rev_nordvpn',
        urls: [
            'https://img.icons8.com/color/96/nordvpn.png',
            'https://img.icons8.com/fluency/96/nordvpn.png',
        ],
    },
    {
        service: 'Paramount', name: 'rev_paramount',
        urls: [
            'https://img.icons8.com/color/96/mountain.png',
            'https://img.icons8.com/fluency/96/mountain.png',
        ],
    },
    {
        service: 'Spotify', name: 'rev_spotify',
        urls: [
            'https://img.icons8.com/color/96/spotify.png',
            'https://img.icons8.com/fluency/96/spotify--v1.png',
        ],
    },
    {
        service: 'Steam', name: 'rev_steam',
        urls: [
            'https://img.icons8.com/color/96/steam.png',
            'https://img.icons8.com/fluency/96/steam.png',
        ],
    },
    {
        service: 'Tiktok', name: 'rev_tiktok',
        urls: [
            'https://img.icons8.com/color/96/tiktok.png',
            'https://img.icons8.com/fluency/96/tiktok.png',
        ],
    },
    {
        service: 'Uplay', name: 'rev_uplay',
        urls: [
            'https://img.icons8.com/color/96/ubisoft.png',
            'https://img.icons8.com/fluency/96/ubisoft.png',
        ],
    },
    {
        service: 'Valorant', name: 'rev_valorant',
        urls: [
            'https://img.icons8.com/color/96/valorant.png',
            'https://img.icons8.com/fluency/96/valorant.png',
        ],
    },
    // Roblox service + utility/currency emoji
    { service: 'Roblox',      name: 'rev_roblox',      urls: ['https://img.icons8.com/color/96/roblox.png',              'https://img.icons8.com/fluency/96/roblox.png'] },
    { service: '_bitcoin',    name: 'rev_bitcoin',     urls: ['https://img.icons8.com/color/96/bitcoin.png',             'https://img.icons8.com/fluency/96/bitcoin.png'] },
    { service: '_litecoin',   name: 'rev_litecoin',    urls: ['https://img.icons8.com/color/96/litecoin.png',            'https://img.icons8.com/fluency/96/litecoin.png'] },
    { service: '_solana',     name: 'rev_solana',      urls: ['https://img.icons8.com/color/96/solana.png',              'https://img.icons8.com/fluency/96/solana.png'] },
    { service: '_paypal',     name: 'rev_paypal',      urls: ['https://img.icons8.com/color/96/paypal.png',              'https://img.icons8.com/fluency/96/paypal.png'] },
    { service: '_visa',       name: 'rev_visa',        urls: ['https://img.icons8.com/color/96/visa.png',                'https://img.icons8.com/fluency/96/visa.png'] },
    { service: '_giftcard',   name: 'rev_giftcard',    urls: ['https://img.icons8.com/color/96/gift-card.png',           'https://img.icons8.com/fluency/96/gift-card.png'] },
    { service: '_steamgc',    name: 'rev_steamgc',     urls: ['https://img.icons8.com/color/96/steam-symbol.png',        'https://img.icons8.com/color/96/steam.png'] },
    { service: '_robux',      name: 'rev_robux',       urls: ['https://img.icons8.com/color/96/robux.png',               'https://img.icons8.com/color/96/roblox.png'] },
    { service: '_crown',      name: 'rev_crown',       urls: ['https://img.icons8.com/color/96/crown.png',               'https://img.icons8.com/fluency/96/crown.png'] },
    { service: '_creditcard', name: 'rev_creditcard',  urls: ['https://img.icons8.com/color/96/bank-card-back-side.png', 'https://img.icons8.com/color/96/credit-card-front-side.png'] },
];

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'image/png,image/webp,image/*,*/*',
};

async function fetchBuffer(urls) {
    for (const url of urls) {
        try {
            const res = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: HEADERS,
                timeout: 10000,
                maxRedirects: 5,
            });
            if (res.status === 200 && res.data?.byteLength > 100) {
                return Buffer.from(res.data);
            }
        } catch { /* try next */ }
    }
    return null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-emojis')
        .setDescription('Upload service brand logos as custom server emoji.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guild   = interaction.guild;
        const results = [];

        for (const item of EMOJI_LIST) {
            // Reuse existing emoji if already uploaded
            const existing = guild.emojis.cache.find(e => e.name === item.name);
            if (existing) {
                db.setGenEmoji(item.service, existing.toString());
                results.push(`✅ \`${item.name}\` already exists ${existing}`);
                continue;
            }

            const buffer = await fetchBuffer(item.urls);
            if (!buffer) {
                results.push(`❌ \`${item.name}\` — could not download image`);
                continue;
            }

            try {
                const emoji = await guild.emojis.create({
                    attachment: buffer,
                    name: item.name,
                    reason: 'Revora emoji setup',
                });
                db.setGenEmoji(item.service, emoji.toString());
                results.push(`✅ \`${item.name}\` uploaded ${emoji}`);
            } catch (err) {
                results.push(`❌ \`${item.name}\` — upload failed: ${err.message}`);
            }

            await sleep(1500);
        }

        const ok   = results.filter(r => r.startsWith('✅')).length;
        const fail = results.filter(r => r.startsWith('❌')).length;

        await interaction.editReply({
            content: [
                `**Emoji Setup — ${ok} uploaded, ${fail} failed**`,
                ``,
                ...results,
                ``,
                ok > 0 ? `Run \`/gen-stock\` to refresh the board with the new icons.` : '',
            ].join('\n'),
        });
    },
};
