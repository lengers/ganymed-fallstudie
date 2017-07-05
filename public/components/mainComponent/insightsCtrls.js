// Credits to Tobias Rahloff (https://github.com/trahloff) for assitance with chart.js
'use strict'
angular
    .module('insightsCtrls', ['ngMaterial', 'ngMessages', 'ngStorage', 'chart.js'])
    .config(['ChartJsProvider', function (ChartJsProvider) {
        // Configure all charts
      ChartJsProvider.setOptions({
        legend: {
          display: true,
          position: 'bottom',
          fullWidth: true
        }
      })
      ChartJsProvider.setOptions({
        scale: {
          ticks: {
            scaleBeginAtZero: true,
            min: 0,
            max: 4
          }
        }
      })
    }])
    .controller('insightsCtrl', function ($scope, $http, $state, $rootScope, $localStorage, $mdToast, $mdDialog, $sessionStorage, $timeout) {
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
        let scanReq = {
          method: 'GET',
          url: '/api/scan',
          headers: {
            'token': $sessionStorage.token
          }
        }
        $http(scanReq).success(function (data) {
          $scope.previousScans = data.data.previous

          const groupsReq = {
            method: 'GET',
            url: '/api/scan/results/' + $scope.previousScans[0].scan_no,
            headers: {
              'token': $sessionStorage.token
            }
          }

          $http(groupsReq).success(function (data) {
            $scope.scanresults = data.data

            $scope.vulnerabilities = data.data.results.chartdata.vulnerabilities
            $scope.risk = data.data.results.chartdata.risks

            $scope.vulns = []
            for (var nr in data.data.results.devices) {
              for (var vuln in data.data.results.devices[nr].vulnerabilities) {
                $scope.vulns.push(data.data.results.devices[nr].vulnerabilities[vuln])
              }
            }
          })
        })

        let devicesReq = {
          method: 'GET',
          url: '/api/devices',
          headers: {
            'token': $sessionStorage.token
          }
        }
        $http(req).success(function (data) {
          $scope.devices = data.data
        })
      }

      $scope.viewThreat = function (ev, vuln) {
        $rootScope.vuln = vuln
        $mdDialog.show({
          controller: viewThreatController,
          templateUrl: '/components/mainComponent/dialogs/viewThreat.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false,
          hasBackdrop: false
        })
        $state.reload()
      }

      function viewThreatController ($scope, $mdDialog, $rootScope) {
        $scope.vuln = $rootScope.vuln

        $scope.cancel = function () {
          $mdDialog.cancel()
        }
      }
    })
