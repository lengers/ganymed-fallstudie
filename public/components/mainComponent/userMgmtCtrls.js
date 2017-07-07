'use strict'
angular
    .module('userMgmtCtrls', ['ngMaterial', 'ngMessages', 'ngStorage'])
    .controller('userMgmtCtrl', function ($scope, $http, $state, $rootScope, $localStorage, $mdToast, $mdDialog, $sessionStorage) {
      $scope.user = {
        name: '',
        mail: '',
        settings: {
          receive_mails: false
        }
      }

      $scope.data = {
        sendmail: false
      }

      if ($sessionStorage.token === undefined) {
        $state.go('login')
      };
      var req = {
        method: 'GET',
        url: '/api/auth/check',
        headers: {
          'token': $sessionStorage.token
        }
      }
      $http(req).then(function (res, error) {
        if (res.data.status != 'ok') {
          $state.go('login')
        } else {
          $scope.decoded = res.data.data
          console.log($scope.decoded)
          if ($scope.decoded.group === 'admin') {
            console.log('GOING FULL ADMIN!')
            $state.go('main.account.admin')
          }
          $scope.getUserData()
        }
      })

      $scope.getUserData = function (type) {
        var req = {
          method: 'GET',
          url: '/api/users/' + $scope.decoded.name,
          headers: {
            'token': $sessionStorage.token
          }
        }
        $http(req).success(function (data) {
          $scope.user = data.data[0]
          console.log($scope.user)
        })
      }

      $scope.updateUserData = function () {
        const userUpdateReq = {
          method: 'PUT',
          url: '/api/users/' + $scope.user.username,
          headers: {
            'token': $sessionStorage.token
          },
          data: {
            username: $scope.user.username,
            password: null,
            group: $scope.user.group,
            settings: $scope.user.settings,
            mail: $scope.user.mail,
            notification_on: $scope.user.notification_on
          }
        }
        $http(userUpdateReq).success(function (data) {
          $state.reload()
          $mdToast.show(
                    $mdToast.simple()
                    .textContent('Änderungen gespeichert.')
                    .position('top right')
                    .hideDelay(3000)
                )
        })
      }

      $scope.changePassword = function (ev, user) {
        $rootScope.user = user
        $mdDialog.show({
          controller: passwordDialogController,
          templateUrl: '/components/mainComponent/dialogs/changePassword.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false,
          hasBackdrop: false
        }).then($state.reload())
            // $scope.updateUsersData();
      }

      function passwordDialogController ($scope, $mdDialog) {
        $scope.user = $rootScope.user
        $scope.user.password = ''
        $scope.user.passwordConfirm = ''

        $scope.cancel = function () {
          $mdDialog.cancel()
        }

        $scope.answer = function (answer) {
          if (answer === 'abort') {
            $mdDialog.cancel()
          } else if (answer === 'send') {
            console.log($scope.user)
            const userUpdateReq = {
              method: 'PUT',
              url: '/api/users/' + $scope.user.username,
              headers: {
                'token': $sessionStorage.token
              },
              data: {
                username: $scope.user.username,
                password: $scope.user.password,
                group: $scope.user.group,
                settings: $scope.user.settings,
                mail: $scope.user.mail,
                notification_on: $scope.user.notification_on
              }
            }
            $http(userUpdateReq).success(function (data) {
              console.log(data)
              $mdDialog.hide(answer)

              $mdToast.show(
                            $mdToast.simple()
                            .textContent('Änderungen gespeichert.')
                            .position('top right')
                            .hideDelay(3000)
                        )
              $state.reload()
            })
          }
        }
        $rootScope.user = undefined
      }
    })
