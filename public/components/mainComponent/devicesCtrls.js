/* -------------------------devicesCtrls.js------------------------------------
 * This is the controller which provides functionality for the devices-view (devices.html)
 * This file includes functionality to insert new devices, edit existing devices and delete them.
 *
 * ------------------------------------------------------------------- */

'use strict'
angular
    .module('devicesCtrls', ['ngMaterial', 'ngStorage'])
    .controller('devicesCtrl', function ($scope, $rootScope, $state, $http, $mdToast, $mdDialog, $sessionStorage, $localStorage) {
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

      //functionality for userdialogue to delete a device
      $scope.deleteDevice = function (ev, device) {
        var confirm = $mdDialog.confirm()
                .title('Ausgewähltes Device entfernen?')
                .textContent('Alle Einträge zu diesem Gerät werden dauerhaft gelöscht.')
                .ariaLabel('Device entfernen')
                .targetEvent(ev)
                .ok('Bestätigen')
                .cancel('Abbrechen')
                .hasBackdrop(false)

      //after confirmation the api endpoint to delete chosen device is called
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

      // get details to a device in list
      $scope.viewDevice = function (ev, device) {
        $rootScope.device = device.uuid
        $rootScope.editDevice = $scope.editDevice
        $rootScope.editDeviceController = $scope.editDeviceController

        $mdDialog.show({
          controller: viewDeviceController,
          templateUrl: '/components/mainComponent/dialogs/viewDevice.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          hasBackdrop: false
        })
      }

      function viewDeviceController ($scope, $mdDialog, $rootScope) {
        $scope.deviceID = $rootScope.device
        $scope.editDevice = $rootScope.editDevice
        $scope.editDeviceController = $scope.editDeviceController

        $scope.cancel = () => {
          $mdDialog.cancel()
        }

        $scope.edit = () => {
          console.log('edit')
          $scope.editDevice(null, $scope.device)
        }

        // request to load all devices
        const deviceReq = {
          method: 'GET',
          url: '/api/devices/' + $scope.deviceID,
          headers: {
            'token': $sessionStorage.token
          }
        }
        $http(deviceReq).success(function (data) {
          $scope.device = data.data[0]
        })
      }

      //functionality for userdialogue to add a new device
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

        $scope.services = []
        $scope.caption = 'hinzufügen'
        $scope.action = 'Device anlegen'

        $scope.addService = () => {
          if ($scope.deviceForm.servicePortInput.$valid) {
            $scope.serviceList.push($scope.addServicePort)
            $scope.addServicePort = null
          }
        }

        $scope.serviceRegex = /[a-z]+:[0-9]+/ // i.e. http:80 // /(?:[a-z]+:[0-9]+(?:,\s)*)+/
        $scope.macRegex = '([A-Z0-9]{2}:[A-Z0-9]{2}:[A-Z0-9]{2}:[A-Z0-9]{2}:[A-Z0-9]{2}:[A-Z0-9]{2})'
        $scope.ipRegex = /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/
        $scope.servicePort = ''
        $scope.serviceList = []
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

        // generate uuid for a device
        let uuid4 = function () {
          return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                )
        }

        $scope.device.uuid = uuid4()
        $scope.device.risk_level = Math.floor((Math.random() * 5) + 1)

        $scope.createDevice = function () {
          for (var i = 0; i < $scope.serviceList.length; i++) {
            let splitArr = $scope.serviceList[i].split(':')
            $scope.services.push(splitArr[0])
            $scope.ports.push(splitArr[1])
          }
          $scope.device.ports = $scope.ports.join(', ')
          $scope.device.services = $scope.services.join(', ')

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
      }

      $scope.editDevice = function (ev, device) {
        $rootScope.device = device
        $mdDialog.show({
          controller: editDeviceController,
          templateUrl: '/components/mainComponent/dialogs/addDevice.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          hasBackdrop: false
        })
      }

      function editDeviceController ($scope, $mdDialog, $mdToast, $state, $rootScope) {
        $scope.cancel = function () {
          $mdDialog.cancel()
        }

        $scope.caption = 'bearbeiten'
        $scope.action = 'Änderungen speichern'

        $scope.serviceRegex = /[a-z]+:[0-9]+(?:,\s[a-z]+:[0-9]+)*/ // i.e. http: 80 // /(?:[a-z]+:[0-9]+(?:,\s)*)+/
        $scope.macRegex = '([A-Z0-9]+:[A-Z0-9]+:[A-Z0-9]+:[A-Z0-9]+:[A-Z0-9]+:[A-Z0-9]+)'
        $scope.ipRegex = '([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)'
        $scope.servicePort = ''
        $scope.services = []
        $scope.ports = []

        $scope.device = $rootScope.device
        console.log($scope.device.services)
        $scope.serviceArray = $scope.device.services.split(', ')
        console.log($scope.device.ports)
        $scope.portArray = $scope.device.ports.split(', ')
        $scope.servicePortBuildArray = []
        for (var ec = 0; ec < $scope.serviceArray.length; ec++) {
          $scope.servicePortBuildArray.push($scope.serviceArray[ec] + ':' + $scope.portArray[ec])
        }
        console.log($scope.servicePortBuildArray)
        $scope.servicePort = $scope.servicePortBuildArray.join(', ')
        console.log($scope.servicePort)

        $scope.createDevice = function () {
          let servicePortArr = $scope.servicePort.split(', ')
          for (var i = 0; i < servicePortArr.length; i++) {
            let splitArr = servicePortArr[i].split(':')
            $scope.services.push(splitArr[0])
            $scope.ports.push(splitArr[1])
          }
          $scope.device.ports = $scope.ports.join(', ')
          $scope.device.services = $scope.services.join(', ')

          //Put update to db via api endpoint
          const deviceUpdateReq = {
            method: 'PUT',
            url: '/api/devices/' + $scope.device.uuid,
            headers: {
              'token': $sessionStorage.token
            },
            data: JSON.stringify($scope.device)
          }
          $http(deviceUpdateReq).success(function (data) {
            $mdDialog.hide()
            $state.reload()
            $mdToast.show(
                $mdToast.simple()
                .textContent('Änderungen gespeichert.')
                .position('top right')
                .hideDelay(3000)
            )
          })
        }
      }
    })
