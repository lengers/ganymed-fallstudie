/* -------------------------insightsCtrls.js------------------------------------
 * This is the controller which provides functionality for the insights-view (insights.html)
 * This file includes functionality to visualize vulnerable services, and the risk distribution among devices.
 * Furthermore found threats are displayed, if there are any, with the offer to immediate fix them (mocked)
 *
 * ------------------------------------------------------------------- */

// Credits to Tobias Rahloff (https://github.com/trahloff) for assistance with chart.js
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
      // if token is not valid/undefined => show login page
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

      //get scan results in order to display vulnerable services and risk distribution
      // via Api endpoint
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

          //retrieve vulnerabilities, maximum count of vulnerabilieties and settings from scan
          // which has beencreated with mock data via scanforge.js
          $http(groupsReq).success((data) => {
            $scope.scanresults = data.data.results

            $scope.vulnerabilities = data.data.results.chartdata.vulnerabilities
            $scope.highestVulnCount = Math.max.apply(Math, $scope.vulnerabilities.count)
            // to keep the chart from displaying peaks out of scope
            $scope.radarChartSettings.scale.ticks.max = $scope.highestVulnCount + 1

            $scope.risk = data.data.results.chartdata.risks

            $scope.vulns = data.data.results.vulnerabilities
          })
        })

        // get devices to display in risk distribution chart
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

      //view threats found in latest scan
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

        // functionality for immediate fixing (mocked via Scanforge.js)
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
