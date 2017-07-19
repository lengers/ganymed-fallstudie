'use strict'
angular
    .module('overviewCtrls', ['ngMaterial', 'ngMessages', 'ngStorage'])
    .controller('overviewCtrl', function ($scope, $state, $http, $rootScope, $mdDialog, $mdToast, $localStorage, $sessionStorage) {
      $scope.$storage = $localStorage

      $scope.customStyle = {}

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
          $state.go('login')
        }
      })

      $scope.port = {}
      $scope.risk = {}

      $scope.disableQuickfix = false

      $scope.viewScans = () => {
        $state.go('main.scan')
      }

      $scope.viewDevices = () => {
        $state.go('main.devices')
      }

      $scope.viewInsights = () => {
        $state.go('main.insights')
      }

      $scope.onlineHelp = () => {
        $mdToast.show(
                $mdToast.simple()
                .textContent('Nicht in der Demo.')
                .position('top right')
                .hideDelay(3000)
            )
      }

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

        $scope.fix = (vuln) => {
          console.log('lol')
          let fixReq = {
            method: 'GET',
            url: '/scanforge/fix/' + $scope.previousScans[0].scan_no + '/' + vuln.device,
            headers: {
              'token': $sessionStorage.token
            }
          }
          console.log(fixReq)
          $http(fixReq).success((data) => {
          })
          let index = $scope.vulns.indexOf(vuln)
          $scope.vulns.splice(index, 1)
          if ($scope.vulns.length <= 0) {
            $scope.cancel()
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
              $scope.vulns = data.data.results.vulnerabilities
            })
          })
        }

        $scope.getScans()
      }

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

        $http(scanReq).success((data) => {
          console.log(data.data)
          $scope.scanresults = data.data
                // set risk graph
          $scope.risk.risks = data.data.results.chartdata.risks.risks
          $scope.risk.series = data.data.results.chartdata.risks.risks
          $scope.risk.count = data.data.results.chartdata.risks.count
          $scope.overallRisk = data.data.results.overallRisk
          if (data.data.results.vulnerabilities.length === 0) {
            $scope.disableQuickfix = true
          }

          $scope.colorArray = ['#009933', '#47d147', '#ccff33', '#e6e600', '#ff9900', '#e68a00', '#e62e00', '#cc2900', '#cc0000', '#990000']
                //   Alternative
          $scope.textArray = ['Minimales Risiko', 'Sehr geringes Risiko', 'Geringes Risiko', 'Geringes Risiko', 'Mittleres Risiko', 'Mittleres Risiko', 'Hohes Risiko', 'Hohes Risiko', 'Hohes Risiko', 'Sehr hohes Risiko']
          $scope.riskText = $scope.textArray[$scope.overallRisk - 1]

          $scope.customStyle.style = {
            'color': $scope.colorArray[$scope.overallRisk - 1],
            'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
            'margin-bottom': '5%',
            'margin-top': '5%'
          }
        })
      })
    })
