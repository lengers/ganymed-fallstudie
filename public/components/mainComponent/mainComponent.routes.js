angular
    .module('mainComponentRoutes', [])
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider

            .state('login', {
                templateUrl: "components/mainComponent/login.html",
                controller: 'loginCtrl',
                url: "/login"
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
            .state('main.usermgmt', {
                templateUrl: '/components/mainComponent/userMgmt.html',
                controller: 'userMgmtCtrl',
                url: 'usermgmt'
            })
    }])
