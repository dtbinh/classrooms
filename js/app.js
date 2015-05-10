/* App Module */

var classroomsApp = angular.module('classroomsApp', [
    'ngRoute',
    'classroomsControllers'
]);

classroomsApp.config(function($routeProvider) {
    $routeProvider

        .when('/open-rooms', {
            templateUrl: 'partials/open-rooms.html'
        })

        .otherwise({
            redirectTo: '/open-rooms'
        });
});
