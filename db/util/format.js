const moment = require('moment');

/**
 * Game data with English name and sort order.
 *
 * @type {{}}
 */
const games = {
    'nl': {title: 'New Leaf', order: 100}, // we always show new leaf first
    'pc': {title: 'Pocket Camp', order: 9},
    'hhd': {title: 'Happy Home Designer', order: 8},
    'cf': {title: 'City Folk', order: 6},
    'ww': {title: 'Wild World', order: 5},
    'afe+': {title: 'Animal Forest e+', order: 4},
    'ac': {title: 'Animal Crossing', order: 3},
    'af+': {title: 'Animal Forest+', order: 2},
    'af': {title: 'Animal Forest', order: 1}
};

module.exports.formatVillager = function(villager) {
    const result = {};

    // Name, gender, species and birthday
    result.name = villager.name;
    result.gender = capFirstLetter(villager.gender);
    result.species = capFirstLetter(villager.species);
    result.birthday = moment(villager.birthday, 'MM-DD').format('MMM Do');

    // All the game-specific data.
    // TODO

    return result;
}

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