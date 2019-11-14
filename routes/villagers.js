const express = require('express');
const router = express.Router();

/**
 * Number of entities per page on any result page.
 *
 * @type {number}
 */
const pageSize = 25;

/**
 * All possible filters
 *
 * @type {{}}
 */
const allFilters = {
    gender: {
        name: 'Gender',
        values: {male: 'Male', female: 'Female'},
        sort: 1
    },
    game: {
        name: 'Games',
        values: {
            'nl': 'New Leaf',
            'cf': 'City Folk',
            'ww': 'Wild World',
            'afe+': 'Animal Forest e+',
            'ac': 'Animal Crossing',
            'af+': 'Animal Forest+',
            'af': 'Animal Forest'
        },
        sort: 2
    },
    personality: {
        name: 'Personality',
        values: {
            cranky: 'Cranky',
            jock: 'Jock',
            lazy: 'Lazy',
            normal: 'Normal',
            peppy: 'Peppy',
            smug: 'Smug',
            snooty: 'Snooty',
            uchi: 'Uchi'
        },
        sort: 3
    },
    species: {
        name: 'Species',
        values: {
            alligator: 'Alligator',
            anteater: 'Anteater',
            bear: 'Bear',
            bird: 'Bird',
            bull: 'Bull',
            cat: 'Cat',
            chicken: 'Chicken',
            cow: 'Cow',
            cub: 'Cub',
            deer: 'Deer',
            dog: 'Dog',
            duck: 'Duck',
            eagle: 'Eagle',
            elephant: 'Elephant',
            frog: 'Frog',
            goat: 'Goat',
            gorilla: 'Gorilla',
            hamster: 'Hamster',
            hippo: 'Hippo',
            horse: 'Horse',
            kangaroo: 'Kangaroo',
            koala: 'Koala',
            lion: 'Lion',
            monkey: 'Monkey',
            mouse: 'Mouse',
            octopus: 'Octopus',
            ostrich: 'Ostrich',
            penguin: 'Penguin',
            pig: 'Pig',
            rabbit: 'Rabbit',
            rhino: 'Rhino',
            sheep: 'Sheep',
            squirrel: 'Squirrel',
            tiger: 'Tiger',
            wolf: 'Wolf',
        },
        sort: 4
    }
};

/**
 * The definitions of our aggregations.
 *
 * @type {{}}
 */
const aggDefinitions = {
    gender: {
        terms: {
            field: 'gender',
            size: 2
        }
    },
    personality: {
        terms: {
            field: 'personality',
            size: 50
        }
    },
    species: {
        terms: {
            field: 'species',
            size: 50
        }
    },
    game: {
        terms: {
            field: 'game',
            size: 50
        }
    }/*,
    zodiac: {
        terms: {
            field: 'zodiac',
            size: 50
        }
    }*/
};

/**
 * Builds the search query for textual searches in ElasticSearch.
 *
 * @param searchString
 * @returns {*[]}
 */
function buildSearchQuery(searchString) {
    if (typeof searchString !== 'string') {
        return undefined;
    }

    const trimmedString = searchString.trim();
    if (trimmedString.length === 0) {
        return undefined;
    }

    return [
        {
            match: {
                name: {
                    query: trimmedString
                }
            }
        },
        {
            match: {
                phrase: {
                    query: trimmedString,
                    fuzziness: 'auto'
                }
            }
        }
    ];
}

/**
 * Builds an ElasticSearch query applying the given queries and search string.
 *
 * @param appliedQueries
 * @param searchQuery
 * @returns {{bool: {must: []}}}
 */
function buildRootElasticSearchQuery(appliedQueries, searchQuery) {
    const finalQuery = {
        bool: {
            must: []
        }
    };

    // Add in the text search query, if applicable.
    if (searchQuery) {
        finalQuery.bool.must.push({
            bool: {
                should: searchQuery
            }
        });
    }

    // OK, now add the rest of the applied queries, if any.
    if (appliedQueries.length > 0) {
        finalQuery.bool.must.push({
            bool: {
                must: appliedQueries
            }
        });
    }

    // If it's still empty, then just match everything.
    if (finalQuery.bool.must.length === 0) {
        finalQuery.bool.must.push({
            match_all: {}
        })
    }

    return finalQuery;
}

/**
 * Transform URL parameters into applied filters that can be used by the frontend and by the getFacetQuery function
 * here.
 *
 * @param params params from the URL.
 */
function getAppliedFilters(params) {
    const appliedFilters = {};
    for (let key in params) {
        // Is it a valid filter?
        if (allFilters[key]) {
            // Does it have values?
            const values = params[key].split(',');
            if (values.length > 0) {
                // Set them.
                appliedFilters[key] = values;
            }
        }
    }

    return appliedFilters;
}

/**
 * Get match queries for the applied filters. Returns an empty array if there is nothing to
 * send to ElasticSearch.
 *
 * @param appliedFilters
 * @returns {[]}
 */
function getFacetQueries(appliedFilters) {
    const outerQueries = {};
    for (let key in appliedFilters) {
        outerQueries[key] = [];
        const innerQueries = [];
        for (let value of appliedFilters[key]) {
            const query = {};
            query.match = {};
            query.match[key] = {
                query: value
            };
            innerQueries.push(query);
        }
        outerQueries[key].push({
            bool: {
                should: innerQueries
            }
        });
    }

    return outerQueries;
}

/**
 * Turn key => [queries] pairs into [[query1], [query2], ...]. This function pretty much only works with the output
 * of getFacetQueries above.
 *
 * @param facetQueries
 * @returns {[]}
 */
function flattenFacetQueries(facetQueries) {
    const flat = [];
    for (let key in facetQueries) {
        flat.push(facetQueries[key]);
    }

    return flat;
}

/**
 * Build aggregations for the given search criteria.
 * 
 * @param appliedFilters
 * @param facetQueries
 * @param searchQuery
 * @returns {{all_entries: {global: {}, aggregations: {}}}}
 */
function getAggregations(appliedFilters, facetQueries, searchQuery) {
    const result = {
        all_entries: {
            global: {},
            aggregations: {}
        }
    };

    // ElasticSearch requires us to nest these aggregations a level deeper than I would like, but it does work.
    const innerAggs = result.all_entries.aggregations;
    for (let key in allFilters) {
        innerAggs[key + '_filter'] = {};
        innerAggs[key + '_filter'].filter = getAggregationFilter(facetQueries, key, searchQuery);
        innerAggs[key + '_filter'].aggregations = {};
        innerAggs[key + '_filter'].aggregations[key] = aggDefinitions[key];
    }

    return result;
}

/**
 * Build a filter for a particular aggregation. The only reason this is different from building the overall root query
 * is we exclude the given key filter from the applied queries sent to buildRootElasticSearchQuery.
 *
 * @param facetQueries
 * @param key
 * @param searchQuery
 * @returns {{bool: {must: *[]}}}
 */
function getAggregationFilter(facetQueries, key, searchQuery) {
    // Get all queries that do *not* match this key.
    const appliedQueries = [];
    for (let fKey in facetQueries) {
        if (key !== fKey) {
            appliedQueries.push(facetQueries[fKey]);
        }
    }

    return buildRootElasticSearchQuery(appliedQueries, searchQuery);
}

/**
 * Restricts the available filters to entities that won't result in a "no results" response from ElasticSearch.
 *
 * @param appliedFilters
 * @param aggregations
 */
function buildAvailableFilters(appliedFilters, aggregations) {
    const availableFilters = {};

    // Sort aggregations so that they maintain their order.
    const sortedAggregations = Object.keys(aggregations)
        .map((a) => {
            // We need the child here, not the parent.
            const split = a.split('_');
            return split[0];
        })
        .filter((a) => {
            return typeof allFilters[a] !== 'undefined';
        })
        .sort((a, b) => {
            return allFilters[a].sort - allFilters[b].sort;
        });

    // Find out what filters we can show as available.
    for (let key of sortedAggregations) {
        const agg = aggregations[key + '_filter'][key];
        // Skip entirely empty buckets.
        if (agg.buckets.length > 0) {
            // Only show what the aggregation allows.
            const buckets = agg.buckets
                .map((b) => {
                    return b.key;
                });

            const bucketKeyValue = {};
            for (let b of Object.keys(allFilters[key].values)) {
                if (buckets.includes(b)) {
                    bucketKeyValue[b] = allFilters[key].values[b];
                }
            }

            // Add it as an available filter, finally.
            availableFilters[key] = {
                name: allFilters[key].name,
                values: bucketKeyValue
            };
        }
    }

    return availableFilters;
}

/**
 * Load villagers on a particular page number with a particular search query.
 *
 * @param collection collection of villagers from Mongo
 * @param es
 * @param pageNumber the already sanity checked page number
 * @param searchString
 * @returns {Promise<void>}
 */
async function find(collection, es, pageNumber, searchString, params) {
    // Sanity check
    if (typeof searchString === 'string' && searchString.length > 64) {
        let e = new Error('Invalid request.');
        e.status = 400;
        throw e;
    }

    // The long process of building the result.
    const result = {};

    result.pageUrlPrefix = '/villagers/page/';
    result.appliedFilters = getAppliedFilters(params);

    // Build ES query for applied filters, if any.
    const facetQueries = getFacetQueries(result.appliedFilters);
    const facetQueriesFlat = flattenFacetQueries(facetQueries);

    // Is it a search? Initialize result and ES body appropriately
    const searchQuery = buildSearchQuery(searchString);
    const aggs = getAggregations(result.appliedFilters, facetQueries, searchQuery);

    let body;
    const query = buildRootElasticSearchQuery(facetQueriesFlat, searchQuery);
    if (searchQuery) {
        // Set up result set for search display
        result.isSearch = true;
        result.searchQuery = searchString;
        result.searchQueryString = encodeURIComponent(searchString);
    }

    // The ultimate goal is to build this body for the query.
    body =  {
        sort: [
            "_score",
            {
                keyword: "asc"
            }
        ],
        query: query,
        aggregations: aggs
    };

    // Count.
    const totalCount = await es.count({
        index: 'villager',
        body: {
            query: query
        }
    });

    // Update page information.
    computePageProperties(pageNumber, pageSize, totalCount.count, result);

    result.results = [];
    if (totalCount.count > 0) {
        // Load all on this page.
        const results = await es.search({
            index: 'villager',
            from: pageSize * (result.currentPage - 1),
            size: pageSize,
            body: body
        });

        result.availableFilters =  buildAvailableFilters(result.appliedFilters, results.aggregations.all_entries);

        // Load the results.
        const keys = results.hits.hits.map(hit => hit._id);
        const rawResults = await collection.getByIds(keys);
        for (let r of rawResults) {
            result.results.push({
                id: r.id,
                name: r.name
            });
        }
    }

    return result;
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
 * Do pagination math.
 *
 * @param pageNumber
 * @param pageSize
 * @param totalCount
 * @param result
 */
function computePageProperties(pageNumber, pageSize, totalCount, result) {
    // Totals
    result.totalCount = totalCount;
    result.totalPages = Math.ceil(totalCount / pageSize);

    // Clean up page number.
    if (pageNumber < 1) {
        pageNumber = 1;
    } else if (pageNumber > result.totalPages) {
        pageNumber = result.totalPages;
    }

    // Pagination specifics
    result.currentPage = pageNumber;
    result.startIndex = (pageSize * (pageNumber - 1) + 1);
    result.endIndex = (pageSize * pageNumber) > totalCount ? totalCount :
        (pageSize * pageNumber);
}

/**
 * Search pages entry point.
 *
 * @param searchQuery
 */
function listVillagers(res, next, pageNumber, isAjax, params) {
    const data = {};
    const searchQuery = typeof params.q === 'string' ? params.q.trim() : undefined;
    if (searchQuery) {
        data.pageTitle = 'Search results for ' + searchQuery; // template engine handles HTML escape
    } else {
        data.pageTitle = 'All Villagers - Page ' + pageNumber;
    }

    find(res.app.locals.db.villagers, res.app.locals.es, pageNumber, searchQuery, params)
        .then((result) => {
            if (isAjax) {
                res.send(result);
            } else {
                res.app.locals.db.birthdays.getBirthdays()
                    .then((birthdays) => {
                        data.birthdays = birthdays;
                        data.shouldDisplayBirthdays = birthdays.length > 0;
                        data.initialState = JSON.stringify(result);
                        data.allFilters = JSON.stringify(allFilters);
                        data.result = result;
                        res.render('villagers', data);
                    })
                    .catch(next);
            }
        })
        .catch(next);
}

/* GET villagers listing. */
router.get('/', function (req, res, next) {
    listVillagers(res, next, 1, req.query.isAjax === 'true', req.query);
});

/* GET villagers page number */
router.get('/page/:pageNumber', function (req, res, next) {
    listVillagers(res, next, parsePositiveInteger(req.params.pageNumber), req.query.isAjax === 'true',
        req.query);
});

/* GET villagers search */
/*router.get('/search', function (req, res, next) {
    listVillagers(res, next, 1, req.query.isAjax === 'true', parseQuery(req.query.q));
});*'

/* GET villagers search page number */
/*router.get('/search/page/:pageNumber', function (req, res, next) {
    listVillagers(res, next, parsePositiveInteger(req.params.pageNumber), req.query.isAjax === 'true', parseQuery(req.query.q));
});*/

router.get('/autocomplete', function (req, res, next) {
    // Validate query
    if (typeof req.query.q !== 'string' || req.query.q.length > 64) {
        const e = new Error('Invalid request.');
        e.status = 400; // Bad Request
        throw e;
    }

    res.app.locals.es.search({
        index: 'villager',
        body: {
            suggest: {
                villager: {
                    prefix: req.query.q,
                    completion: {
                        field: 'suggest',
                        size: 5
                    }
                }
            }
        }
    })
        .then((results) => {
            const suggestions = [];
            if (results.suggest && results.suggest.villager) {
                for (let x of results.suggest.villager) {
                    for (let y of x.options) {
                        suggestions.push(y.text);
                    }
                }
            }
            res.send(suggestions);
        })
        .catch(next);

});

module.exports = router;