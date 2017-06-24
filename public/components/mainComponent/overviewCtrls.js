'use strict'
angular
    .module('overviewCtrls', ['ngMaterial', 'ngMessages'])
    .controller('overviewCtrl', ['$scope', '$http', '$rootScope',
        function($scope, $http, $rootScope) {

            $scope.updateVehicleData = function(type) {
                var req = {
                    method: 'GET',
                    url: '/api/devices',
                    headers: {
                        'token': $scope.token
                    }
                }
                // get's the mock-JSON and performs some operations on it to get count, etc and writes the values into scope
                $http(req).success(function(data) {
                    console.log(data);

                });

            };
            // invoke it on page load
            $scope.updateVehicleData();

        }
    ])
