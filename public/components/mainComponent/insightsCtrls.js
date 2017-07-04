// Credits to Tobias Rahloff (https://github.com/trahloff) for assitance with chart.js
'use strict'
angular
    .module('insightsCtrls', ['ngMaterial', 'ngMessages', 'ngStorage', "chart.js"])
    .config(['ChartJsProvider', function (ChartJsProvider) {
      // Configure all charts
      ChartJsProvider.setOptions({
        legend: {
          display: true,
          position: 'bottom',
          fullWidth: true
        }
      })
    }])
    .controller('insightsCtrl', function($scope, $http, $state, $rootScope, $localStorage, $mdToast, $mdDialog, $sessionStorage, $timeout) {

        if ($sessionStorage.token === undefined) {
            $state.go('login')
        };
        let req = {
            method: 'GET',
            url: '/api/auth/check',
            headers: {
                'token': $sessionStorage.token
            }
        }
        $http(req).then(function(res, error) {
            if (res.data.status != 'ok') {
                $state.go('login')
            } else {
                $scope.decoded = res.data.data;
                $scope.getScans();
            }
        })

        $scope.getScans = function(type) {
            let req = {
                method: 'GET',
                url: '/api/scan',
                headers: {
                    'token': $sessionStorage.token
                }
            }
            $http(req).success(function(data) {
                $scope.previousScans = data.data.previous;
            })
        }

    })
