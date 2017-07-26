/* -------------------------loginCtrls.js------------------------------------
 * This is the controller which provides functionality for the login-view (login.html)
 * This file includes functionality to ask for the users credential and route this payload
 * to auth endpoint to get the user authenticated. On success user is routed to dashboard.
 *
 * ------------------------------------------------------------------- */


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

          $scope.token = ''

          $scope.$storage = $localStorage

            // function that is invoked after trying to login
          $scope.update = function (user) {
                // when success, provide token and route to dashboard
            $http.post('/api/auth', {name: user.name, password: user.password})
                .then(function (response) {
                  $localStorage.token = response.data.token
                  $sessionStorage.token = response.data.token
                  window.location = '/'
                  //show dashboard
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
