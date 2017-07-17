// Credits to Tobias Rahloff (https://github.com/trahloff) for assitance with chart.js
'use strict'
angular
    .module('scanCtrls', ['ngMaterial', 'ngMessages', 'ngStorage', 'chart.js'])
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
    .controller('scanCtrl', function ($scope, $http, $state, $rootScope, $localStorage, $mdToast, $mdDialog, $sessionStorage, $timeout) {
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
      $http(req).then(function (res, error) {
        if (res.data.status != 'ok') {
          $state.go('login')
        } else {
          $scope.decoded = res.data.data
          $scope.getScans()
        }
      })

      $scope.getScans = function (type) {
        let req = {
          method: 'GET',
          url: '/api/scan',
          headers: {
            'token': $sessionStorage.token
          }
        }
        $http(req).success(function (data) {
            console.log(data.data.previous)
          $scope.previousScans = data.data.previous
        })
      }

      $scope.startScan = function () {
        let req = {
          method: 'GET',
          url: '/api/scan/start',
          headers: {
            'token': $sessionStorage.token
          }
        }
        $http(req).success(function (data) {
          let scanUuid = data.uuid
          $mdToast.show(
                    $mdToast.simple()
                    .textContent('Scan gestartet.')
                    .position('top right')
                    .hideDelay(3000)
                )
          $timeout(function () {
            let req = {
              method: 'GET',
              url: '/api/scan/status/' + scanUuid,
              headers: {
                'token': $sessionStorage.token
              }
            }
            $http(req).success(function (data) {
              let req = {
                method: 'GET',
                url: '/api/scan/results/' + scanUuid,
                headers: {
                  'token': $sessionStorage.token
                }
              }
              $http(req).success(function (data) {
                $state.reload()
                $mdToast.show(
                                $mdToast.simple()
                                .textContent('Scan abgeschlossen.')
                                .position('top right')
                                .hideDelay(3000)
                            )
              })
            })
          }, 10000)
        })
      }

      $scope.viewScan = function (ev, scan) {
        $rootScope.scan = scan
        $mdDialog.show({
          controller: viewScanController,
          templateUrl: '/components/mainComponent/dialogs/viewScan.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          hasBackdrop: false
        })
        $state.reload()
      }

      function viewScanController ($scope, $mdDialog, $rootScope) {
        $scope.scan = $rootScope.scan
        $scope.port = {}
        $scope.risk = {}

        const groupsReq = {
          method: 'GET',
          url: '/api/scan/results/' + $scope.scan,
          headers: {
            'token': $sessionStorage.token
          }
        }

        $http(groupsReq).success(function (data) {
          $scope.scanresults = data.data.results
                // set ports graph
          $scope.port.ports = $scope.scanresults.chartdata.ports.ports
          $scope.port.series = $scope.scanresults.chartdata.ports.ports
          $scope.port.count = $scope.scanresults.chartdata.ports.count
          console.log($scope.port)
                // set risk graph
          $scope.risk.risks = $scope.scanresults.chartdata.risks.risks
          $scope.risk.series = $scope.scanresults.chartdata.risks.risks
          $scope.risk.count = $scope.scanresults.chartdata.risks.count
          console.log($scope.risk)
        })

        $scope.cancel = function () {
          $mdDialog.cancel()
        }
      }
    })
