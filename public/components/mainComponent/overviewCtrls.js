'use strict'
angular
    .module('overviewCtrls', ['ngMaterial', 'ngMessages', 'ngStorage'])
    .controller('overviewCtrl', function ($scope, $state, $http, $rootScope, $localStorage, $sessionStorage) {
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
      $http(req).then(function (res, error) {
        if (res.data.status != 'ok') {
          $state.go('login')
        }
      })

      $scope.port = {}
      $scope.risk = {}

      const scanReq = {
        method: 'GET',
        url: '/api/scan',
        headers: {
          'token': $sessionStorage.token
        }
      }
      $http(scanReq).success(function (data) {
        $scope.scan = data.data.previous[0]
        const scanReq = {
          method: 'GET',
          url: '/api/scan/results/' + data.data.previous[0].scan_no,
          headers: {
            'token': $sessionStorage.token
          }
        }

        $http(scanReq).success(function (data) {
          $scope.scanresults = data.data
                // set risk graph
          $scope.risk.risks = data.data.results.chartdata.risks.risks
          $scope.risk.series = data.data.results.chartdata.risks.risks
          $scope.risk.count = data.data.results.chartdata.risks.count
          let average = (array) => array.reduce((a, b) => a + b) / array.length
          $scope.overallRisk = Math.floor(average($scope.risk.risks))

          $scope.colorArray = ['#009933', '#47d147', '#ccff33', '#e6e600', '#ff9900', '#e68a00', '#e62e00', '#cc2900', '#cc0000', '#990000']
                //   Alternative
          $scope.colorArray2 = ['#66ccff', '#1ac6ff', '#00ace6', '#3399ff', '#0066cc', '#0059b3', '#0033cc', '#002db3', '#003399', '#000099']

          $scope.customStyle.style = {
            'color': $scope.colorArray[$scope.overallRisk - 1],
            'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
            'margin-bottom': '5%',
            'margin-top': '5%'
          }
        })
      })
    })
