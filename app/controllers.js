/* Controllers */

var classroomsApp = angular.module('classroomsApp', []);

classroomsApp.controller('buildingsController', function($scope, $http) {
    // define the buildings on campus
    $scope.buildings = [
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

    // TODO: load previously viewed building from localStorage
    $scope.selectedBuilding = $scope.buildings[0];

    $scope.getBuildingOpenTimes = function() {
        $http.get('open_times/' + $scope.selectedBuilding.code + '.json').success(function (data) {
            $scope.openTimes = data;
            // after getting the open times process the times
            $scope.processOpenTimes();
        });
    };

    $scope.processOpenTimes = function() {
        $scope.processedOpenTimes = [];

        var currentTime = getCurrentTime();
        var currentDay = getCurrentDayOfWeek();

        // TODO: remove hardcode of time used for testing
        currentTime = 30;
        currentDay = "M";

        // determine whether current time and day are valid
        if (currentTime >= 3 && currentTime < 84 && currentDay != "S") {

            // loop through open times and determine which rooms are available given the current time and day
            for (var i = 0; i <= $scope.openTimes.length; i++) {
                if ($scope.openTimes[i][currentDay][currentTime] == 0) {
                    var openRoom = new Object();
                    openRoom.name = $scope.selectedBuilding.code + " " + $scope.openTimes[i].roomNumber;

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
                            openRoom.occupied = formatTime(j);
                            break;
                        }
                    }

                    $scope.processedOpenTimes.push(openRoom);
                }
            }
        }

        // otherwise if the time is out of range no classes are scheduled
        else {

        }

    };

    // get the selected building's open times
    $scope.getBuildingOpenTimes();
});

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
 * @param i a time in 0 to 84 format
 * @returns {string}
 */
function formatTime(i) {
    var twelveHourTime = "";

    // don't change to 12 hour until at least 1:00PM (30)
    if (i < 30) twelveHourTime += (Math.floor(i / 6) + 8) + ":" + i % 6 + "0";
    else twelveHourTime += (Math.floor(i / 6) + 8) % 12 + ":" + i % 6 + "0";

    if (i <= 23) twelveHourTime += "AM";
    else twelveHourTime += "PM";

    return twelveHourTime;
}
