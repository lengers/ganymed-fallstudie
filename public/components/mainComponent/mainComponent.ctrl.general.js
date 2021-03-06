/* -------------------------mainComponentCtrls.general.js------------------------------------
 *
 * This is the controller which provides functionality for the menu-bar.
 *
 * ------------------------------------------------------------------- */


'use strict'
angular
    .module('mainComponentCtrls', ['ngMaterial', 'ngMessages'])
    .controller('navbarControl', ['$scope', '$timeout', '$mdSidenav', '$log', '$mdDialog', '$mdMedia', '$rootScope', 'watcherDebugService',
      function ($scope, $timeout, $mdSidenav, $log, $mdDialog, $mdMedia, $rootScope, watcherDebugService) {
            // closes the sidenav
        $scope.close = function () {
          $mdSidenav('left').close()
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
    ])
