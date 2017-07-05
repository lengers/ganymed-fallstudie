'use strict'

angular
    .module('Ganymed', // tools HAVE to be loaded before the main components
  [
            // tools
    'ui.router', 'ngMaterial',
            // components
    'mainComponent.main',
            // services, factories, filters
    'debuggingServices'
  ])
    .config(['$mdThemingProvider', '$urlRouterProvider', '$qProvider', function ($mdThemingProvider, $urlRouterProvider, $qProvider) {
      $mdThemingProvider
      .theme('default')
      .primaryPalette('blue-grey')
      .accentPalette('indigo')
      $urlRouterProvider.otherwise('/') // if the user types some gibberish for an url he gets redirected to this page
    }])
