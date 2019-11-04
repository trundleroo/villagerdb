const moment = require('moment');

/**
 * Zodiac start/end dates.
 * @type {*[]}
 */
const zodiacData = [
    {title: 'Capricorn',   start: moment('12-22-1999', 'MM-DD-YYYY').unix(), end: moment('01-20-2000', 'MM-DD-YYYY').unix()},
    {title: 'Aquarius',    start: moment('01-20-2000', 'MM-DD-YYYY').unix(), end: moment('02-19-2000', 'MM-DD-YYYY').unix()},
    {title: 'Pisces',      start: moment('02-19-2000', 'MM-DD-YYYY').unix(), end: moment('03-21-2000', 'MM-DD-YYYY').unix()},
    {title: 'Aries',       start: moment('03-21-2000', 'MM-DD-YYYY').unix(), end: moment('04-20-2000', 'MM-DD-YYYY').unix()},
    {title: 'Taurus',      start: moment('04-20-2000', 'MM-DD-YYYY').unix(), end: moment('05-21-2000', 'MM-DD-YYYY').unix()},
    {title: 'Gemini',      start: moment('05-21-2000', 'MM-DD-YYYY').unix(), end: moment('06-21-2000', 'MM-DD-YYYY').unix()},
    {title: 'Cancer',      start: moment('06-21-2000', 'MM-DD-YYYY').unix(), end: moment('07-23-2000', 'MM-DD-YYYY').unix()},
    {title: 'Leo',         start: moment('07-23-2000', 'MM-DD-YYYY').unix(), end: moment('08-23-2000', 'MM-DD-YYYY').unix()},
    {title: 'Virgo',       start: moment('08-23-2000', 'MM-DD-YYYY').unix(), end: moment('09-23-2000', 'MM-DD-YYYY').unix()},
    {title: 'Libra',       start: moment('09-23-2000', 'MM-DD-YYYY').unix(), end: moment('10-23-2000', 'MM-DD-YYYY').unix()},
    {title: 'Scorpio',     start: moment('10-23-2000', 'MM-DD-YYYY').unix(), end: moment('11-22-2000', 'MM-DD-YYYY').unix()},
    {title: 'Sagittarius', start: moment('11-22-2000', 'MM-DD-YYYY').unix(), end: moment('12-22-2000', 'MM-DD-YYYY').unix()},
    {title: 'Capricorn',   start: moment('12-22-2000', 'MM-DD-YYYY').unix(), end: moment('12-31-2000', 'MM-DD-YYYY').unix()},
];

/**
 * Game data with English name and sort order.
 *
 * @type {{}}
 */
const games = {
    'af':   {shortTitle: 'AF',   title: 'Animal Forest',    year: 2001, order: 1},
    'af+':  {shortTitle: 'AF+',  title: 'Animal Forest+',   year: 2001, order: 2},
    'ac':   {shortTitle: 'AC',   title: 'Animal Crossing',  year: 2002, order: 3},
    'afe+': {shortTitle: 'AFe+', title: 'Animal Forest e+', year: 2003, order: 4},
    'ww':   {shortTitle: 'WW',   title: 'Wild World',       year: 2005, order: 5},
    'cf':   {shortTitle: 'CF',   title: 'City Folk',        year: 2008, order: 6},
    'nl':   {shortTitle: 'NL',   title: 'New Leaf',         year: 2012, order: 7},
    'nh':   {shortTitle: 'NH',   title: 'New Horizons',     year: 2020, order: 8}
};
module.exports.games = games;

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
    result.games = {};
    result.gameTitles = [];
    for (let game in games) {
        let data = villager.games[game];
        if (data) {
            result.gameTitles.push(games[game].title);
            result.games[game] = {
                personality: data.personality,
                clothes: data.clothes,
                song: data.song,
                phrase: data.phrase,
                skill: data.skill,
                style: data.style
            };
        }
    }
    result.gameTitles.reverse();

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