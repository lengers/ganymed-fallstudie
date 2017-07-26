/* -------------------------overviewCtrls.js------------------------------------
 *
 * This is the controller which realizes the functionality for the
 * overview-view (overview.html) aka Dashboard. It provides functionality for
 * the different tiles (diagrams, tables, routings to other sites of Ganymed)
 *
 * ------------------------------------------------------------------- */

'use strict'
angular
    .module('overviewCtrls', ['ngMaterial', 'ngMessages', 'ngStorage'])
    .controller('overviewCtrl', function ($scope, $state, $http, $rootScope, $mdDialog, $mdToast, $localStorage, $sessionStorage) {
      $scope.$storage = $localStorage

      $scope.customStyle = {}
      //token is not valid/undefined => show login page and logout user
      if ($sessionStorage.token == undefined) {
        $state.go('login')
      };
      var req = {
        method: 'GET',
        url: '/api/auth/check',
        headers: {
          'token': $sessionStorage.token
        }
      }
      $http(req).then((res, error) => {
        if (res.data.status != 'ok') {
          // if the status is not ok => show login page
          $state.go('login')
        }
      })

      $scope.port = {}
      $scope.risk = {}

      // we do not want the quickfix button (for immediate help when threats are found) to be disabled
      $scope.disableQuickfix = false

      //short access tiles to access insights, devices and scan views
      $scope.viewScans = () => {
        $state.go('main.scan')
      }

      $scope.viewDevices = () => {
        $state.go('main.devices')
      }

      $scope.viewInsights = () => {
        $state.go('main.insights')
      }

      //Tile for online helof (not implemented fo current implementation scope)
      $scope.onlineHelp = () => {
        $mdToast.show(
                $mdToast.simple()
                .textContent('Nicht in der Demo.')
                .position('top right')
                .hideDelay(3000)
            )
      }

      //show user dialogue for quickfix-Button
      $scope.quickFix = (ev) => {
        $mdDialog.show({
          controller: quickFixController,
          templateUrl: '/components/mainComponent/dialogs/quickFix.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          hasBackdrop: false
        })
      }

      let quickFixController = ($scope, $mdDialog, $mdToast, $state) => {
        $scope.cancel = () => {
          $mdDialog.cancel()
          $state.reload()
        }

        //if we want to fix risk level in network immediately
        // load scanforge.js -> fix for mocked solution
        // regarding latest scan
        $scope.fix = (vuln) => {
          console.log('lol')
          let fixReq = {
            method: 'GET',
            //fix latest scan and vulnerable devices
            url: '/scanforge/fix/' + $scope.previousScans[0].scan_no + '/' + vuln.device,
            headers: {
              'token': $sessionStorage.token
            }
          }

          //eliminate the vulnerability / ies which have been removed by quickfiy from the Array
          // if there are no vulnerabilities left -> disable quickfix button
          console.log(fixReq)
          $http(fixReq).success((data) => {
          })
          let index = $scope.vulns.indexOf(vuln)
          $scope.vulns.splice(index, 1)
          if ($scope.vulns.length <= 0) {
            $scope.cancel()
          }
        }

        // read in all scans via API-call
        $scope.getScans = (type) => {
          let scanReq = {
            method: 'GET',
            url: '/api/scan',
            headers: {
              'token': $sessionStorage.token
            }
          }
          //set data as set of previous scans
          $http(scanReq).success((data) => {
            $scope.previousScans = data.data.previous

          //get Scan results via api call
            const groupsReq = {
              method: 'GET',
              url: '/api/scan/results/' + $scope.previousScans[0].scan_no,
              headers: {
                'token': $sessionStorage.token
              }
            }

            //retrieve vulnerabilities from loaded scanresults
            //scanresults are generated based on mocked data via scanforge.js
            $http(groupsReq).success((data) => {
              $scope.vulns = data.data.results.vulnerabilities
            })
          })
        }

        $scope.getScans()
      }

      //get results from the latest scan
      const scanReq = {
        method: 'GET',
        url: '/api/scan',
        headers: {
          'token': $sessionStorage.token
        }
      }
      $http(scanReq).success((data) => {
        $scope.scan = data.data.previous[0]
        const scanReq = {
          method: 'GET',
          url: '/api/scan/results/' + data.data.previous[0].scan_no,
          headers: {
            'token': $sessionStorage.token
          }
        }

        //develop overall-risk level
        $http(scanReq).success((data) => {
          console.log(data.data)
          $scope.scanresults = data.data
                // set risk graph
          $scope.risk.risks = data.data.results.chartdata.risks.risks
          $scope.risk.series = data.data.results.chartdata.risks.risks
          $scope.risk.count = data.data.results.chartdata.risks.count
          $scope.overallRisk = data.data.results.overallRisk
          // if there are no vulnerabilities to fix, then disable quickfix buttons
          if (data.data.results.vulnerabilities.length === 0) {
            $scope.disableQuickfix = true
          }

          //colour legend for visualizing risk level for overall network risk level
          //green is good, yellowish is average up to "worry about that" and red means
          //"Man, better use quickfix button to prevent your network from drowning in abuse and attacks"

          $scope.colorArray = ['#009933', '#47d147', '#ccff33', '#e6e600', '#ff9900', '#e68a00', '#e62e00', '#cc2900', '#cc0000', '#990000']
                //   Legend for colouring
          $scope.textArray = ['Minimales Risiko', 'Sehr geringes Risiko', 'Geringes Risiko', 'Geringes Risiko', 'Mittleres Risiko', 'Mittleres Risiko', 'Hohes Risiko', 'Hohes Risiko', 'Hohes Risiko', 'Sehr hohes Risiko']
          $scope.riskText = $scope.textArray[$scope.overallRisk - 1]
          //config of colour array
          $scope.customStyle.style = {
            'color': $scope.colorArray[$scope.overallRisk - 1],
            'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
            'margin-bottom': '5%',
            'margin-top': '5%'
          }
        })
      })
    })
