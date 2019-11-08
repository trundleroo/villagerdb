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
 * Load villagers on a particular page number with a particular search query.
 *
 * @param collection collection of villagers from Mongo
 * @param es
 * @param pageNumber the already sanity checked page number
 * @param searchQuery
 * @returns {Promise<void>}
 */
async function find(collection, es, pageNumber, searchQuery) {
    const resultSet = {};

    // Is it a search? Initialize resultSet and ES body appropriately
    let body;
    let query;
    if (searchQuery) {
        // Set up result set for search display
        resultSet.pageUrlPrefix = '/villagers/search/page/';
        resultSet.isSearch = true;
        resultSet.searchQuery = searchQuery;
        resultSet.searchQueryString = encodeURI(searchQuery);

        // Elastic Search query and body.
        query = {
            bool: {
                should: [
                    {
                        match: {
                            name: {
                                query: searchQuery
                            }
                        }
                    },
                    {
                        match: {
                            phrase: {
                                query: searchQuery,
                                fuzziness: 'auto'
                            }
                        }
                    }
                ]
            }
        };

        body =  {
            sort: [
                "_score",
                {
                    keyword: "asc"
                }
            ],
            query: query,
            aggregations: {
                genders: {
                    terms: {
                        field: 'gender'
                    }
                },
                personalities: {
                    terms: {
                        field: 'personality'
                    }
                },
                species: {
                    terms: {
                        field: 'species'
                    }
                },
                games: {
                    terms: {
                        field: 'game'
                    }
                }
            },
        };
    } else {
        resultSet.pageUrlPrefix = '/villagers/page/';

        // Elastic Search query and body.
        query = {
            match_all: {}
        };

        body = {
            sort: [
                {
                    keyword: "asc"
                }
            ],
            query: query
        }
    }

    // Count.
    const totalCount = await es.count({
        index: 'villager',
        body: {
            query: query
        }
    });

    // Update page information.
    computePageProperties(pageNumber, pageSize, totalCount.count, resultSet);

    resultSet.pageTotal = totalCount.count;
    resultSet.hasResults = (resultSet.pageTotal > 0);

    if (resultSet.hasResults) {
        // Load all on this page.
        const results = await es.search({
            index: 'villager',
            from: pageSize * (resultSet.currentPage - 1),
            size: pageSize,
            body: body
        });

        // Load the results.
        const keys = results.hits.hits.map(hit => hit._id);
        resultSet.results = await collection.getByIds(keys);
        for (let i = 0; i < resultSet.results.length; i++) {
            resultSet.results[i] = formatUtil.formatVillager(resultSet.results[i]);
        }
    }

    return resultSet;
}



/**
 * Return the given input as a parsed integer if it is a positive integer. Otherwise, return 1.
 *
 * @param value
 * @returns {number}
 */
function parsePositiveInteger(value) {
    const parsedValue = parseInt(value);
    if (Number.isNaN(parsedValue) || parsedValue < 1) {
        return 1;
    }

    return parsedValue;
}

/**
 * Return a search query, trimmed, or undefined if there really isn't a usable one.
 *
 * @param value
 * @returns {string}
 */
function parseQuery(value) {
    if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
    }
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
 * Villager list and search entry point.
 *
 * @param res
 * @param next
 * @param pageNumber
 * @param searchQuery
 */
function listVillagers(res, next, pageNumber, searchQuery) {
    const data = {};
    if (searchQuery) {
        data.pageTitle = 'Search results for ' + searchQuery; // template engine handles HTML escape
    } else {
        data.pageTitle = 'All Villagers - Page ' + pageNumber;
    }
    find(res.app.locals.db.villagers, res.app.locals.es, pageNumber, searchQuery)
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
    listVillagers(res, next, parsePositiveInteger(req.params.pageNumber));
});

/* GET villagers search */
router.get('/search', function (req, res, next) {
    listVillagers(res, next, 1, parseQuery(req.query.q));
});

/* GET villagers search page number */
router.get('/search/page/:pageNumber', function (req, res, next) {
    listVillagers(res, next, parsePositiveInteger(req.params.pageNumber), parseQuery(req.query.q));
});

module.exports = router;