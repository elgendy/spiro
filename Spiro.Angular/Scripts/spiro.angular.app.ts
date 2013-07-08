﻿/// <reference path="typings/angularjs/angular.d.ts" />

module Spiro.Angular {

    interface ColourMapItemInterface {
        [index: string]: string;
    }

    interface ColourMapInterface {
        [index: string]: ColourMapItemInterface;
    }

    declare var colourMap: ColourMapInterface;
    declare var defaultColourArray: ColourMapItemInterface[];
    declare var defaultColour: ColourMapItemInterface;

    /* Declare app level module */
    export var app = angular.module('app', []);

    app.config(function ($routeProvider) {
        $routeProvider.when('/services', {
            templateUrl: 'Content/partials/services.html',
            controller: 'ServicesController'
        }).when('/services/:sid', {
                templateUrl: 'Content/partials/service.html',
                controller: 'ServiceController'
            }).when('/objects/:dt/:id', {
                templateUrl: 'Content/partials/object.html',
                controller: 'ObjectController'
            }).when('/services/:sid/actions/:aid/', {
                templateUrl: 'Content/partials/service.html',
                controller: 'ServiceController'
            }).otherwise({
                redirectTo: '/services'
            });
    });

    app.service("RoServer", function ($http) {
        this.getServices = function () {
            return $http.get("http://mvc.nakedobjects.net:1081/RestDemo/services");
        };
        
        this.getService = function (sid) {
            return $http.get("http://mvc.nakedobjects.net:1081/RestDemo/services/" + sid);
        };
        
        this.getObject = function (dt, id) {
            return $http.get("http://mvc.nakedobjects.net:1081/RestDemo/objects/" + dt + "/" + id);
        };

        this.getAction = function (sid, aid) {
            return $http.get("http://mvc.nakedobjects.net:1081/RestDemo/services/" + sid + "/actions/" + aid);
        };

        this.getResult = function (sid, aid) {
            return $http.get("http://mvc.nakedobjects.net:1081/RestDemo/services/" + sid + "/actions/" + aid + "/invoke");
        };

    });

    app.filter('toLocalUrl', function () {
        return function (href) {
            var urlRegex = /(services)\/([\w|\.]+)/;
            var results = (urlRegex).exec(href);
            return (results && results.length > 2) ? "#/" + results[1] + "/" + results[2] : "";
        };
    });

    app.filter('toObjectLocalUrl', function () {
        return function (href) {
            var urlRegex = /(objects)\/([\w|\.]+)\/([\w|\.]+)/;
            var results = (urlRegex).exec(href);
            return (results && results.length > 2) ? "#/" + results[1] + "/" + results[2] + "/" + results[3] : "";
        };
    });

    var filter = app.filter('toActionUrl', function () {
        return function (href) {

            var urlRegex = /(objects|services)\/([\w|\.]+)\/actions\/([\w|\.]+)/;

            var results = (urlRegex).exec(href);
            if (results && results.length > 3) {
                return "#/" + results[1] + "/" + results[2] + "/actions/" + results[3];
            }

            return "";
        };
    });

    function hashCode(toHash) {
        var hash = 0, i, char;
        if (toHash.length == 0) return hash;
        for (i = 0; i < toHash.length; i++) {
            char = toHash.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    function getColourMapValues(dt) {
        var map = dt ? colourMap[dt] : defaultColour;
        if (!map) {
            var hash = Math.abs(hashCode(dt));
            var index = hash % 18;
            map = defaultColourArray[index];
            colourMap[dt] = map;
        }
        return map;
    }

    function typeFromUrl(url) {
        var typeRegex = /(objects|services)\/([\w|\.]+)/;
        var results = (typeRegex).exec(url);
        return (results && results.length > 2) ? results[2] : "";
    }

    app.filter('toColorFromHref', function () {
        return function (href) {
            var type = typeFromUrl(href);
            return "bg-color-" + getColourMapValues(type)["backgroundColor"];
        };
    });

    app.filter('toColorFromType', function () {
        return function (type) {
            return "bg-color-" + getColourMapValues(type)["backgroundColor"];
        };
    });

}