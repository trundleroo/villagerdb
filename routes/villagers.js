/**
 *
 * @type {createApplication}
 */
const express = require('express');

/**
 *
 * @type {browse}
 */
const browse = require('./abstract-browser');

/**
 * Sanitizer.
 */
const sanitize = require('../helpers/sanitize');

/**
 * Invokes the browser.
 * @param req
 * @param res
 * @param next
 */
function callBrowser(req, res, next) {
    const data = {};
    const pageNumber = req.params ? req.params.pageNumber : undefined;
    browse(res, next, sanitize.parsePositiveInteger(pageNumber),
        '/villagers/page/',
        'Villagers',
        req.query,
        {type: ['villager']},
        data);
}
/**
 *
 * @type {Router}
 */
const router = express.Router();

router.get('/', function (req, res, next) {
    callBrowser(req, res, next);
});

router.get('/page/:pageNumber', function (req, res, next) {
    callBrowser(req, res, next);
});

module.exports = router;