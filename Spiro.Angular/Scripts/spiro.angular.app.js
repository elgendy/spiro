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

        Angular.app.service('Context', function (Home) {
            var currentServices = null;

            this.getCurrentServices = function () {
                return currentServices;
            };

            this.setCurrentServices = function (css) {
                currentServices = css;
            };

            var currentObject = null;

            this.getCurrentObject = function () {
                return currentObject;
            };

            this.setCurrentObject = function (co) {
                currentObject = co;
            };

            var currentNestedObject = null;

            this.getCurrentNestedObject = function () {
                return currentNestedObject;
            };

            this.setCurrentNestedObject = function (cno) {
                currentNestedObject = cno;
            };
        });

        Angular.app.factory('Home', function ($http, $q) {
            var home = new Spiro.HomePageRepresentation();

            var delay = $q.defer();

            $http.get(home.url()).success(function (data, status, headers, config) {
                home.attributes = data;
                delay.resolve(home);
            }).error(function (data, status, headers, config) {
                delay.reject('Unable to find home page');
            });

            return delay.promise;
        });

        Angular.app.service("RepresentationLoader", function ($http, $q) {
            this.populate = function (model) {
                var delay = $q.defer();

                $http.get(model.url()).success(function (data, status, headers, config) {
                    (model).attributes = data;
                    delay.resolve(model);
                }).error(function (data, status, headers, config) {
                    delay.reject('Unable to find page');
                });

                return delay.promise;
            };
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.angular.app.js.map
