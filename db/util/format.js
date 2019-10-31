const moment = require('moment');

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
module.exports.formatVillager = function(villager) {
    const result = {};

    // Name, gender, species and birthday
    result.name = villager.name;
    result.gender = capFirstLetter(villager.gender);
    result.species = capFirstLetter(villager.species);
    result.birthday = moment(villager.birthday, 'MM-DD').format('MMM Do');

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