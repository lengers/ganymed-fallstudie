/* -------------------------userMgmtCtrls.js------------------------------------
 *
 * This is the controller which realizes the functionality for the
 * Prdinary-user-Style view for the User Management  (userMgmt.html).
 * Since the ordinary user has no authorization to edit the other uses
 * (delete, alter group, create new users etc.) he needs to see a
 * limited view and controllerfor only to manage his own user settings
 * like password, mail settings etc.
 *
 * ------------------------------------------------------------------- */

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
      //default: no mail notifications
      $scope.data = {
        sendmail: false
      }

      //normal user auth check instead of admin auth check, like in userMgmtCtrls.js
      if ($sessionStorage.token === undefined) {
        // if token is not valid/undefined => show login page
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

      //retrieve information about current user using his decoded user name
      $scope.getUserData = function (type) {
        var req = {
          method: 'GET',
          url: '/api/users/' + $scope.decoded.name,
          headers: {
            'token': $sessionStorage.token
          }
        }
        $http(req).success(function (data) {
          // on success fill scope with current user data
          $scope.user = data.data[0]
          $scope.user.notification_on = Boolean(data.data[0].notification_on)
          //parse settings data which comes via api from local db
          // which is stored in local db as JSON
          $scope.user.settings = JSON.parse(data.data[0].settings)
        //   console.log(JSON.parse(data.data[0].settings).mail_risk)
        //   $scope.user.settings.mail_risk = Boolean(data.data[0].settings.mail_risk)

        //   console.log($scope.user)
        })
      }
      // ask user to enter mail adress, when he turns on mail notification_on
      // and has not yet provided an adress
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
      //update functionality via API endpoint call
      // PUT input data with the call
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
        //inform user about the successful saving
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
      //user dialog to change password
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
        //set current user in local scope
        $scope.user = $rootScope.user
        //prepare for password comparison
        $scope.user.password = ''
        $scope.user.passwordConfirm = ''

        $scope.cancel = function () {
          $mdDialog.cancel()
        }

        // after confirmation update user in local db
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
                //on success inform user about successful saving
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
