'use strict'
angular
    .module('devicesCtrls', ['ngMaterial', 'ngStorage'])
    .controller('devicesCtrl', function ($scope, $rootScope, $state, $http, $mdDialog, $sessionStorage, $localStorage) {
      let req = {
        method: 'GET',
        url: '/api/devices',
        headers: {
          'token': $sessionStorage.token
        }
      }
        // get's the mock-JSON and performs some operations on it to get count, etc and writes the values into scope
      $http(req).success(function (data) {
        $scope.devices = data.data
      })

      $scope.deleteDevice = function (ev, device) {
        var confirm = $mdDialog.confirm()
        .title('Ausgewähltes Device entfernen?')
        .textContent('Alle Einträge zu diesem Gerät werden dauerhaft gelöscht.')
        .ariaLabel('Device entfernen')
        .targetEvent(ev)
        .ok('Bestätigen')
        .cancel('Abbrechen')
        .hasBackdrop(false)


        $mdDialog.show(confirm).then(function () {
            const deviceDeleteReq = {
              method: 'DELETE',
              url: '/api/devices/' + device.uuid,
              headers: {
                'token': $sessionStorage.token
              }
            }
            $http(deviceDeleteReq).success(function (data) {
                $state.reload()
                $mdToast.show(
                  $mdToast.simple()
                  .textContent('Device entfernt.')
                  .position('top right')
                  .hideDelay(3000)
                 )
            })

        }, function () {
          // nothin' here
        })
      }





      $scope.addDevice = function (ev) {
        $mdDialog.show({
          controller: addDeviceController,
          templateUrl: '/components/mainComponent/dialogs/addDevice.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          hasBackdrop: false
        })
      }

      function addDeviceController ($scope, $mdDialog, $mdToast, $state) {
        $scope.cancel = function () {
          $mdDialog.cancel()
        }

        $scope.serviceRegex = /[a-z]+:[0-9]+(?:,\s[a-z]+:[0-9]+)*/ // /(?:[a-z]+:[0-9]+(?:,\s)*)+/
        $scope.macRegex = '([A-Z0-9]+:[A-Z0-9]+:[A-Z0-9]+:[A-Z0-9]+:[A-Z0-9]+:[A-Z0-9]+)'
        $scope.ipRegex = '([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)'
        $scope.servicePort = ''
        $scope.services = []
        $scope.ports = []

        $scope.device = {
          'uuid': null,
          'ip': null,
          'mac': null,
          'manufacturer': null,
          'ports': null,
          'risk_level': 0,
          'services': null,
          'name': null,
          'modell': null
        }

        let uuid4 = function () {
          return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            )
        }

        $scope.device.uuid = uuid4()

        $scope.createDevice = function () {
          console.log($scope.device)
          let servicePortArr = $scope.servicePort.split(', ')
          console.log(servicePortArr)
          for (var i = 0; i < servicePortArr.length; i++) {
            let splitArr = servicePortArr[i].split(':')
            console.log(splitArr)
            $scope.services.push(splitArr[0])
            $scope.ports.push(splitArr[1])
          }
          $scope.device.ports = $scope.ports.join(', ')
          $scope.device.services = $scope.services.join(', ')
          console.log($scope.device)

          // POST to /device/:uuid
          const deviceAddReq = {
            method: 'POST',
            url: '/api/devices/' + $scope.device.uuid,
            headers: {
              'token': $sessionStorage.token
            },
            data: JSON.stringify($scope.device)
          }
          $http(deviceAddReq).success(function (data) {
            $mdDialog.hide()
            $state.reload()
            $mdToast.show(
              $mdToast.simple()
              .textContent('Device erstellt.')
              .position('top right')
              .hideDelay(3000)
             )
          })
        }
      };
    })
