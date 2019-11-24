const $ = require('jquery');

const newLeafSleepTimes = {
    "Cranky" : {
        "normal" : {
            "wake" : 600,
            "sleep" : 240
        },
        "earlyBird" : {
            "wake" : 480,
            "sleep" : 240
        },
        "nightOwl" : {
            "wake" : 600,
            "sleep" : 360
        }
    },
    "Jock" : {
        "normal" : {
            "wake" : 420,
            "sleep" : 0
        },
        "earlyBird" : {
            "wake" : 360,
            "sleep" : 0
        },
        "nightOwl" : {
            "wake" : 420,
            "sleep" : 150
        }
    },
    "Lazy" : {
        "normal" : {
            "wake" : 540,
            "sleep" : 1380
        },
        "earlyBird" : {
            "wake" : 450,
            "sleep" : 1380
        },
        "nightOwl" : {
            "wake" : 540,
            "sleep" : 90
        }
    },
    "Normal" : {
        "normal" : {
            "wake" : 360,
            "sleep" : 0
        },
        "earlyBird" : {
            "wake" : 300,
            "sleep" : 0
        },
        "nightOwl" : {
            "wake" : 360,
            "sleep" : 120
        }
    },
    "Peppy" : {
        "normal" : {
            "wake" : 540,
            "sleep" : 60
        },
        "earlyBird" : {
            "wake" : 420,
            "sleep" : 60
        },
        "nightOwl" : {
            "wake" : 630,
            "sleep" : 180
        }
    },
    "Smug" : {
        "normal" : {
            "wake" : 510,
            "sleep" : 120
        },
        "earlyBird" : {
            "wake" : 420,
            "sleep" : 120
        },
        "nightOwl" : {
            "wake" : 510,
            "sleep" : 210
        }
    },
    "Snooty" : {
        "normal" : {
            "wake" : 570,
            "sleep" : 120
        },
        "earlyBird" : {
            "wake" : 480,
            "sleep" : 120
        },
        "nightOwl" : {
            "wake" : 570,
            "sleep" : 240
        }
    },
    "Uchi" : {
        "normal" : {
            "wake" : 660,
            "sleep" : 180
        },
        "earlyBird" : {
            "wake" : 570,
            "sleep" : 180
        },
        "nightOwl" : {
            "wake" : 660,
            "sleep" : 330
        }
    }
}

const wildWorldCityFolkSleepTimes = {
    "Cranky" : {
        "wake" : 600,
        "sleep" : 270
    },
    "Jock" : {
        "wake" : 390,
        "sleep" : 120
    },
    "Lazy" : {
        "wake" : 480,
        "sleep" : 90
    },
    "Normal" : {
        "wake" : 300,
        "sleep" : 60
    },
    "Peppy" : {
        "wake" : 420,
        "sleep" : 150
    },
    "Snooty" : {
        "wake" : 540,
        "sleep" : 210
    }
}

const animalForestSleepTimes = {
    "Cranky" : {
        "wake" : 600,
        "sleep" : 300
    },
    "Jock" : {
        "wake" : 330,
        "sleep" : 60
    },
    "Lazy" : {
        "wake" : 480,
        "sleep" : 1320
    },
    "Normal" : {
        "wake" : 300,
        "sleep" : 1260
    },
    "Peppy" : {
        "wake" : 420,
        "sleep" : 1410
    },
    "Snooty" : {
        "wake" : 540,
        "sleep" : 180
    }
}

const time = new Date();
const userTime = (time.getHours() * 60) + time.getMinutes();

$(document).ready(function () {
    // Get personalities.
    const personalityMap = $("#personality").data("personality");
    if (typeof personalityMap !== 'undefined') {
        // Compute villager's sleep status and generate HTML.
        const sleepStatus = getSleepStatus(personalityMap);
        const sleepTable = generateSleepTable(sleepStatus);
        $(".sleep-table").html(sleepTable);
    }
});

function generateSleepTable(sleepStatus) {
    const sleepTable = $('<table/>')
        .attr('class', 'table table-borderless mt-3');
    const thead = $('<thead/>')
        .attr('class', 'bg-dark text-light');
    thead.append($('<th/>').text('Sleep Status'));
    thead.append($('<th/>').attr('class', 'sr-only').text('Property'));
    thead.append($('<th/>').attr('class', 'sr-only').text('Value'));
    sleepTable.append(thead);
    const tbody = $('<tbody/>');

    const tdClass = "bg-light text-dark font-weight-bold";

    if (sleepStatus['NL']) {
        tbody.append($('<tr/>')
            .append($('<td/>')
                .attr('class', tdClass)
                .text('New Leaf'))
            .append($('<td/>')
                .text(sleepStatus['NL'])));
        tbody.append($('<tr/>')
            .append($('<td/>')
                .attr('class', tdClass)
                .text('New Leaf (Early Bird)'))
            .append($('<td/>')
                .text(sleepStatus['earlyBirdNL'])));
        tbody.append($('<tr/>')
            .append($('<td/>')
                .attr('class', tdClass)
                .text('New Leaf (Night Owl)'))
            .append($('<td/>')
                .text(sleepStatus['nightOwlNL'])));
    }

    if (sleepStatus['WWCF']) {
        tbody.append($('<tr/>')
            .append($('<td/>')
                .attr('class', tdClass)
                .text('Wild World/City Folk'))
            .append($('<td/>')
                .text(sleepStatus['WWCF'])));
    }

    if (sleepStatus['ACAF']) {
        tbody.append($('<tr/>')
            .append($('<td/>')
                .attr('class', tdClass)
                .text('Animal Crossing'))
            .append($('<td/>')
                .text(sleepStatus['ACAF'])));
    }

    sleepTable.append(tbody);
    return sleepTable;
}

function determineSleepStatus(sleepTime, wakeTime, userTime) {
    let result;
    if (sleepTime > wakeTime) {
            result = "asleep";
        if (wakeTime < userTime && userTime < sleepTime) {
            result = "awake";
        }
    } else {
        result = "awake";
        if (sleepTime < userTime && userTime < wakeTime) {
            result = "asleep";
        }
    }
    return result;
}

function getSleepStatus(personalityMap) {

    let sleepStatus = {};

    personalityMap.forEach(function(entry) {
        let shortTitle = entry['shortTitle'];
        let personality = entry['value'];

        let sleepTime;
        let wakeTime;

        if (shortTitle === "NL") {

            // New Leaf Normal Sleep Times
            sleepTime = newLeafSleepTimes[personality]['normal']['sleep'];
            wakeTime = newLeafSleepTimes[personality]['normal']['wake'];
            sleepStatus['NL'] = determineSleepStatus(sleepTime, wakeTime, userTime);

            // New Leaf Early Bird Sleep Times
            sleepTime = newLeafSleepTimes[personality]['earlyBird']['sleep'];
            wakeTime = newLeafSleepTimes[personality]['earlyBird']['wake']
            sleepStatus['earlyBirdNL'] = determineSleepStatus(sleepTime, wakeTime, userTime);

            // New Leaf Night Owl Sleep Times
            sleepTime = newLeafSleepTimes[personality]['nightOwl']['sleep'];
            wakeTime = newLeafSleepTimes[personality]['nightOwl']['wake']
            sleepStatus['nightOwlNL'] = determineSleepStatus(sleepTime, wakeTime, userTime);

        } else if (shortTitle === "CF") {

            // City Folk and Wild World Sleep Times
            sleepTime = wildWorldCityFolkSleepTimes[personality]['sleep'];
            wakeTime = wildWorldCityFolkSleepTimes[personality]['wake']
            sleepStatus['WWCF'] = determineSleepStatus(sleepTime, wakeTime, userTime);

        } else if (shortTitle === "AFe+") {

            // AC GameCube and Animal Forest Sleep Times
            sleepTime = animalForestSleepTimes[personality]['sleep'];
            wakeTime = animalForestSleepTimes[personality]['wake']
            sleepStatus['ACAF'] = determineSleepStatus(sleepTime, wakeTime, userTime);

        }
    });

    return sleepStatus;
}

