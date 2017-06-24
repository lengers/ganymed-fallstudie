'use strict'
angular
    .module('userMgmtCtrls', ['ngMaterial', 'ngMessages'])
    .controller('userMgmtCtrl', ['$scope', function($scope) {

        // this is actually a pretty good way to fill a drop down menu. replace ' ' with a seperator you like, e.g. ','
        $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
            'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
            'WY').split(' ').map(function(state) {
            return {
                abbrev: state
            };
        })
    }])
