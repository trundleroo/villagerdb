const moment = require('moment');

/**
 * Zodiac start/end dates.
 * @type {*[]}
 */
const zodiacData = [
    {title: 'Aries',       start: moment('03-21-2000', 'MM-DD-YYYY').unix(), end: moment('04-20-2000', 'MM-DD-YYYY').unix()},
    {title: 'Taurus',      start: moment('04-20-2000', 'MM-DD-YYYY').unix(), end: moment('05-21-2000', 'MM-DD-YYYY').unix()},
    {title: 'Gemini',      start: moment('05-21-2000', 'MM-DD-YYYY').unix(), end: moment('06-21-2000', 'MM-DD-YYYY').unix()},
    {title: 'Cancer',      start: moment('06-21-2000', 'MM-DD-YYYY').unix(), end: moment('07-23-2000', 'MM-DD-YYYY').unix()},
    {title: 'Leo',         start: moment('07-23-2000', 'MM-DD-YYYY').unix(), end: moment('08-23-2000', 'MM-DD-YYYY').unix()},
    {title: 'Virgo',       start: moment('08-23-2000', 'MM-DD-YYYY').unix(), end: moment('09-23-2000', 'MM-DD-YYYY').unix()},
    {title: 'Libra',       start: moment('09-23-2000', 'MM-DD-YYYY').unix(), end: moment('10-23-2000', 'MM-DD-YYYY').unix()},
    {title: 'Scorpio',     start: moment('10-23-2000', 'MM-DD-YYYY').unix(), end: moment('11-22-2000', 'MM-DD-YYYY').unix()},
    {title: 'Sagittarius', start: moment('11-22-2000', 'MM-DD-YYYY').unix(), end: moment('12-22-2000', 'MM-DD-YYYY').unix()},
    {title: 'Capricorn',   start: moment('12-22-2000', 'MM-DD-YYYY').unix(), end: moment('01-20-2000', 'MM-DD-YYYY').unix()},
    {title: 'Aquarius',    start: moment('01-20-2000', 'MM-DD-YYYY').unix(), end: moment('02-19-2000', 'MM-DD-YYYY').unix()},
    {title: 'Pisces',      start: moment('02-19-2000', 'MM-DD-YYYY').unix(), end: moment('03-21-2000', 'MM-DD-YYYY').unix()},
];

/**
 * Game data with English name and sort order.
 *
 * @type {{}}
 */
const games = {
    'nh': {title: 'New Horizons', order: 10},
    'nl': {title: 'New Leaf', order: 9},
    'pc': {title: 'Pocket Camp', order: 8},
    'hhd': {title: 'Happy Home Designer', order: 7},
    'cf': {title: 'City Folk', order: 6},
    'ww': {title: 'Wild World', order: 5},
    'afe+': {title: 'Animal Forest e+', order: 4},
    'ac': {title: 'Animal Crossing', order: 3},
    'af+': {title: 'Animal Forest+', order: 2},
    'af': {title: 'Animal Forest', order: 1}
};


/**
 * Capitalize first letter of given string.
 *
 * @param string
 * @returns {*}
 */
function capFirstLetter(string) {
    if (string.length === 0) {
        return string;
    }

    return string[0].toUpperCase() + string.substr(1, string.length - 1);
}

module.exports.games = games;
module.exports.capFirstLetter = capFirstLetter;

/**
 * Format a villager for user display.
 *
 * @param villager
 */
module.exports.formatVillager = function(villager) {
    const result = {};

    // Name, gender, species and birthday
    result.id = villager.id;
    result.name = villager.name;
    result.gender = capFirstLetter(villager.gender);
    result.species = capFirstLetter(villager.species);

    let momentBirthdate = moment(villager.birthday + '-2000', 'MM-DD-YYYY'); // we only store month/year, so add 2000.
    result.birthday = momentBirthdate.format('MMM Do');
    result.zodiac = getZodiac(momentBirthdate);

    // All the game-specific data.
    result.games = [];
    for (let game in games) {
        let data = villager.games[game];
        if (data) {
            result.games.push({
                title: games[game].title,
                personality: data.personality,
                clothes: data.clothes,
                song: data.song,
                phrase: data.phrase,
                skill: data.skill,
                style: data.style
            });
        }
    }

    return result;
}

/**
 * Get zodiac sign from moment date.
 *
 * @param date from moment
 * @return name of zodiac sign
 */
function getZodiac(date) {
    let unix = date.unix();
    for (let z of zodiacData) {
        if (unix >= z.start && unix < z.end) {
            return z.title;
        }
    }
}