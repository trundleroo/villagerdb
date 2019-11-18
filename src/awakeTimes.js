const $ = require('jquery');

$(document).ready(function () {
    const time = new Date();
    const userTime = (time.getHours() * 60) + time.getMinutes();

    // Sample input data
    let personality = $(".personality").attr('data-personality');
    console.log(personality);

    const sleepStatus = getSleepStatus(personality);

    $(".sleepStatusNL").text(sleepStatus['NL']);
    $(".sleepStatusEarlyBird").text(sleepStatus['earlyBirdNL']);
    $(".sleepStatusNightOwl").text(sleepStatus['nightOwlNL']);

});

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

function getSleepStatus(personality) {
    const time = new Date();
    const userTime = (time.getHours() * 60) + time.getMinutes();

    let sleepStatus = {};
    let wakeTime;
    let sleepTime;

    // New Leaf Normal Sleep Times
    sleepTime = newLeafSleepTimes[personality]['normal']['sleep'];
    wakeTime = newLeafSleepTimes[personality]['normal']['wake'];
    const sleepStatusNL = determineSleepStatus(sleepTime, wakeTime, userTime);

    // New Leaf Early Bird Sleep Times
    sleepTime = newLeafSleepTimes[personality]['earlyBird']['sleep'];
    wakeTime = newLeafSleepTimes[personality]['earlyBird']['wake']
    const sleepStatusEarlyBird = determineSleepStatus(sleepTime, wakeTime, userTime);

    // New Leaf Night Owl Sleep Times
    sleepTime = newLeafSleepTimes[personality]['nightOwl']['sleep'];
    wakeTime = newLeafSleepTimes[personality]['nightOwl']['wake']
    const sleepStatusNightOwl = determineSleepStatus(sleepTime, wakeTime, userTime);

    // City Folk and Wild World Sleep Times

    // AC GameCube and Animal Forest Sleep Times

    sleepStatus['NL'] = sleepStatusNL;
    sleepStatus['earlyBirdNL'] = sleepStatusEarlyBird;
    sleepStatus['nightOwlNL'] = sleepStatusNightOwl;

    return sleepStatus;
}

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