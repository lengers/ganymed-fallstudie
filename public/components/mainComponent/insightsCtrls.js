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
            steps: 1,
            stepValue: 1,
            min: 0,
            max: 5
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
      $http(req).then((res, error) => {
        if (res.data.status != 'ok') {
          $state.go('login')
        } else {
          $scope.decoded = res.data.data
          $scope.getScans()
        }
      })

      $scope.radarChartSettings = {
        scale: {
          ticks: {
            scaleBeginAtZero: true,
            steps: 1,
            stepValue: 1,
            min: 0,
            max: 5
          }
        },
        legend: {
          display: false
        }
      }

      $scope.getScans = (type) => {
        let scanReq = {
          method: 'GET',
          url: '/api/scan',
          headers: {
            'token': $sessionStorage.token
          }
        }
        $http(scanReq).success((data) => {
          $scope.previousScans = data.data.previous

          const groupsReq = {
            method: 'GET',
            url: '/api/scan/results/' + $scope.previousScans[0].scan_no,
            headers: {
              'token': $sessionStorage.token
            }
          }

          $http(groupsReq).success((data) => {
            $scope.scanresults = data.data.results

            $scope.vulnerabilities = data.data.results.chartdata.vulnerabilities
            $scope.highestVulnCount = Math.max.apply(Math, $scope.vulnerabilities.count)
            $scope.radarChartSettings.scale.ticks.max = $scope.highestVulnCount + 1

            $scope.risk = data.data.results.chartdata.risks

            $scope.vulns = data.data.results.vulnerabilities
          })
        })

        let devicesReq = {
          method: 'GET',
          url: '/api/devices',
          headers: {
            'token': $sessionStorage.token
          }
        }
        $http(req).success((data) => {
          $scope.devices = data.data
        })
      }

      $scope.viewThreat = (ev, vuln) => {
        $rootScope.vuln = vuln
        $rootScope.scanNo = $scope.previousScans[0].scan_no
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

      function viewThreatController ($scope, $mdDialog, $rootScope, $state) {
        $scope.vuln = $rootScope.vuln
        $scope.scanNo = $rootScope.scanNo
        console.log($scope.vuln)

        $scope.cancel = () => {
          $mdDialog.cancel()
          $state.reload()
        }

        $scope.fix = () => {
          let fixReq = {
            method: 'GET',
            url: '/scanforge/fix/' + $scope.scanNo + '/' + $scope.vuln.device,
            headers: {
              'token': $sessionStorage.token
            }
          }
          $http(fixReq).success((data) => {
          })
          $mdDialog.cancel()
          $state.reload()
        }
      }
    })
