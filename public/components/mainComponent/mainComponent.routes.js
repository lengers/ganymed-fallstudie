angular
    .module('mainComponentRoutes', [])
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider

            .state('login', {
              templateUrl: 'components/mainComponent/login.html',
              controller: 'loginCtrl',
              url: '/login'
            })
            .state('main', {
              abstract: true,
              templateUrl: '/components/mainComponent/navbar.html',
              controller: 'navbarCtrl',
              url: '/'
            })
            .state('main.overview', {
              templateUrl: '/components/mainComponent/overview.html',
              controller: 'overviewCtrl',
              url: ''
            })
            .state('main.account', {
              templateUrl: '/components/mainComponent/userMgmt.html',
              controller: 'userMgmtCtrl',
              url: 'account'
            })
            .state('main.account.admin', {
              templateUrl: '/components/mainComponent/userMgmtAdmin.html',
              controller: 'userMgmtAdminCtrl',
              url: ''
            })
            .state('main.scan', {
              templateUrl: '/components/mainComponent/scan.html',
              controller: 'scanCtrl',
              url: 'scans'
            })
            .state('main.insights', {
              templateUrl: '/components/mainComponent/insights.html',
              controller: 'insightsCtrl',
              url: 'insights'
            })
            .state('main.devices', {
                templateUrl: '/components/mainComponent/devices.html',
                controller: 'devicesCtrl',
                url: 'devices'
            })
    }])
