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
 * @param es
 * @param pageNumber the already sanity checked page number
 * @returns {Promise<void>}
 */
async function loadVillagers(collection, es, pageNumber) {
    const resultSet = {};

    // Query for count and serch.
    const query = {
        match_all: {}
    };

    // Count.
    const totalCount = await es.count({
        index: 'villager',
        body: {
            query: query
        }
    });

    // Load all on this page.
    const results = await es.search({
        index: 'villager',
        from: pageSize * (pageNumber - 1),
        size: pageSize,
        body: {
            sort: [
                {
                    keyword: "asc"
                }
            ],
            query: query
        }
    });
    computePageProperties(pageNumber, pageSize, totalCount.count, resultSet);
    resultSet.pageUrlPrefix = '/villagers/page/';

    // Load the results.
    const keys = results.hits.hits.map(hit => hit._id);
    resultSet.results = await collection.getByIds(keys);
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
 * @param collection
 * @param es
 * @param searchQuery
 * @param pageNumber
 * @returns {Promise<void>}
 */
async function findVillagers(collection, es, searchQuery, pageNumber) {
    const resultSet = {};

    // Get matches and compute pagination.
    const results = await es.search({
        index: 'villager',
        from: pageSize * (pageNumber - 1),
        size: pageSize,
        body: {
            sort: [
                "_score",
                {
                    keyword: "asc"
                }
            ],
            query: {
                bool: {
                    should: [
                        {
                            match: {
                                name: {
                                    query: searchQuery,
                                    operator: 'and',
                                    fuzziness: 'auto'
                                }
                            }
                        },
                        {
                            match: {
                                phrases: {
                                    query: searchQuery,
                                    operator: 'and',
                                    fuzziness: 'auto'
                                }
                            }
                        }
                    ]
                }
            }
        }
    });

    computePageProperties(pageNumber, pageSize, results.hits.hits.length, resultSet);
    resultSet.pageUrlPrefix = '/villagers/search/page/';
    resultSet.isSearch = true;
    resultSet.searchQuery = searchQuery;
    resultSet.searchQueryString = encodeURI(searchQuery);

    // Get all the keys on this page and show them
    const keys = results.hits.hits.map(hit => hit._id);
    resultSet.results = await collection.getByIds(keys);
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
    loadVillagers(res.app.locals.db.villagers, res.app.locals.es, pageNumber)
        .then((resultSet) => {
            data.resultSet = resultSet;
            res.render('villagers', data);
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
    if (typeof searchQuery !== 'string' || searchQuery.trim().length === 0) {
        res.redirect(302, '/villagers');
        return;
    }

    // Execute async find and then return result or error.
    const data = {};
    data.pageTitle = 'Search results for ' + searchQuery; // template engine handles HTML escape
    findVillagers(res.app.locals.db.villagers, res.app.locals.es, searchQuery, pageNumber)
        .then((resultSet) => {
            data.resultSet = resultSet;
            res.render('villagers', data);
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