const express = require('express');
const router = express.Router();
const formatUtil = require('../db/util/format.js');

/**
 * Number of entities per page on any result page.
 *
 * @type {number}
 */
const pageSize = 25;

/**
 * Load villagers on a particular page number.
 *
 * @param collection collection of villagers from Mongo
 * @param pageNumber the already sanity checked page number
 * @returns {Promise<void>}
 */
async function loadVillagers(collection, pageNumber) {
    const resultSet = {};

    // Pagination data.
    const totalCount = await collection.count();
    computePageProperties(pageNumber, pageSize, totalCount, resultSet);
    resultSet.pageUrlPrefix = '/villagers/page/';

    // Load the results.
    resultSet.results = await collection.getByRange(resultSet.startIndex - 1, resultSet.endIndex - 1);
    for (let i = 0; i < resultSet.results.length; i++) {
        resultSet.results[i] = formatUtil.formatVillager(resultSet.results[i]);
    }

    resultSet.pageTotal = resultSet.results.length;
    resultSet.hasResults = (resultSet.pageTotal > 0);

    return resultSet;
}

/**
 * Get villagers on a particular page number of a search query.
 *
 * @param searchQuery
 * @param pageNumber
 * @returns {Promise<void>}
 */
async function findVillagers(collection, searchQuery, pageNumber) {
    const resultSet = {};

    // Get matches and compute pagination.
    const keys = await collection.searchById(searchQuery);
    keys.sort();

    computePageProperties(pageNumber, pageSize, keys.length, resultSet);
    resultSet.pageUrlPrefix = '/villagers/search/page/';
    resultSet.isSearch = true;
    resultSet.searchQuery = searchQuery;
    resultSet.searchQueryString = encodeURI(searchQuery);

    // Now load actual result objects for this page only, and format them.
    resultSet.results = await collection.getByIds(keys.slice(resultSet.startIndex - 1, resultSet.endIndex));
    for (let i = 0; i < resultSet.results.length; i++) {
        resultSet.results[i] = formatUtil.formatVillager(resultSet.results[i]);
    }

    resultSet.pageTotal = resultSet.results.length;
    resultSet.hasResults = (resultSet.pageTotal > 0);

    return resultSet;
}

/**
 * Return the given input as a parsed integer if it is a positive integer. Otherwise, return 1.
 *
 * @param value
 * @returns {number}
 */
function parseQueryPositiveInteger(value) {
    const parsedValue = parseInt(value);
    if (Number.isNaN(parsedValue) || parsedValue < 1) {
        return 1;
    }

    return parsedValue;
}

/**
 * Do pagination math.
 *
 * @param pageNumber
 * @param pageSize
 * @param totalCount
 * @param resultSet
 */
function computePageProperties(pageNumber, pageSize, totalCount, resultSet) {
    // Totals
    resultSet.totalCount = totalCount;
    resultSet.totalPages = Math.ceil(totalCount / pageSize);

    // Clean up page number.
    if (pageNumber < 1) {
        pageNumber = 1;
    } else if (pageNumber > resultSet.totalPages) {
        pageNumber = resultSet.totalPages;
    }

    // Pagination specifics
    resultSet.currentPage = pageNumber;
    resultSet.previousPage = (pageNumber <= 1) ? 1 : pageNumber - 1;
    resultSet.startIndex = (pageSize * (pageNumber - 1) + 1);
    resultSet.endIndex = (pageSize * pageNumber) > totalCount ? totalCount :
        (pageSize * pageNumber);
    resultSet.nextPage = pageNumber >= resultSet.totalPages ? resultSet.totalPages : pageNumber + 1;
    resultSet.isFirstPage = (pageNumber == 1);
    resultSet.isLastPage = (pageNumber === resultSet.totalPages);
}

/**
 * Villager list entry point.
 *
 * @param res
 * @param next
 * @param pageNumber
 */
function listVillagers(res, next, pageNumber) {
    const data = {};
    data.pageTitle = 'All Villagers - Page ' + pageNumber;
    loadVillagers(res.app.locals.db.villagers, pageNumber)
        .then((resultSet) => {
            data.resultSet = resultSet;
            res.app.locals.db.birthdays.getBirthdays()
                .then((birthdays) => {
                    data.birthdays = birthdays;
                    data.shouldDisplayBirthdays = !(birthdays == null);
                    res.render('villagers', data);
                }).catch((next));
        }).catch(next);
}

/**
 * Search pages entry point.
 *
 * @param searchQuery
 * @param res
 * @param next
 * @param pageNumber
 */
function search(searchQuery, res, next, pageNumber) {
    // If there is no query string, redirect back to the main list.
    if (typeof searchQuery !== 'string' || searchQuery.length === 0) {
        res.redirect(302, '/villagers');
        return;
    }

    // Execute async find and then return result or error.
    const data = {};
    data.pageTitle = 'Search results for ' + searchQuery; // template engine handles HTML escape
    findVillagers(res.app.locals.db.villagers, searchQuery, pageNumber)
        .then((resultSet) => {
            data.resultSet = resultSet;
            res.app.locals.db.birthdays.getBirthdays()
                .then((birthdays) => {
                    if (!(birthdays == null)) {
                        data.birthdays = birthdays;
                    }
                    res.render('villagers', data);
                }).catch((next));
        }).catch(next);
}

/* GET villagers listing. */
router.get('/', function (req, res, next) {
    listVillagers(res, next, 1);
});

/* GET villagers page number */
router.get('/page/:pageNumber', function (req, res, next) {
    listVillagers(res, next, parseQueryPositiveInteger(req.params.pageNumber));
});

/* GET villagers search */
router.get('/search', function (req, res, next) {
    search(req.query.q, res, next, 1);
});

/* GET villagers search page number */
router.get('/search/page/:pageNumber', function (req, res, next) {
    search(req.query.q, res, next, parseQueryPositiveInteger(req.params.pageNumber));
});

module.exports = router;