'use strict'
angular
    .module('userMgmtCtrls', ['ngMaterial', 'ngMessages', 'ngStorage'])
    .controller('userMgmtCtrl', function($scope, $http, $rootScope, $localStorage, $mdToast, $sessionStorage) {

        $scope.user = {
            name: '',
            group: '',
            mail: '',
            settings: {
                receive_mails: false,

            }
        }

        $scope.data = {
            sendmail: false
        };

        if ($sessionStorage.token == undefined) {
            $state.go('login')
        };
        var req = {
            method: 'GET',
            url: '/api/auth/check',
            headers: {
                'token': $sessionStorage.token
            }
        }
        $http(req).then(function(res, error) {
            if (res.data.status != 'ok') {
                $state.go(login)
            } else {
                $scope.decoded = res.data.data;
                $scope.updateUserData();
            }
        })

        $scope.updateUserData = function(type) {
            var req = {
                method: 'GET',
                url: '/api/users/' + $scope.decoded.name,
                headers: {
                    'token': $sessionStorage.token
                }
            }
            // get's the mock-JSON and performs some operations on it to get count, etc and writes the values into scope
            $http(req).success(function(data) {
                $scope.user.name = data.data[0].username;
                if (data.data[0].mail === null) {
                    $scope.user.mail = "Not set"
                } else {
                    $scope.user.mail = data.data[0].mail;
                }
                $scope.user.group = data.data[0].group;
            })
        }

        $scope.$watch('data', function(newValue, oldValue, scope) {
            console.log(newValue);
            console.log(scope);
        }, true);

    })
