'use strict'
angular
    .module('overviewCtrls', ['ngMaterial', 'ngMessages', 'ngStorage'])
    .controller('overviewCtrl', function ($scope, $http, $rootScope, $localStorage, $sessionStorage) {
      $scope.$storage = $localStorage
      console.log($localStorage.token)
      console.log($sessionStorage.token)

      if ($sessionStorage.token == null) {
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
          $state.go(login)
        }
                // } else if (res.data.data.group == "admin") {
                //     $state.go(main.usermgmt.all)
                // }
      })

      $scope.updateDeviceData = function (type) {
        var req = {
          method: 'GET',
          url: '/api/devices',
          headers: {
            'token': $sessionStorage.token
          }
        }
                // get's the mock-JSON and performs some operations on it to get count, etc and writes the values into scope
        $http(req).success(function (data) {
          console.log(data)
        })
      }
            // invoke it on page load
      $scope.updateDeviceData()
    }
    )
