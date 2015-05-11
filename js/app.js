/* App Module */

var classroomsApp = angular.module('classroomsApp', [
    'ngRoute',
    'classroomsControllers'
]);

classroomsApp.config(function($routeProvider) {
    $routeProvider

        .when('/open-rooms', {
            templateUrl: 'partials/open-rooms.html',
            controller: 'openRoomsController'
        })

        .when('/open-rooms/:buildingCode', {
            templateUrl: 'partials/open-rooms.html',
            controller: 'openRoomsController'
        })

        .when('/room-schedules', {
            templateUrl: 'partials/room-schedules.html',
            controller: 'roomSchedulesController'
        })

        .when('/room-schedules/:buildingCode', {
            templateUrl: 'partials/room-schedules.html',
            controller: 'roomSchedulesController'
        })

        .when('/room-schedules/:buildingCode/:roomNumber/:dayOfWeek', {
            templateUrl: 'partials/room-schedules.html',
            controller: 'roomSchedulesController'
        })

        .when('/room-schedules/:buildingCode/:roomNumber/:dayOfWeek/:isEditing', {
            templateUrl: 'partials/room-schedules.html',
            controller: 'roomSchedulesController'
        })

        .otherwise({
            redirectTo: '/open-rooms'
        });
});
