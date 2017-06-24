var app = angular.module('IdentityServices', []);

app.factory('IdentityService', ["$http", function($http) {
  var identity = {
    manufacturer: 'BMW', //Someday a login thing!
    activeModelId: "",
    //TODO: generate lat / lng of manufacturer's central, for BMW it is munich:
    getManufacturerLocation: function() {
      return {
        lat: 48.1344109,
        lng: 11.4752025,
        zoom: 3
      }
    }
  }
  return identity;
}]);