'use strict'
angular
    .module('userMgmtCtrls', ['ngMaterial', 'ngMessages', 'ngStorage'])
    .controller('userMgmtCtrl', function ($scope, $http, $state, $rootScope, $localStorage, $mdToast, $mdDialog, $sessionStorage) {
      $scope.user = {
        name: '',
        mail: '',
        notification_on: true,
        settings: {
          mail_risk: false,
          risklevel: 1
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
        //   console.log($scope.decoded)
          if ($scope.decoded.group === 'admin') {
            // console.log('GOING FULL ADMIN!')
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
          $scope.user.notification_on = Boolean(data.data[0].notification_on)
          $scope.user.settings = JSON.parse(data.data[0].settings)
        //   console.log(JSON.parse(data.data[0].settings).mail_risk)
        //   $scope.user.settings.mail_risk = Boolean(data.data[0].settings.mail_risk)

        //   console.log($scope.user)
        })
      }

      $scope.switchMail = () => {
        if ($scope.user.mail === null) {
          console.log('toast')
          $mdToast.show($mdToast.simple()
            .textContent('Keine Emailadresse angegeben.')
            .position('top right')
            .hideDelay(3000))

          $scope.user.notification_on = false
        }
      }

      $scope.updateUserData = function () {
        console.log($scope.user)
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
            $scope.userForm.$setSubmitted()
            if ($scope.userForm.$valid) {
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
        }
        $rootScope.user = undefined
      }
    })
