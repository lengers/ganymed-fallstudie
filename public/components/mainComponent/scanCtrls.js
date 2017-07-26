/* -------------------------scanCtrls.js------------------------------------
 *
 * This is the controller which realizes the functionality for the
 * scan-view (scan.html). It provides functionality for
 * displaying the scans ordered after creation time descending and providing
 * details and visualization.
 * Furthermore the user can manually start scans via button click on the view.
 *
 * ------------------------------------------------------------------- */

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
    // authenticate user and keep him logged in, if valid token is provided (via API call)
    // no admin authentication needed, normal users can create scans and so on as well
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
        //route to login page if user's token is not valid
        if (res.data.status != 'ok') {
          $state.go('login')
        } else {
        // user's token is valid => get Scans
          $scope.decoded = res.data.data
          $scope.getScans()
        }
      })

      //read in all scans from local db via api call
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
            //on success set the result as set of previous scans to display them in list
          $scope.previousScans = data.data.previous
        })
      }

      //if user wants to start a scan manually -> use API endpoint
      $scope.startScan = function () {
        let req = {
          method: 'GET',
          url: '/api/scan/start',
          headers: {
            'token': $sessionStorage.token
          }
        }
        $http(req).success(function (data) {
          //on success set uuid for scan and inform user about scan start
          let scanUuid = data.uuid
          $mdToast.show(
                    $mdToast.simple()
                    .textContent('Scan gestartet.')
                    .position('top right')
                    .hideDelay(3000)
                )

                //ask for scan status / progress to eventually set a timeout
          $timeout(function () {
            let req = {
              method: 'GET',
              url: '/api/scan/status/' + scanUuid,
              headers: {
                'token': $sessionStorage.token
              }
            }
            // get scan results from just started and finished scans
            $http(req).success(function (data) {
              let req = {
                method: 'GET',
                url: '/api/scan/results/' + scanUuid,
                headers: {
                  'token': $sessionStorage.token
                }
              }
              $http(req).success(function (data) {
                //update scan list in order to display just finished
                $state.reload()
                //inform user about successful temrination
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

      //view scan details
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
        // prepare to visualize scan results via diagrammes
        // one diagram for scanned ports (requires an arry )
        // one diageam for a risk distribution (requires an array)
        $scope.scan = $rootScope.scan
        $scope.port = {}
        $scope.risk = {}

        //get scan results to visualize results
        const groupsReq = {
          method: 'GET',
          url: '/api/scan/results/' + $scope.scan,
          headers: {
            'token': $sessionStorage.token
          }
        }
        // on success: set variables with requested data (sets)
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
