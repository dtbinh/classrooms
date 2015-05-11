/* Controllers */

var classroomsApp = angular.module('classroomsControllers', []);

classroomsApp.controller('openRoomsController', function($scope, $routeParams, $http) {
    $scope.buildings = CAMPUS_BUILDINGS;

    $scope.hideAllDivs = function() {
        $scope.showOpenTimesDiv = false;
        $scope.showNoOpenTimesDiv = false;
        $scope.showNoClassesDiv = false;
    };

    $scope.getBuildingOpenTimes = function() {
        $http.get('open_times/' + $scope.selectedBuilding.code + '.json').success(function (data) {
            $scope.openTimes = data;
            // after getting the open times process them
            $scope.processOpenTimes();
        });
    };

    $scope.processOpenTimes = function() {
        $scope.hideAllDivs();
        $scope.processedOpenTimes = [];

        var currentTime = getCurrentTime();
        var currentDay = getCurrentDayOfWeek();

        // determine whether current time and day are valid
        if (currentTime >= 3 && currentTime < 84 && currentDay != "S") {
            // loop through open times and determine which rooms are available given the current time and day
            for (var i = 0; i < $scope.openTimes.length; i++) {
                if ($scope.openTimes[i][currentDay][currentTime] == 0) {
                    var openRoom = new Object();
                    openRoom.name = $scope.selectedBuilding.code + " " + $scope.openTimes[i].roomNumber;
                    openRoom.url = '#/room-schedules/'
                                    + $scope.selectedBuilding.code + '/'
                                    + $scope.openTimes[i].roomNumber + '/'
                                    + getCurrentDayOfWeek() + '/'
                                    + "view";

                    var j = currentTime;

                    while (true) {
                        j++;

                        // no more times occupied until the building closes
                        if (j >= 84) {
                            openRoom.occupied = "building closes";
                            break;
                        }

                        // otherwise if the room is occupied save what time it is no longer available
                        else if ($scope.openTimes[i][currentDay][j] == 1) {
                            openRoom.occupied = formatTime84(j);
                            break;
                        }
                    }

                    $scope.processedOpenTimes.push(openRoom);
                }
            }

            if ($scope.processedOpenTimes.length > 0) {
                // there are open times to display
                $scope.showOpenTimesDiv = true;
            } else {
                // no open times to display, all rooms occupied
                $scope.showNoOpenTimesDiv = true;
            }
        }

        // otherwise if the time is out of range no classes are scheduled
        else {
            $scope.showNoClassesDiv = true;
        }
    };

    $scope.onSelectedBuildingChange = function() {
        // change the window location
        window.location.href = '#/open-rooms/' + $scope.selectedBuilding.code;
    };

    // get the route information and initialize if not set
    if (getCodeIndex( $routeParams.buildingCode, CAMPUS_BUILDINGS ) != -1) {
        $scope.selectedBuilding = $scope.buildings[getCodeIndex( $routeParams.buildingCode, CAMPUS_BUILDINGS )];
        $scope.getBuildingOpenTimes();
    }

    // building url is invalid
    else {
        $scope.selectedBuilding = $scope.buildings[0];
        $scope.onSelectedBuildingChange();
    }
});


classroomsApp.controller('roomSchedulesController', function($scope, $routeParams, $http) {
    $scope.buildings = CAMPUS_BUILDINGS;
    $scope.daysOfWeek = DAYS_OF_WEEK;
    $scope.roomNumber = $routeParams.roomNumber;

    // hide all the divs
    $scope.showFormDiv = false;
    $scope.showOpenTimesDiv = false;
    $scope.showRoomDoesNotExist = false;
    $scope.showNoClassesDiv = false;

    $scope.submit = function() {
        if ($scope.selectedBuilding != undefined &&
            $scope.roomNumber != undefined &&
            $scope.roomNumber != "" &&
            $scope.selectedDay != undefined) {

            // change the window location
            window.location.href = '#/room-schedules/' + $scope.selectedBuilding.code + '/' + $scope.roomNumber + '/' + $scope.selectedDay.code;
        }
    };

    $scope.getRoomSchedule = function() {
        $http.get('schedules/' + $scope.selectedBuilding.code + '_' + $scope.roomNumber + '.json')
            .success(function (data) {
                $scope.roomSchedule = data.data;
                // process the room schedule
                $scope.processRoomSchedule();

                // if the room exists get the open time data
                $http.get('open_times/' + $scope.selectedBuilding.code + '.json').success(function (data) {
                    $scope.openTimes = data;
                    // after getting the open times process them
                    $scope.processOpenTimes();
                });
            })

            .error(function () {
                // if the room does not exist tell the user
                $scope.showRoomDoesNotExist = true;
            });
    };

    $scope.processRoomSchedule = function() {
        // sort the array by start time
        $scope.roomSchedule.sort(function(a, b) {
            var x = a.start_time; var y = b.start_time;
            return ((x < y) ? -1 : (x > y));
        });

        // remove elements from the room schedule that are not of the current day selected
        var currentDaySchedule = [];

        for (i = 0; i < $scope.roomSchedule.length; i++) {
            if ($scope.roomSchedule[i].weekdays.indexOf($scope.selectedDay.code) > -1) {
                // TODO determine better method of seeing if classes
                // this only works with the assumption that Thursday classes are not combined with any other classes
                // other than Tuesday eg. this fails for 'WTh' classes
                if ($scope.selectedDay.code == "T" && $scope.roomSchedule[i].weekdays != "Th") {
                    // API sometimes has duplicate entries for some reason, remove them here
                    if (!isItemInSchedule($scope.roomSchedule[i], currentDaySchedule)) {
                        $scope.roomSchedule[i].start_time = formatTime24($scope.roomSchedule[i].start_time);
                        $scope.roomSchedule[i].end_time = formatTime24($scope.roomSchedule[i].end_time);
                        currentDaySchedule.push($scope.roomSchedule[i]);
                    }
                }

                else if ($scope.selectedDay.code != "T") {
                    if (!isItemInSchedule($scope.roomSchedule[i], currentDaySchedule)) {
                        $scope.roomSchedule[i].start_time = formatTime24($scope.roomSchedule[i].start_time);
                        $scope.roomSchedule[i].end_time = formatTime24($scope.roomSchedule[i].end_time);
                        currentDaySchedule.push($scope.roomSchedule[i]);
                    }
                }
            }
        }

        $scope.roomSchedule = currentDaySchedule;
        if ($scope.roomSchedule.length == 0) {
            $scope.showNoClassesDiv = true;
        } else {
            $scope.showOpenTimesDiv = true;
        }
    };

    $scope.processOpenTimes = function() {
        $scope.processedOpenTimes = [];

        // get only the relevant part of the data
        for (var i = 0; i < $scope.openTimes.length; i++) {
            if ($scope.openTimes[i].roomNumber == $scope.roomNumber) {
                $scope.openTimes = $scope.openTimes[i][$scope.selectedDay.code];
                break;
            }
        }

        var lastTimeOccupied = false;
        var startTimeStr = "";

        for (var i = 3; i < 84; i++) {
            if ($scope.openTimes[i] == 0 && $scope.openTimes[i + 1] == 0 && lastTimeOccupied == false) {
                startTimeStr = formatTime84(i);
                lastTimeOccupied = true;
            }
            else if ($scope.openTimes[i] == 1 && lastTimeOccupied == true) {
                $scope.processedOpenTimes.push( {begin: startTimeStr, end: formatTime84(i)} );
                lastTimeOccupied = false;
            }
        }
        $scope.processedOpenTimes.push( {begin: startTimeStr, end: "building closes"} );
    };

    /* GET ANGULAR ROUTE INFORMATION AND SET IF INVALID */
    if ((getCodeIndex( $routeParams.buildingCode, CAMPUS_BUILDINGS ) != -1) &&
        (getCodeIndex( $routeParams.dayOfWeek, DAYS_OF_WEEK ) != -1)) {
        $scope.selectedBuilding = $scope.buildings[getCodeIndex( $routeParams.buildingCode, CAMPUS_BUILDINGS )];
        $scope.selectedDay = $scope.daysOfWeek[getCodeIndex( $routeParams.dayOfWeek, DAYS_OF_WEEK )];

        // if viewing or editing #/room-schedules/building/roomNum/day
        // set the back button to go to the appropriate place
        if ($routeParams.isEditing != undefined) {
            // editing
            if ($routeParams.isEditing == "editing") {
                $scope.showFormDiv = true;
            }
            // viewing from link from open-times, go back to open-times
            else if ($routeParams.isEditing == "view") {
                $scope.getRoomSchedule();
                $scope.urlBack = '#/open-rooms/' + $scope.selectedBuilding.code;
            }
            // viewing from open rooms directly, go back to editor
        } else {
            $scope.getRoomSchedule();
            $scope.urlBack = '#/room-schedules/'
                            + $scope.selectedBuilding.code + '/'
                            + $scope.roomNumber + '/'
                            + $scope.selectedDay.code + '/'
                            + 'editing';
        }
    }

    // url is invalid or empty, set form default values
    else {
        if (getCodeIndex( $routeParams.buildingCode, CAMPUS_BUILDINGS ) != -1) {
            $scope.selectedBuilding = $scope.buildings[getCodeIndex( $routeParams.buildingCode, CAMPUS_BUILDINGS )];
        } else {
            $scope.selectedBuilding = $scope.buildings[0];
        }

        if (getCurrentDayOfWeek() != "S") {
            $scope.selectedDay = $scope.daysOfWeek[getCodeIndex( getCurrentDayOfWeek(), DAYS_OF_WEEK )];
        }
        else {
            $scope.selectedDay = $scope.daysOfWeek[0];
        }

        $scope.showFormDiv = true;
        $scope.roomNumber = undefined;
    }
});

// define the buildings on campus
var CAMPUS_BUILDINGS = [
    {code: 'AL', name: 'Arts Lecture Hall'},
    {code: 'B1', name: 'Biology 1'},
    {code: 'B2', name: 'Biology 2'},
    {code: 'BMH', name: 'B.C. Matthews Hall'},
    {code: 'C2', name: 'Chemistry 2'},
    {code: 'CGR', name: 'Conrad Grebel University College'},
    {code: 'CPH', name: 'Carl A. Pollock Hall'},
    {code: 'DC', name: 'William G. Davis Computer Research Centre'},
    {code: 'DWE', name: 'Douglas Wright Engineering Building'},
    {code: 'E2', name: 'Engineering 2'},
    {code: 'E3', name: 'Engineering 3'},
    {code: 'E5', name: 'Engineering 5'},
    {code: 'E6', name: 'Engineering 6'},
    {code: 'EIT', name: 'Centre for Environmental and Information Technology'},
    {code: 'ESC', name: 'Earth Sciences & Chemistry'},
    {code: 'EV1', name: 'Environment 1'},
    {code: 'EV2', name: 'Environment 2'},
    {code: 'EV3', name: 'Environment 3'},
    {code: 'HH', name: 'J.G. Hagey Hall of the Humanities'},
    {code: 'M3', name: 'Mathematics 3'},
    {code: 'MC', name: 'Mathematics & Computer Building'},
    {code: 'ML', name: 'Modern Languages'},
    {code: 'OPT', name: 'Optometry'},
    {code: 'PAS', name: 'Psychology, Anthropology, Sociology'},
    {code: 'PHY', name: 'Physics'},
    {code: 'QNC', name: 'Mike & Ophelia Lazaridis Quantum-Nano Centre'},
    {code: 'RCH', name: 'J.R. Coutts Engineering Lecture Hall'},
    {code: 'REN', name: 'Renison University College Original Building'},
    {code: 'STJ', name: 'St. Jerome\'s University Classroom Building'},
    {code: 'STP', name: 'St. Paul\'s United College Main Building'}
];

// define the days of the week in the same format as the room data
var DAYS_OF_WEEK = [
    {code: 'M', name: 'Monday'},
    {code: 'T', name: 'Tuesday'},
    {code: 'W', name: 'Wednesday'},
    {code: 'Th', name: 'Thursday'},
    {code: 'F', name: 'Friday'}
];

/**
 * Gets the current day of the week in same format as the room data
 * @returns {string}
 */
function getCurrentDayOfWeek() {
    var d = new Date();
    var weekdays = ["S", "M", "T", "W", "Th", "F", "S"];
    return weekdays[d.getDay()];
}

/**
 * Gets the current time of day
 * Time is represented from 8:00AM to 10:00PM in increments of 10 minutes
 * 0 represents 8:00AM, 84 represents 10:00PM
 * @returns {number}
 */
function getCurrentTime() {
    var d = new Date();
    var hours = (d.getHours() - 8) * 6;
    var minutes = Math.floor(d.getMinutes() / 10);
    return hours + minutes;
}

/**
 * Formats a time in 0 to 84 format to 12 hour format eg. 8:30AM
 * @param time84 a time in 0 to 84 format
 * @returns {string}
 */
function formatTime84(time84) {
    var hour = Math.floor(time84 / 6) + 8;          // 0 represents 8:00 AM so always add 8
    if (time84 >= 30) hour = hour % 12;             // modulo the hour after 13:00 to get 12 hour format

    var minute = time84 % 6 + "0";

    var amPm = "AM";
    if (time84 >= 24) amPm = "PM";

    return hour + ":" + minute + " " + amPm;
}

/**
 * Formats a time in 23:59 24 hour format to 12 hour format
 * @param time24
 * @returns {string}
 */
function formatTime24(time24) {
    var hour = parseInt( time24.split(':')[0] );
    var minute = time24.split(':')[1];

    var amPm = "AM";
    if (hour >= 12) amPm = "PM";

    if (hour > 12) hour = hour % 12;

    return hour + ":" + minute + " " + amPm;
}

/**
 * Gets the index of a building/day from the building/day code if the code is valid,
 * returns -1 otherwise
 * @param code the code to check
 * @param array the array to check
 * @returns {number}
 */
function getCodeIndex(code, array) {
    if (code === undefined) return -1;
    var index = -1;

    for (var i = 0; i < array.length; i++) {
        if (array[i].code == code) {
            index = i;
            break;
        }
    }

    return index;
}

/**
 * Determines whether an item is already in the schedule for the purposes of not
 * inserting duplicate items into the schedule
 * @param item
 * @param schedule
 * @returns {boolean}
 */
function isItemInSchedule(item, schedule) {
    var isFound = false;

    for (var i = 0; i < schedule.length; i++) {
        if (item.title == schedule[i].title && item.section == schedule[i].section){
            isFound = true;
            break;
        }
    }

    return isFound;
}
