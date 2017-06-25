'use strict'
angular
    .module('overviewCtrls', ['ngMaterial', 'ngMessages', 'ngStorage'])
    .controller('overviewCtrl', function($scope, $http, $rootScope, $localStorage, $sessionStorage) {
            $scope.$storage = $localStorage;
            console.log($localStorage.token);
            console.log($sessionStorage.token);

            if ($localStorage.token == null) {
                $state.go('login');
            } else if ($sessionStorage.token == null) {
                $sessionStorage.token = $localStorage.token;
            };
            var req = {
                method: 'GET',
                url: '/api/auth/check',
                headers: {
                    'token': $sessionStorage.token
                }
            }
            $http(req).then(function(data, error) {
                console.log(data);
                console.log(error);
            });

            $scope.updateDeviceData = function(type) {
                var req = {
                    method: 'GET',
                    url: '/api/devices',
                    headers: {
                        'token': $sessionStorage.token
                    }
                }
                // get's the mock-JSON and performs some operations on it to get count, etc and writes the values into scope
                $http(req).success(function(data) {
                    console.log(data);

                });

            };
            // invoke it on page load
            $scope.updateDeviceData();

        }
    )
