'use strict'

angular
    .module('UserServices', [])
    .service('UserService', function() {
        var user_token = "";
        token.set = function(token) {
            user_token = token;
        };
        return user_token;
    })
