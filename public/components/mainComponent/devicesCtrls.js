'use strict'
angular
.module('devicesCtrls', ['ngMaterial'])
.controller('devicesCtrl', ['$scope', function($scope, $mdThemingProvider) {

    var imagePath = 'assets/img/device.png';


    $scope.listofdev = [
      {
        pic : imagePath,
        device: 'Ip-Kamera außen',
        ip: '192.168.196.12',
        manufactur: 'Pornhub Spycam GmbH',
        port: ':8080',
        risklevel: 'Hohes Risiko'
      },
      {
        pic : imagePath,
        device: 'Ip-Kamera innen',
        ip: '192.168.196.13',
        manufactur: 'Pornhub Spycam GmbH',
        port: ':8080',
        risklevel: 'Sehr niedriges Risiko',
      },
      {
        pic : imagePath,
        device: 'Heizungssteuerung',
        ip: '192.168.196.14',
        manufactur: 'IOT Boys',
        port: ':8080',
        risklevel: 'Kein Risiko',
      },
      {
        pic : imagePath,
        device: "Bad",
        ip: '192.168.196.15',
        manufactur: 'SpycamStream',
        port: ':8080',
        risklevel: 'Hohes Risiko',
      }


    ];

    $scope.ip = ["192.168.19.12", "192.168.19.13", "192.168.19.14",null];
    $scope.namen = ["Spycam Bad", "Kamera innen", "Kamera außen",null];
    $scope.selectedItem1;
    $scope.getSelectedTextIP = function() {
           if ($scope.selectedItem1 !== undefined) {
             return $scope.selectedItem1;
           } else {
             return "Wähle eine IP-Adresse";
           }
         };

    $scope.selectedItem2;
    $scope.getSelectedTextName = function() {
                if ($scope.selectedItem2 !== undefined) {
                  return $scope.selectedItem2;
                } else {
                  return "Wähle einen Namen";
                }
              };


      $scope.items = ["Bad","Küche","Wohnzimmer","Außen","Innen","Wurst","Käse"];
      $scope.selected = [];
      $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
          list.splice(idx, 1);
        }
        else {
          list.push(item);
        }
      };
      $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
      };


}]);
