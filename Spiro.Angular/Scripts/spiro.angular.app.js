var Spiro;
(function (Spiro) {
    (function (Angular) {
        Angular.app = angular.module('app', ['ngResource']);

        Angular.app.config(function ($routeProvider) {
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
                controller: 'ActionController'
            }).when('/objects/:dt/:id/actions/:aid/', {
                templateUrl: 'Content/partials/object.html',
                controller: 'ActionController'
            }).otherwise({
                redirectTo: '/services'
            });
        });

        Angular.app.service("RepresentationLoader", function ($http, $q) {
            this.populate = function (model, ignoreCache) {
                var useCache = !ignoreCache;

                var delay = $q.defer();

                $http.get(model.url(), { cache: useCache }).success(function (data, status, headers, config) {
                    (model).attributes = data;
                    delay.resolve(model);
                }).error(function (data, status, headers, config) {
                    delay.reject('Unable to find page');
                });

                return delay.promise;
            };
        });

        Angular.app.service('Context', function ($q, RepresentationLoader) {
            var currentHome = null;

            function isSameObject(object, type, id) {
                if (object.serviceId) {
                    return object.serviceId() === type;
                }

                return object.domainType() == type && object.instanceId() === id;
            }

            this.getDomainObject = function (type, id) {
                var object = new Spiro.DomainObjectRepresentation();
                object.hateoasUrl = appPath + "/objects/" + type + "/" + id;
                return RepresentationLoader.populate(object);
            };

            this.getService = function (type) {
                var delay = $q.defer();

                this.getServices().then(function (services) {
                    var serviceLink = _.find(services.value().models, function (model) {
                        return model.rel().parms[0] === 'serviceId="' + type + '"';
                    });
                    var service = serviceLink.getTarget();
                    return RepresentationLoader.populate(service);
                }).then(function (service) {
                    currentObject = service;
                    delay.resolve(service);
                });
                return delay.promise;
            };

            this.getHome = function () {
                var delay = $q.defer();

                if (currentHome) {
                    delay.resolve(currentHome);
                } else {
                    var home = new Spiro.HomePageRepresentation();
                    RepresentationLoader.populate(home).then(function (home) {
                        currentHome = home;
                        delay.resolve(home);
                    });
                }

                return delay.promise;
            };

            var currentServices = null;

            this.getServices = function () {
                var delay = $q.defer();

                if (currentServices) {
                    delay.resolve(currentServices);
                } else {
                    this.getHome().then(function (home) {
                        var ds = home.getDomainServices();
                        return RepresentationLoader.populate(ds);
                    }).then(function (services) {
                        currentServices = services;
                        delay.resolve(services);
                    });
                }

                return delay.promise;
            };

            var currentObject = null;

            this.getObject = function (type, id) {
                var delay = $q.defer();

                if (currentObject && isSameObject(currentObject, type, id)) {
                    delay.resolve(currentObject);
                } else {
                    var promise = id ? this.getDomainObject(type, id) : this.getService(type);
                    promise.then(function (object) {
                        currentObject = object;
                        delay.resolve(object);
                    });
                }

                return delay.promise;
            };

            this.setObject = function (co) {
                currentObject = co;
            };

            var currentNestedObject = null;

            this.getNestedObject = function (type, id) {
                var delay = $q.defer();

                if (currentNestedObject && isSameObject(currentNestedObject, type, id)) {
                    delay.resolve(currentNestedObject);
                } else {
                    var object = new Spiro.DomainObjectRepresentation();
                    object.hateoasUrl = appPath + "/objects/" + type + "/" + id;

                    RepresentationLoader.populate(object).then(function (object) {
                        currentNestedObject = object;
                        delay.resolve(object);
                    });
                }

                return delay.promise;
            };

            this.setNestedObject = function (cno) {
                currentNestedObject = cno;
            };

            this.isNestedContext = function (type, id) {
                return currentNestedObject && currentNestedObject.domainType() === type && currentNestedObject.instanceId() === id;
            };
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.angular.app.js.map
