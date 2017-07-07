'use strict'
angular
    .module('navbarCtrls', ['ngMaterial', 'ngStorage'])
    .controller('navbarCtrl', function ($scope, $timeout, $mdSidenav, $http, $state, $log, $mdDialog, $mdMedia, $rootScope, $sessionStorage, $localStorage, watcherDebugService) {

        $scope.checkAdmin = () => {
            let req = {
              method: 'GET',
              url: '/api/auth/check',
              headers: {
                'token': $sessionStorage.token
              }
            }
            $http(req).success(function (data) {
                if (data.data.group === 'admin') {
                    $state.go('main.account.admin')
                    console.log('Should be admin')
                } else {
                    $state.go('main.account')
                }
            })
        }

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
          }
        })
        console.log($scope.navbarAccountRoute)


                // closes the sidenav
        $scope.close = function () {
          $mdSidenav('left').close()
        }

                // toggles fullscreen mode and changes the button label
        $scope.toggleFullscreen = function () {
          screenfull.toggle()
          toggleFullscreenButton()
        }

        $scope.logout = () => {
            $mdSidenav('left').close()
            $sessionStorage.token = null
            $state.go('login')
        }

                // well... the main title
        $scope.mainTitle = 'Ganymed'

                // makes the buildDelayedToggler() function available from the html
        $scope.toggleMenu = buildDelayedToggler('left')

                // needed for fancy sideNavBar animation
        function debounce (func, wait, context) {
          var timer
          return function debounced () {
            var context = $scope,
              args = Array.prototype.slice.call(arguments)
            $timeout.cancel(timer)
            timer = $timeout(function () {
              timer = undefined
              func.apply(context, args)
            }, wait || 10)
          }
        };

                // toggles the sideNavBar
        function buildDelayedToggler (navID) {
          return debounce(function () {
            $mdSidenav(navID)
                .toggle()
                .then(function () {})
          }, 200)
        };
      }
    )
