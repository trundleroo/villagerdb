const express = require('express');
const router = express.Router();
const formatUtil = require('../db/util/format.js');

/**
 * Return a <word> or an <word> depending on first character.
 *
 * @param word
 * @returns {string}
 */
function aOrAn(word) {
    if (word.length === 0) {
        return '';
    }

    const firstChar = word[0].toLowerCase();
    if (firstChar === 'a' || firstChar === 'e' || firstChar === 'i' || firstChar === 'o' || firstChar === 'u') {
        return 'an ' + word;
    }

    return 'a ' + word;
}

/**
 * Find the latest game a villager was featured in.
 *
 * @param villager
 * @returns the game ID or undefined if none found.
 */
function findLatestGame(villager) {
    let gameIndex = -1;
    let latestGame = undefined;
    for (let game in villager.games) {
        if (gameIndex < formatUtil.games[game].order) {
            latestGame = game;
            gameIndex = formatUtil.games[game].order;
        }
    }

    return latestGame;
}

/**
 * Generate a sentence for the given villager.
 *
 * @param villager
 * @param formattedVillager
 */
function generateParagraph(villager, formattedVillager) {
    // Find the latest game they are in.
    let latestGameId = findLatestGame(villager);
    if (!latestGameId) {
        return '';
    }
    let gameData = villager.games[latestGameId];

    // Properties
    let name = formattedVillager.name;
    let pronoun = (villager.gender === 'male' ? 'he' : 'she');
    let posessivePronoun = (villager.gender == 'male' ? 'his' : 'her');
    let posessive = formattedVillager.name + '\'s';
    let species = formattedVillager.species.toLowerCase();
    let personality = gameData.personality;
    let birthday = formattedVillager.birthday;
    let latestGameTitle = formatUtil.games[latestGameId].title;
    let zodiac = formattedVillager.zodiac;

    // Build paragraph
    let paragraph = name + ' is ' + aOrAn(personality.toLowerCase()) + ' ' + species + ' villager. ' +
        formatUtil.capFirstLetter(pronoun) + ' was born on ' + birthday + ' and ' + posessivePronoun +
        ' star sign  is ' + zodiac + '. ';
    if (gameData.clothes) {
        paragraph += name + ' wears the ' + gameData.clothes + ' in ' + latestGameTitle + '. ';
    }
    if (gameData.song) {
        paragraph += formatUtil.capFirstLetter(posessivePronoun) + ' favorite song is ' + gameData.song + ' in ' +
            latestGameTitle + '. ';
    }


    if (gameData.goal) {
        paragraph += posessive + ' goal is to be ' + aOrAn(gameData.goal.toLowerCase()) + '. ';
    }
    if (gameData.skill) {
        paragraph += formatUtil.capFirstLetter(pronoun) + ' is talented at ' + gameData.skill.toLowerCase() + '. ';
    }
    if (gameData.style) {
        paragraph += formatUtil.capFirstLetter(posessivePronoun) + ' style is ' + gameData.style.toLowerCase() + '.';
    }

    return paragraph;

}

/**
 * Reduce game-specific properties down to only differing values.
 *
 * @param games
 * @param property
 */
function compressGameData(games, property) {
    let result = [];

    let lastValue = undefined;
    for (let game in games) {
        // Do a case insensitive compare without any extra spaces.
        let newValue = games[game][property];
        if (newValue) {
            newValue = newValue.trim().toLowerCase().replace(/\s+/g, ' ');
            if (newValue !== lastValue) {
                result.push({
                    title: games[game].title,
                    value: games[game][property]
                });
                lastValue = newValue;
            }
        }
    }

    return result;
}

/**
 * Load the specified villager.
 *
 * @param collection
 * @param id
 * @returns {Promise<{}>}
 */
async function loadVillager(collection, id) {
    // Load villager
    const villager = await collection.getById(id);
    if (!villager) {
        let e = new Error('Villager not found');
        e.status = 404;
        throw e;
    }

    // Format villager
    const result = formatUtil.formatVillager(villager);

    // Some extra metadata the template needs.
    result.id = villager.id;
    result.pageTitle = villager.name;
    result.astrology = 'Aquarius';

    // Game-specific attributes.
    result.personalities = compressGameData(result.games, 'personality');
    result.clothing = compressGameData(result.games, 'clothes');
    result.phrases = compressGameData(result.games, 'phrase');
    result.songs = compressGameData(result.games, 'song');

    // Booleans for the template.
    result.hasPersonalities = result.personalities.length > 0;
    result.hasClothing = result.clothing.length > 0;
    result.hasPhrases = result.phrases.length > 0;
    result.hasSongs = result.songs.length > 0;

    // Generate the paragraph.
    result.paragraph = generateParagraph(villager, result);

    // Social media share URL
    result.shareUrl = 'https://villagerdb.com/villager/' + result.id;
    return result;
}

/* GET villager page. */
router.get('/:id', function (req, res, next) {
    loadVillager(res.app.locals.db.villagers, req.params.id)
        .then((data) => {
            data.pageTitle = data.name;
            res.render('villager', data);
        }).catch(next);
});

module.exports = router;
