/// <reference path="typings/angularjs/angular.d.ts" />

module Spiro.Angular {

    /* Declare app level module */
    export var app = angular.module('app', ['ngResource']);

    app.config(function ($routeProvider) {
        $routeProvider.
            when('/services', {
                templateUrl: 'Content/partials/services.html',
                controller: 'ServicesController'
            }).
            when('/services/:sid', {
                templateUrl: 'Content/partials/service.html',
                controller: 'ServiceController'
            }).
            when('/objects/:dt/:id', {
                templateUrl: 'Content/partials/object.html',
                controller: 'ObjectController'
            }).
            otherwise({
                redirectTo: '/services'
            });
    });

    export interface ContextInterface {
        getHome: () => ng.IPromise;
        getServices: () => ng.IPromise;
        getObject: (type: string, id?: string) => ng.IPromise;
        setObject: (object: DomainObjectRepresentation) => void;
        getNestedObject: (type: string, id: string) => ng.IPromise;
        setNestedObject: (object: DomainObjectRepresentation) => void;

        getCollection: () => ng.IPromise;
        setCollection: (list: ListRepresentation) => void;

        getError: () => ErrorRepresentation;
        setError: (object: ErrorRepresentation) => void;

        
    }

    export interface RLInterface {
        populate: (m: HateoasModel, ignoreCache? : bool) => ng.IPromise;
    }

    function getUrl(model: HateoasModel): string {

        var url = model.url();

        if (model.method === "GET" || model.method === "DELETE") {
            var asJson = _.clone((<any>model).attributes);

            if (_.toArray(asJson).length > 0) {
                var map = JSON.stringify(asJson);
                var encodedMap = encodeURI(map);
                url += "?" + encodedMap;
            }
        }

        return url;
    }

     // TODO investigate using transformations to transform results 
    app.service("RepresentationLoader", function ($http, $q) {
        this.populate = function (model: HateoasModel, ignoreCache?: bool) {

            var useCache = !ignoreCache; 

            var delay = $q.defer();

            var config = {
                url: getUrl(model), 
                method: model.method,
                cache: useCache
            }

            $http(config).
                success(function (data, status, headers, config) {
                    (<any>model).attributes = data; // TODO make typed 
                    delay.resolve(model);
                }).
                error(function (data, status, headers, config) {

                    if (status === 500) {
                        var error = new ErrorRepresentation(data);
                        delay.reject(error);
                    }
                    else {
                        var errorMap = new ErrorMap(data, status, headers().warning);
                        delay.reject(errorMap);
                    }
                });

            return delay.promise;
        };
    });

    app.service('Context', function ($q, RepresentationLoader: RLInterface) {

        var currentHome: HomePageRepresentation = null;

        function isSameObject(object: DomainObjectRepresentation, type: string, id?: string) {
            var sid = object.serviceId();
            return  sid ?  sid === type : (object.domainType() == type && object.instanceId() === id);
        } 

        this.getDomainObject = function(type: string, id: string) {
          
            var object = new DomainObjectRepresentation();
            object.hateoasUrl = appPath + "/objects/" + type + "/" + id;
            return RepresentationLoader.populate(object);
        } 
        
        this.getService = function (type: string) {
            var delay = $q.defer();

            this.getServices().
                then(function (services: DomainServicesRepresentation) {
                    var serviceLink = _.find(services.value().models, (model) => { return model.rel().parms[0] === 'serviceId="' + type + '"'; });
                    var service = serviceLink.getTarget();
                    return RepresentationLoader.populate(service);
                }).
                then(function (service: DomainObjectRepresentation) {
                    currentObject = service;
                    delay.resolve(service);
                });
            return delay.promise; 
        } 


        this.getHome = function () {
            var delay = $q.defer();

            if (currentHome) {
                delay.resolve(currentHome);
            }
            else {
                var home = new HomePageRepresentation();
                RepresentationLoader.populate(home).then(function (home: HomePageRepresentation) {
                    currentHome = home; 
                    delay.resolve(home);
                });
            }

            return delay.promise;
        }

        var currentServices: DomainServicesRepresentation = null;

        this.getServices = function () {
            var delay = $q.defer();

            if (currentServices) {
                delay.resolve(currentServices);
            }
            else {
                this.getHome().
                    then(function (home: HomePageRepresentation) {
                        var ds = home.getDomainServices();
                        return RepresentationLoader.populate(ds);
                    }).
                    then(function (services: DomainServicesRepresentation) {
                        currentServices = services;
                        delay.resolve(services);
                    });
            }

            return delay.promise;
        }

        var currentObject: DomainObjectRepresentation = null;

        this.getObject = function (type: string, id?: string) {
            var delay = $q.defer();

            if (currentObject && isSameObject(currentObject, type, id)) {
                delay.resolve(currentObject);
            }
            else {
                var promise = id ? this.getDomainObject(type, id) : this.getService(type);     
                promise.
                    then(function (object: DomainObjectRepresentation) {
                        currentObject = object;
                        delay.resolve(object);
                    });
            }

            return delay.promise;
        }

        this.setObject = function (co) {
            currentObject = co;
        }

        var currentNestedObject: DomainObjectRepresentation = null;

        this.getNestedObject = function (type: string, id: string) {
            var delay = $q.defer();

            if (currentNestedObject && isSameObject(currentNestedObject, type, id)) {
                delay.resolve(currentNestedObject);
            }
            else {
                var object = new DomainObjectRepresentation();
                object.hateoasUrl = appPath + "/objects/" + type + "/" + id;

                RepresentationLoader.populate(object).
                    then(function (object: DomainObjectRepresentation) {
                        currentNestedObject = object;
                        delay.resolve(object);
                    });
            }

            return delay.promise;
        }

        this.setNestedObject = function (cno) {
            currentNestedObject = cno;
        }

        var currentError: ErrorRepresentation = null;

        this.getError = function () {
            return currentError;
        }
        this.setError = function (e: ErrorRepresentation) {
            currentError = e; 
        }


        var currentCollection: ListRepresentation = null;

        this.getCollection = function () {
            var delay = $q.defer();
            delay.resolve(currentCollection);
            return delay.promise;
        }

        this.setCollection = function (c: ListRepresentation) {
            currentCollection = c;
        }

    });
}