/* Controllers */

var classroomsApp = angular.module('classroomsApp', []);

classroomsApp.controller('buildingsController', ['$scope', function($scope) {
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

    $scope.buildingChanged = function() {
        // call update for empty times
    }

}]);
