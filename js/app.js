/* App Module */

var classroomsApp = angular.module('classroomsApp', [
    'ngRoute',
    'classroomsControllers'
]);

classroomsApp.config(function($routeProvider) {
    $routeProvider

        .when('/open-rooms', {
            templateUrl: 'partials/open-rooms.html',
            controller: 'openTimesController'
        })

        .when('/open-rooms/:buildingCode', {
            templateUrl: 'partials/open-rooms.html',
            controller: 'openTimesController'
        })

        .otherwise({
            redirectTo: '/open-rooms'
        });
});
