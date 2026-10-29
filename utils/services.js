const SERVICES = [
    { name: 'Discord',   emoji: '💬', hitRate: 71 },
    { name: 'Disney',    emoji: '🏰', hitRate: 40 },
    { name: 'Fortnite',  emoji: '🎯', hitRate: 72 },
    { name: 'Hbo',       emoji: '📺', hitRate: 74 },
    { name: 'Instagram', emoji: '📸', hitRate: 63 },
    { name: 'Ipvanish',  emoji: '🔒', hitRate: 72 },
    { name: 'Minecraft', emoji: '⛏️',  hitRate: 69 },
    { name: 'Netflix',   emoji: '🎬', hitRate: 65 },
    { name: 'Nordvpn',   emoji: '🛡️',  hitRate: 75 },
    { name: 'Paramount', emoji: '⛰️',  hitRate: 70 },
    { name: 'Roblox',   emoji: '🟥', hitRate: 68 },
    { name: 'Spotify',   emoji: '🎵', hitRate: 73 },
    { name: 'Steam',     emoji: '🎮', hitRate: 98 },
    { name: 'Tiktok',    emoji: '🎶', hitRate: 47 },
    { name: 'Uplay',     emoji: '🕹️',  hitRate: 67 },
    { name: 'Valorant',  emoji: '🔫', hitRate: 66 },
];

function stockDot(count) {
    if (count === 0)  return '⚫';
    if (count <= 5)   return '🔴';
    if (count <= 15)  return '🟠';
    return '🟢';
}

module.exports = { SERVICES, stockDot };
