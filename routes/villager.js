const express = require('express');
const router = express.Router();
const formatUtil = require('../db/util/format.js');

/**
 * Load the specified villager.
 *
 * @param collection
 * @param id
 * @returns {Promise<void>}
 */
async function loadVillager(collection, id) {
    // Load villager
    const villager = await collection.getById(id);
    if (!villager) {
        res.sendStatus(404); // not found
        return;
    }

    // Format villager
    const result = formatUtil.formatVillager(villager);

    // Some extra metadata the template needs.
    result.id = villager.id;
    result.pageTitle = villager.name;

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
