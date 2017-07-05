'use strict'
angular
    .module('userMgmtAdminCtrls', ['ngMaterial', 'ngMessages', 'ngStorage'])
    .directive('passwordVerify', function () {
      return {
        require: 'ngModel',
        scope: {
          passwordVerify: '='
        },
        link: function (scope, element, attrs, ctrl) {
          scope.$watch(function () {
            var combined

            if (scope.passwordVerify || ctrl.$viewValue) {
              combined = scope.passwordVerify + '_' + ctrl.$viewValue
            }
            return combined
          }, function (value) {
            if (value) {
              ctrl.$parsers.unshift(function (viewValue) {
                var origin = scope.passwordVerify
                if (origin !== viewValue) {
                  ctrl.$setValidity('passwordVerify', false)
                  return undefined
                } else {
                  ctrl.$setValidity('passwordVerify', true)
                  return viewValue
                }
              })
            }
          })
        }
      }
    })
    .controller('userMgmtAdminCtrl', function ($scope, $http, $state, $mdDialog, $rootScope, $localStorage, $mdToast, $sessionStorage) {
      $rootScope.newUser = {
        username: '',
        password: '',
        passwordConfirm: '',
        group: '',
        settings: {
          receive_mails: false
        },
        mail: null,
        notification_on: false
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
          $state.go(login)
        } else {
          $scope.decoded = res.data.data
          if ($scope.decoded.group !== 'admin') {
            console.log('Not Admin!')
            $state.go('main.account')
          } else {
            $scope.updateUsersData()
          }
        }
      })

      $scope.updateUsersData = function (type) {
        var req = {
          method: 'GET',
          url: '/api/users/',
          headers: {
            'token': $sessionStorage.token
          }
        }
            // get's the mock-JSON and performs some operations on it to get count, etc and writes the values into scope
        $http(req).success(function (data) {
          $scope.users = data.data
          console.log($scope.users)
        })
      }

      $scope.deleteUser = function (ev, user) {
            // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
                .title('Diesen Benutzer löschen?')
                .textContent('Alle Einstellungen dieses Benutzers werden unwiderruflich gelöscht.')
                .ariaLabel('Benutzer löschen?')
                .targetEvent(ev)
                .ok('Benutzer löschen')
                .cancel('Abbrechen')
                .hasBackdrop(false)

        $mdDialog.show(confirm).then(function () {
          $scope.status = 'You decided to get rid of your debt.'
          console.log(user.username)
          var req = {
            method: 'DELETE',
            url: '/api/users/' + user.username,
            headers: {
              'token': $sessionStorage.token
            }
          }
                // get's the mock-JSON and performs some operations on it to get count, etc and writes the values into scope
          $http(req).success(function (data) {
            $mdToast.show(
                        $mdToast.simple()
                        .textContent('Benutzer gelöscht.')
                        .position('top right')
                        .hideDelay(3000)
                    )
          }).then($state.reload())
        }, function () {
          $scope.status = 'Abort deleting.'
        })
            // $scope.updateUsersData();
        $state.reload()
      }

      $scope.editUser = function (ev, user) {
        $rootScope.newUser = {
          username: user.username,
          password: '',
          passwordConfirm: '',
          group: user.group,
          settings: user.settings,
          mail: user.mail,
          notification_on: user.notification_on
        }
        console.log($rootScope.newUser)

        $mdDialog.show({
          controller: EditDialogController,
          templateUrl: '/components/mainComponent/dialogs/editUser.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false,
          hasBackdrop: false
        })
            // $scope.updateUsersData();
        $state.reload()
      }

      $scope.addUser = function (ev) {
        $mdDialog.show({
          controller: AddDialogController,
          templateUrl: '/components/mainComponent/dialogs/createUser.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false,
          hasBackdrop: false
        }).then($state.reload())
            // $scope.updateUsersData();
      }

      function AddDialogController ($scope, $mdDialog) {
        const groupsReq = {
          method: 'GET',
          url: '/api/groups/',
          headers: {
            'token': $sessionStorage.token
          }
        }

        $scope.newUser = {
          username: '',
          password: null,
          passwordConfirm: '',
          group: '',
          settings: {
            receive_mails: false
          },
          mail: null,
          notification_on: false
        }

        $http(groupsReq).success(function (data) {
          $scope.groups = data.data
        })

        $scope.cancel = function () {
          $mdDialog.cancel()
        }

            // Code recyclen...
        $scope.answer = function (answer) {
          if (answer === 'abort') {
            $mdDialog.cancel()
          } else if (answer === 'send') {
            $scope.userForm.$setSubmitted()
            console.log($scope.userForm.$valid)
            $scope.userForm.name.$setValidity('required', false)
            if ($scope.userForm.$valid) {
                        // check if user exists
              const userCheckReq = {
                method: 'GET',
                url: '/api/users/' + $scope.newUser.username,
                headers: {
                  'token': $sessionStorage.token
                }
              }
              $http(userCheckReq).success(function (data) {
                if (data.data.length != 0) {
                  console.log('User already exists')
                  $scope.userForm.name.$setValidity('default', false)
                } else {
                  console.log($scope.newUser)
                  const userCreateReq = {
                    method: 'POST',
                    url: '/api/users/' + $scope.newUser.username,
                    headers: {
                      'token': $sessionStorage.token
                    },
                    data: {
                      username: $scope.newUser.username,
                      password: $scope.newUser.password,
                      group: $scope.newUser.group,
                      settings: {
                        receive_mails: $scope.newUser.receive_mails
                      },
                      mail: $scope.newUser.mail,
                      notification_on: $scope.newUser.notification_on
                    }
                  }
                  console.log(userCreateReq)
                  $http(userCreateReq).success(function (data) {
                    console.log(data)
                    $mdDialog.hide(answer)

                    $mdToast.show(
                                        $mdToast.simple()
                                        .textContent('User erstellt.')
                                        .position('top right')
                                        .hideDelay(3000)
                                    )
                                    // Overwrite because root
                    $scope.newUser = {
                      username: '',
                      password: '',
                      passwordConfirm: '',
                      group: '',
                      settings: {
                        receive_mails: false
                      },
                      mail: null,
                      notification_on: false
                    }

                    $state.reload()
                  })
                }
              })
            }
          }
        }
      }

      function EditDialogController ($scope, $mdDialog, $rootScope) {
        const groupsReq = {
          method: 'GET',
          url: '/api/groups/',
          headers: {
            'token': $sessionStorage.token
          }
        }

        $scope.newUser = $rootScope.newUser

        $http(groupsReq).success(function (data) {
          $scope.groups = data.data
        })

        $scope.cancel = function () {
          $mdDialog.cancel()
        }

            // Code recyclen...
        $scope.answer = function (answer) {
          if (answer === 'abort') {
            $mdDialog.cancel()
          } else if (answer === 'send') {
                    // check if user exists
            const userCheckReq = {
              method: 'GET',
              url: '/api/users/' + $scope.newUser.username,
              headers: {
                'token': $sessionStorage.token
              }
            }
            $http(userCheckReq).success(function (data) {
              if (data.data.length != 0) {
                console.log('User already exists')
                $scope.userForm.name.$setValidity('default', false)
              } else {
                console.log($scope.newUser)
                const userUpdateReq = {
                  method: 'PUT',
                  url: '/api/users/' + $scope.newUser.username,
                  headers: {
                    'token': $sessionStorage.token
                  },
                  data: {
                    username: $scope.newUser.username,
                    password: $scope.newUser.password,
                    group: $scope.newUser.group,
                    settings: {
                      receive_mails: $scope.newUser.receive_mails
                    },
                    mail: $scope.newUser.mail,
                    notification_on: $scope.newUser.notification_on
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
                  $scope.updateUsersData()
                                // Overwrite because root
                  $rootScope.newUser = {
                    username: '',
                    password: '',
                    passwordConfirm: '',
                    group: '',
                    settings: {
                      receive_mails: false
                    },
                    mail: null,
                    notification_on: false
                  }

                  $state.reload()
                })
              }
            })
          }
        }
      }
    })
