const FIRST = ['james','john','robert','michael','william','david','richard','joseph','thomas','charles','mary','patricia','jennifer','linda','barbara','elizabeth','susan','jessica','sarah','karen','daniel','matthew','anthony','mark','donald','steven','paul','andrew','kenneth','george','ryan','kevin','brian','edward','ronald','timothy','jason','jeffrey','frank','scott','eric','stephen','justin','raymond','gregory','samuel','patrick','benjamin','jack','alex','tyler','kyle','brandon','adam','nathan','zachary','ethan','ashley','brittany','amanda','stephanie','melissa','nicole','amber','megan','emma','hannah','olivia','abigail','samantha','kayla','alyssa','sierra','taylor','morgan'];
const LAST  = ['smith','johnson','williams','brown','jones','garcia','miller','davis','rodriguez','martinez','wilson','anderson','taylor','thomas','hernandez','moore','martin','jackson','thompson','white','harris','sanchez','clark','ramirez','lewis','robinson','walker','perez','hall','young','allen','king','wright','scott','green','baker','adams','nelson','carter','mitchell','perez','roberts','turner','phillips','campbell','parker','evans','edwards','collins','stewart','sanchez','morris','rogers','reed','cook','morgan','bell','bailey','cooper','richardson','cox','howard','ward','torres','peterson','gray','ramirez'];

// 50% gmail, 30% outlook, 10% yahoo, 10% hotmail
const DOMAINS = [
    'gmail.com','gmail.com','gmail.com','gmail.com','gmail.com',
    'outlook.com','outlook.com','outlook.com',
    'yahoo.com',
    'hotmail.com',
];

const WORDS = ['dragon','tiger','shadow','storm','fire','dark','night','moon','blade','iron','gold','cyber','nova','apex','ghost','raven','wolf','hawk','flame','frost','pixel','sonic','turbo','viper','eagle','cobra','thunder','crystal','cosmic','solar','lunar','spark','rift','zenith','stealth','vortex','phase','nexus','omega','alpha','delta','prism','surge','pulse','orbit'];

const SYMS = ['!','@','#','$','&','*'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function generateEmail() {
    const first  = rand(FIRST);
    const last   = rand(LAST);
    const num    = randInt(1, 9999);
    const domain = rand(DOMAINS);
    const fmt    = randInt(0, 5);
    let local;
    switch (fmt) {
        case 0: local = `${first}${last}${num}`;           break;
        case 1: local = `${first}.${last}${randInt(1,99)}`; break;
        case 2: local = `${first}_${last}${randInt(1,99)}`; break;
        case 3: local = `${first}${last[0]}${num}`;         break;
        case 4: local = `${first[0]}${last}${num}`;         break;
        default: local = `${first}${randInt(1,99)}${last}`; break;
    }
    return `${local}@${domain}`;
}

function generatePassword() {
    const w1 = rand(WORDS);
    const w2 = rand(WORDS);
    const sym = rand(SYMS);
    const yr  = rand([2020,2021,2022,2023,2024]);
    const n   = randInt(10, 9999);

    const patterns = [
        () => `${cap(w1)}${randInt(10,999)}${sym}`,
        () => `${w1}.${w2}${randInt(1,99)}`,
        () => `${cap(w1)}${sym}${yr}`,
        () => `${w1}${cap(w2)}${randInt(1,99)}`,
        () => `${cap(w1)}${randInt(100,9999)}`,
        () => `${w1}_${randInt(100,999)}${sym}`,
        () => `${cap(w1)}${cap(w2)}${randInt(1,9)}`,
        () => `${w1}${randInt(10,99)}${cap(w2)}`,
        () => `${cap(w1)}${n}${sym}`,
        () => `${w1}${sym}${yr}${randInt(1,9)}`,
    ];
    return rand(patterns)();
}

function generateAccounts(count, usedEmails = new Set(), usedPasswords = new Set()) {
    const accounts = [];
    let attempts   = 0;
    const maxTries = count * 50;
    while (accounts.length < count && attempts < maxTries) {
        attempts++;
        const email    = generateEmail();
        const password = generatePassword();
        if (!usedEmails.has(email) && !usedPasswords.has(password)) {
            accounts.push({ email, password });
            usedEmails.add(email);
            usedPasswords.add(password);
        }
    }
    return accounts;
}

module.exports = { generateAccounts };
