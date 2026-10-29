const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const { db }  = require('../database');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Each entry lists URLs to try in order — first success wins
const EMOJI_LIST = [
    {
        service: 'Discord', name: 'rev_discord',
        urls: [
            'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
            'https://static.vecteezy.com/system/resources/previews/018/930/500/non_2x/discord-logo-discord-icon-transparent-free-png.png',
            'https://cdn.freebiesupply.com/logos/large/2x/discord-logo-png-transparent.png',
        ],
    },
    {
        service: 'Disney', name: 'rev_disney',
        urls: [
            'https://cdn.freebiesupply.com/logos/large/2x/disney-plus-logo-png-transparent.png',
            'https://download.logo.wine/logo/Disney%2B/Disney%2B-Logo.wine.png',
            'https://img.icons8.com/color/96/disney.png',
        ],
    },
    {
        service: 'Fortnite', name: 'rev_fortnite',
        urls: [
            'https://pngimg.com/uploads/fortnite/fortnite_PNG25.png',
            'https://assets.stickpng.com/images/5ef09460f3d0af0004ad1776.png',
            'https://img.icons8.com/color/96/fortnite.png',
        ],
    },
    {
        service: 'Hbo', name: 'rev_hbo',
        urls: [
            'https://download.logo.wine/logo/HBO_Max/HBO_Max-Logo.wine.png',
            'https://images.seeklogo.com/logo-png/39/1/hbo-max-logo-png_seeklogo-392240.png',
            'https://img.icons8.com/color/96/hbo.png',
        ],
    },
    {
        service: 'Instagram', name: 'rev_instagram',
        urls: [
            'https://static.vecteezy.com/system/resources/previews/018/930/415/non_2x/instagram-logo-instagram-icon-transparent-free-png.png',
            'https://img.icons8.com/color/96/instagram-new--v1.png',
        ],
    },
    {
        service: 'Ipvanish', name: 'rev_ipvanish',
        urls: [
            'https://www.ipvanish.com/wp-content/uploads/2021/10/ipvanish-full-logo.png',
            'https://img.icons8.com/color/96/vpn.png',
        ],
    },
    {
        service: 'Minecraft', name: 'rev_minecraft',
        urls: [
            'https://images.seeklogo.com/logo-png/63/1/minecraft-creeper-logo-png_seeklogo-637629.png',
            'https://assets.stickpng.com/images/580b57fcd9996e24bc43c2f7.png',
            'https://img.icons8.com/color/96/minecraft-logo.png',
        ],
    },
    {
        service: 'Netflix', name: 'rev_netflix',
        urls: [
            'https://www.citypng.com/public/uploads/preview/512-netflix-n-sign-logo-701751694792620xxe0ucbues.png',
            'https://img.icons8.com/color/96/netflix.png',
        ],
    },
    {
        service: 'Nordvpn', name: 'rev_nordvpn',
        urls: [
            'https://upload.wikimedia.org/wikipedia/commons/9/90/NordVPN_logo_%282025%29.png',
            'https://upload.wikimedia.org/wikipedia/commons/1/17/Logo-NordVPN.png',
            'https://img.icons8.com/color/96/nordvpn.png',
        ],
    },
    {
        service: 'Paramount', name: 'rev_paramount',
        urls: [
            'https://www.edigitalagency.com.au/wp-content/uploads/Paramount-plus-logo-blue-PNG.png',
            'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Paramount_Plus.svg/1280px-Paramount_Plus.svg.png',
            'https://img.icons8.com/color/96/paramount-plus.png',
        ],
    },
    {
        service: 'Spotify', name: 'rev_spotify',
        urls: [
            'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png',
            'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/3840px-Spotify_logo_without_text.svg.png',
            'https://img.icons8.com/color/96/spotify.png',
        ],
    },
    {
        service: 'Steam', name: 'rev_steam',
        urls: [
            'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/1280px-Steam_icon_logo.svg.png',
            'https://www.citypng.com/public/uploads/preview/hd-steam-logo-transparent-background-701751694706444hl2ol7rn4d.png',
            'https://img.icons8.com/color/96/steam.png',
        ],
    },
    {
        service: 'Tiktok', name: 'rev_tiktok',
        urls: [
            'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png',
            'https://static.vecteezy.com/system/resources/thumbnails/023/986/939/small/tiktok-logo-tiktok-logo-transparent-tiktok-icon-transparent-free-free-png.png',
            'https://img.icons8.com/color/96/tiktok.png',
        ],
    },
    {
        service: 'Uplay', name: 'rev_uplay',
        urls: [
            'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Ubisoft_logo.svg/1280px-Ubisoft_logo.svg.png',
            'https://assets.stickpng.com/images/60e7fc40711cf700048b6a6f.png',
            'https://img.icons8.com/color/96/ubisoft.png',
        ],
    },
    {
        service: 'Valorant', name: 'rev_valorant',
        urls: [
            'https://static.vecteezy.com/system/resources/previews/022/636/373/non_2x/valorant-logo-valorant-icon-transparent-free-png.png',
            'https://upload.wikimedia.org/wikipedia/commons/f/fc/Valorant_logo_-_pink_color_version_%28cropped%29.png',
            'https://img.icons8.com/color/96/valorant.png',
        ],
    },
    // Roblox service + utility/currency emoji
    { service: 'Roblox',      name: 'rev_roblox',      urls: ['https://upload.wikimedia.org/wikipedia/commons/1/1e/Roblox_Logo_2025.png',                               'https://assets.stickpng.com/images/6294eb0b4609037792ef36f2.png',                'https://img.icons8.com/color/96/roblox.png'] },
    { service: '_bitcoin',    name: 'rev_bitcoin',     urls: ['https://logos-world.net/wp-content/uploads/2020/08/Bitcoin-Logo.png',                                     'https://cdn.freebiesupply.com/logos/large/2x/bitcoin-logo-png-transparent.png',   'https://img.icons8.com/color/96/bitcoin.png'] },
    { service: '_litecoin',   name: 'rev_litecoin',    urls: ['https://cryptologos.cc/logos/litecoin-ltc-logo.png',                                                     'https://assets.coingecko.com/coins/images/2/large/litecoin.png',                  'https://img.icons8.com/color/96/litecoin.png'] },
    { service: '_solana',     name: 'rev_solana',      urls: ['https://cryptologos.cc/logos/solana-sol-logo.png',                                                         'https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png',                   'https://img.icons8.com/color/96/solana.png'] },
    { service: '_paypal',     name: 'rev_paypal',      urls: ['https://cdn.freebiesupply.com/logos/large/2x/paypal-icon-logo-png-transparent.png',                       'https://assets.stickpng.com/images/580b57fcd9996e24bc43c530.png',                 'https://img.icons8.com/color/96/paypal.png'] },
    { service: '_visa',       name: 'rev_visa',        urls: ['https://upload.wikimedia.org/wikipedia/commons/d/d3/Visa_Inc._logo_%282005%E2%80%932014%29.png',           'https://cdn.freebiesupply.com/logos/large/2x/visa-2-logo-png-transparent.png',    'https://img.icons8.com/color/96/visa.png'] },
    { service: '_giftcard',   name: 'rev_giftcard',    urls: ['https://img.icons8.com/color/96/gift-card.png',           'https://img.icons8.com/fluency/96/gift-card.png'] },
    { service: '_steamgc',    name: 'rev_steamgc',     urls: ['https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/1280px-Steam_icon_logo.svg.png', 'https://img.icons8.com/color/96/steam-symbol.png'] },
    { service: '_robux',      name: 'rev_robux',       urls: ['https://upload.wikimedia.org/wikipedia/commons/1/1e/Roblox_Logo_2025.png',                                'https://img.icons8.com/color/96/roblox.png'] },
    { service: '_crown',      name: 'rev_crown',       urls: ['https://img.icons8.com/emoji/96/crown.png',               'https://img.icons8.com/color/96/crown.png'] },
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

        // Always fetch fresh from Discord so cache is never stale
        await guild.emojis.fetch();

        for (const item of EMOJI_LIST) {
            // Delete ALL existing emoji with this name (handles duplicates)
            const dupes = guild.emojis.cache.filter(e => e.name === item.name);
            for (const [, e] of dupes) {
                await e.delete('Revora emoji refresh').catch(() => {});
                await sleep(500);
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
