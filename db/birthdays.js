const path = require('path');
const fs = require('fs');

/**
 * Birthdays repository.
 */
class Birthdays {

    /**
     * Create the repository with an existing connection to redis.
     *
     * @param redisClient
     */
    constructor(redisClient) {
        this.redisClient = redisClient;
    }

    /**
     * Stores villager id and birthday in a pair in redis
     *
     * @returns {Promise<void>}
     */
    async storeBirthdays() {
        // Pull all villager keys from redis.
        const collection = await this.redisClient.keysAsync('villager_*');

        // Logic to parse data and store today's birthdays.
        let results = [];
        for (let i = 0; i < collection.length; i++) {
            let keyData = await this.redisClient.getAsync(collection[i]);
            collection[i] = keyData;
            let villagerData = JSON.parse(collection[i]);
            let birthday = villagerData['birthday'];
            if(this.compareBirthdays(birthday)) {
                let JsonBirthday = {}
                JsonBirthday.id = villagerData['id'];
                JsonBirthday.name = villagerData['name'];
                results.push(JsonBirthday);
            }
            await this.redisClient.setAsync('birthdays', JSON.stringify(results));
        }

    }

    /**
     * Computes if a given birthday is equal to today's date.
     *
     * @param birthday the birthday of a given villager
     * @returns {boolean}
     */
    compareBirthdays(birthday) {
        // Get today's date in stored format.
        let today = new Date();
        let mm = String(today.getMonth() + 1);
        let dd = String(today.getDate());
        today = mm + '-' + dd;

        return today == birthday;
    }

    /**
     * Fetches today's birthdays.
     *
     * @returns {Promise<*>}
     */
    async getBirthdays() {
        let birthdays = JSON.parse(await this.redisClient.getAsync('birthdays'));
        if (birthdays.length == 0) {
            return null;
        }
        return birthdays;
    }
}

module.exports = Birthdays;