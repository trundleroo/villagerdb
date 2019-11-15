const config = {
    searchResultsPageSize: 25,
    villagerFilters: {
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
    }
};

module.exports = config;