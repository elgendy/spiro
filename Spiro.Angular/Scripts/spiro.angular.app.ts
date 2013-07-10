/// <reference path="typings/angularjs/angular.d.ts" />

module Spiro.Angular {

    /* Declare app level module */
    export var app = angular.module('app', ['ngResource']);

    app.config(function ($routeProvider) {
        $routeProvider.when('/services', {
            templateUrl: 'Content/partials/services.html',
            controller: 'ServicesController'
        }).when('/services/:sid', {
                templateUrl: 'Content/partials/service.html',
                controller: 'ServiceController'
            }).when('/objects/:dt/:id', {
                templateUrl: 'Content/partials/object.html',
                controller: 'LinkController'
            }).when('/services/:sid/actions/:aid/', {
                templateUrl: 'Content/partials/service.html',
                controller: 'ActionController'
            }).when('/objects/:dt/:id/properties/:pid/', {
                templateUrl: 'Content/partials/object.html',
                controller: 'LinkController'
            }).otherwise({
                redirectTo: '/services'
            });
    });

    export interface ContextInterface {

        getCurrentServices: () => DomainServicesRepresentation;
        setCurrentServices: (dsr : DomainServicesRepresentation) => void;

        getCurrentObject: () => DomainObjectRepresentation;
        setCurrentObject: (dor : DomainObjectRepresentation) => void;

        getCurrentNestedObject: () => DomainObjectRepresentation;
        setCurrentNestedObject: (dor : DomainObjectRepresentation) => void;
    }

    app.service('Context', function (Home : ng.IPromise) {
        var currentServices: DomainServicesRepresentation = null;

        this.getCurrentServices = function () {
            return currentServices;
        }

        this.setCurrentServices = function (css) {
            currentServices = css;
        }

        var currentObject: DomainObjectRepresentation = null;

        this.getCurrentObject = function () {
            return currentObject;
        }

        this.setCurrentObject = function (co) {
            currentObject = co;
        }

        var currentNestedObject: DomainObjectRepresentation = null;

        this.getCurrentNestedObject = function () {
            return currentNestedObject;
        }

        this.setCurrentNestedObject = function (cno) {
            currentNestedObject = cno;
        }

    });


    // TODO investigate usisng transformations to transform results 
  
    app.factory('Home', function ($http, $q) {
        var home = new HomePageRepresentation();

        var delay = $q.defer();
        
        $http.get(home.url()).success(function (data, status, headers, config) {
            home.attributes = data;
            delay.resolve(home);
        }).error(function (data, status, headers, config) {
            delay.reject('Unable to find home page');
        });

        return delay.promise;
    });

    export interface RLInterface {
        populate: (m: HateoasModel) => ng.IPromise; 
    }

    app.service("RepresentationLoader", function ($http, $q) {
        this.populate = function (model: HateoasModel) {

            var delay = $q.defer();

            $http.get(model.url()).success(function (data, status, headers, config) {
                (<any>model).attributes = data; // TODO make typed 
                delay.resolve(model);
            }).error(function (data, status, headers, config) {
                    delay.reject('Unable to find page');
                });

            return delay.promise;
        };
    });
}