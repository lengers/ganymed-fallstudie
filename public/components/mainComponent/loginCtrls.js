'use strict'
angular
    .module('loginCtrls', ['ngMaterial', 'ngMessages', 'ngStorage'])
    .controller('loginCtrl',
        function ($scope, $rootScope, $state, $http, $mdDialog, $mdToast, $mdMedia, $localStorage, $sessionStorage) {
            // defines empty user object

          $scope.user = {
            name: '',
            password: ''
          }
          // jazmin was here
          $scope.token = ''

          $scope.$storage = $localStorage

            // function that is invoked after trying to login
          $scope.update = function (user) {
                // when success, give token and go to dashboard
            $http.post('/api/auth', {name: user.name, password: user.password})
                .then(function (response) {
                  $localStorage.token = response.data.token
                  $sessionStorage.token = response.data.token
                  window.location = '/'
                  $state.go('main.overview')
                })
                .catch((response) => {
                  console.log('ERROR: Login failed.')
                  $mdToast.show(
                    $mdToast.simple()
                    .textContent('Logindaten falsch.')
                    .position('top right')
                    .hideDelay(3000)
                  )
                })
                // $state.go('dashboard');
            $state.go('login')
          }
        }
    )
