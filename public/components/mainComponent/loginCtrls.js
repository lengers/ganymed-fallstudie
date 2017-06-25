'use strict'
angular
    .module('loginCtrls', ['ngMaterial', 'ngMessages', 'ngStorage'])
    .controller('loginCtrl',
        function($scope, $rootScope, $state, $http, $mdDialog, $mdMedia, $localStorage, $sessionStorage) {

            // defines empty user object
            $scope.user = {
                name: '',
                password: '',
            };

            $scope.token = "";

            $scope.$storage = $localStorage;

            // function that is invoked after trying to login
            $scope.update = function(user) {
                // when success, give token and go to dashboard
                $http.post("/api/auth", {name: user.name, password: user.password})
                .then(function(response, error) {
                    if (response.data.type == true) {
                        $localStorage.token = response.data.token;
                        $sessionStorage.token = response.data.token;
                        window.location = "/"
                        $state.go('main.overview');
                    } else {
                        // TODO: Fehlermeldung an User
                        console.log("ERROR: Login failed.");
                    }
                })
                // $state.go('dashboard');
                $state.go('login')

            };

        }
    )
