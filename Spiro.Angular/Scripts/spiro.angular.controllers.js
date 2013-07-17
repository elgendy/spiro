var Spiro;
(function (Spiro) {
    (function (Angular) {
        Angular.app.controller('ServicesController', function ($scope, RepresentationLoader, Context, Handlers) {
            Context.getServices().then(function (services) {
                $scope.services = Angular.ServicesViewModel.create(services);
                Context.setObject(null);
                Context.setNestedObject(null);
            }, function (error) {
                Handlers.handleError(error);
            });
        });

        Angular.app.controller('ServiceController', function ($scope, $routeParams, RepresentationLoader, Context, Handlers) {
            Context.getObject($routeParams.sid).then(function (service) {
                $scope.object = Angular.ServiceViewModel.create(service, $routeParams);
            }, function (error) {
                Handlers.handleError(error);
            });
        });

        Angular.app.controller('DialogController', function ($routeParams, $scope, Handlers) {
            if ($routeParams.action) {
                Handlers.handleActionDialog($scope);
            }
        });

        Angular.app.controller('NestedObjectController', function ($scope, $q, $routeParams, $location, RepresentationLoader, Context, Handlers) {
            if ($routeParams.action) {
                Handlers.handleActionResult($scope);
            }
            if ($routeParams.property) {
                Handlers.handleProperty($scope);
            } else if ($routeParams.collectionItem) {
                Handlers.handleCollectionItem($scope);
            } else if ($routeParams.resultObject) {
                var result = $routeParams.resultObject.split("-");
                var dt = result[0];
                var id = result[1];

                Context.getNestedObject(dt, id).then(function (object) {
                    $scope.result = Angular.DomainObjectViewModel.create(object, $routeParams);
                    $scope.nestedTemplate = "Content/partials/nestedObject.html";
                    Context.setNestedObject(object);
                }, function (error) {
                    $scope.object = {};
                });
            }
        });

        Angular.app.controller('CollectionController', function ($routeParams, $scope, Handlers) {
            if ($routeParams.resultCollection) {
                Handlers.handleCollectionResult($scope);
            } else if ($routeParams.collection) {
                Handlers.handleCollection($scope);
            }
        });

        Angular.app.controller('ObjectController', function ($scope, $routeParams, $location, RepresentationLoader, Context) {
            Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                $scope.object = Angular.DomainObjectViewModel.create(object, $routeParams);
                Context.setNestedObject(null);
            }, function (error) {
                $scope.object = {};
            });
        });

        Angular.app.controller('ErrorController', function ($scope, Context) {
            var error = Context.getError();
            if (error) {
                var evm = Angular.ErrorViewModel.create(error);
                $scope.error = evm;
                $scope.errorTemplate = "Content/partials/error.html";
            }
        });

        Angular.app.controller('AppBarController', function ($scope) {
            $scope.goHome = "#/";

            $scope.goBack = function () {
                parent.history.back();
            };

            $scope.goForward = function () {
                parent.history.forward();
            };

            $scope.hideEdit = !$scope.object;
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.angular.controllers.js.map
