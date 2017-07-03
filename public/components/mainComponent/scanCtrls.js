'use strict'
angular
    .module('scanCtrls', ['ngMaterial', 'ngMessages', 'ngStorage', "chart.js"])
    .controller('scanCtrl', function($scope, $http, $state, $rootScope, $localStorage, $mdToast, $mdDialog, $sessionStorage) {

        if ($sessionStorage.token === undefined) {
            $state.go('login')
        };
        var req = {
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
            var req = {
                method: 'GET',
                url: '/api/scan',
                headers: {
                    'token': $sessionStorage.token
                }
            }
            $http(req).success(function(data) {
                $scope.previousScans = data.data.previous;
                console.log($scope.previousScans);
            })
        }

        $scope.viewScan = function(ev, scan) {
            $rootScope.scan = scan;
                $mdDialog.show({
                controller: viewScanController,
                templateUrl: '/components/mainComponent/dialogs/viewScan.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                hasBackdrop: false
            });
            $state.reload();
        }

        function viewScanController($scope, $mdDialog, $rootScope) {
            $scope.scan = $rootScope.scan;

            const groupsReq = {
                method: 'GET',
                url: '/api/scan/results/' + $scope.scan,
                headers: {
                    'token': $sessionStorage.token
                }
            }
            $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
            $scope.data = [300, 500, 100];

            $http(groupsReq).success(function(data) {
                $scope.scanresults = data.data;
                $scope.ports = []

                for (var i = 0; i < $scope.scanresults.results.length; i++) {
                    var result = $scope.scanresults.results[i];
                    for (var j = 0; j < result.openPorts.length; j++) {
                        $scope.ports = $scope.ports.concat(result.openPorts[j].port);
                    }
                }
                console.log($scope.scanresults);
                console.log($scope.scanresults.uuid);
                console.log($scope.ports);
            })

            $scope.cancel = function() {
                $mdDialog.cancel();
            };
        }
    })
