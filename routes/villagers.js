const express = require('express');
const router = express.Router();

/**
 * Number of entities per page on any result page.
 *
 * @type {number}
 */
const pageSize = 25;

/**
 *
 * @param collection
 * @param pageNumber
 * @returns {Promise<void>}
 */
async function loadVillagers(collection, pageNumber) {
    const resultSet = {};

    // Pagination data.
    resultSet.totalCount = await collection.count();
    resultSet.currentPage = pageNumber <= 1 ? 1 : pageNumber; // pages start at 1
    resultSet.previousPage = pageNumber <= 1 ? 1 : pageNumber - 1;
    resultSet.startIndex = (pageSize * (pageNumber - 1) + 1); //
    resultSet.endIndex = (pageSize * pageNumber) > resultSet.totalCount ? resultSet.totalCount :
        (pageSize * pageNumber);
    resultSet.totalPages = Math.ceil(resultSet.totalCount / pageSize);
    resultSet.nextPage = pageNumber >= resultSet.totalPages ? resultSet.totalPages : pageNumber + 1;
    resultSet.isFirstPage = (pageNumber == 1);
    resultSet.isLastPage = (pageNumber === resultSet.totalPages);

    // Load the results.
    resultSet.results = [];
    const cursor = collection.find({}, {projection: {_id: 1, name: 1, gender: 1, species: 1, birthday: 1}})
        .limit(pageSize)
        .skip(pageSize * (pageNumber - 1));
    while (await cursor.hasNext()) {
        resultSet.results.push(await cursor.next());
    }
    resultSet.pageTotal = resultSet.results.length;

    return resultSet;
}

/**
 * Return the given input as a parsed integer if it is a positive integer. Otherwise, return 0.
 *
 * @param value
 * @returns {number}
 */
function parseQueryPositiveInteger(value) {
    const parsedValue = parseInt(value);
    if (Number.isNaN(parsedValue) || parsedValue < 0) {
        return 0;
    }

    return parsedValue;
}

/**
 *
 * @param req
 * @param res
 * @param next
 * @param pageNumber
 */
function listVillagers(req, res, next, pageNumber) {
    const data = {};
    data.pageTitle = 'All villagers';
    loadVillagers(res.app.locals.db.gamedata.collection('villagers'), pageNumber)
        .then((resultSet) => {
            data.resultSet = resultSet;
            res.render('villagers', data);
        }).catch(next);
}

/* GET villagers listing. */
router.get('/', function (req, res, next) {
    listVillagers(req, res, next, 1);
});

router.get('/page/:pageNumber', function (req, res, next) {
    listVillagers(req, res, next, parseQueryPositiveInteger(req.params.pageNumber));
});

module.exports = router;