/* -------------------------app.main.js------------------------------------
 *
 * app.main.js is the script which will be executed, after app.js.
 * All front-end components and resources, which will be needed by AngularJS and
 * the frontend are loaded via app.main.js.Furthermore important config data is set.
 *
 * ------------------------------------------------------------------- */

'use strict'

angular
    .module('Ganymed', // tools HAVE to be loaded before the main components
  [
            // tools
    'ui.router', 'ngMaterial',
            // components
    'mainComponent.main'
  ])
    .config(['$mdThemingProvider', '$urlRouterProvider', '$qProvider', function ($mdThemingProvider, $urlRouterProvider, $qProvider) {
      $mdThemingProvider
      .theme('default')
      .primaryPalette('blue-grey')
      .accentPalette('indigo')
      $urlRouterProvider.otherwise('/') // if the user types some gibberish for an url he gets redirected to this page
    }])
