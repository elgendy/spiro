var Spiro;
(function (Spiro) {
    (function (Angular) {
        Angular.app.controller('ServicesController', function ($scope, RepresentationLoader, Context) {
            Context.getServices().then(function (services) {
                $scope.services = Angular.ServicesViewModel.create(services);
                Context.setObject(null);
                Context.setNestedObject(null);
            }, function (error) {
                $scope.services = [];
            });
        });

        Angular.app.controller('ServiceController', function ($scope, $routeParams, RepresentationLoader, Context) {
            Context.getObject($routeParams.sid).then(function (service) {
                $scope.object = Angular.ServiceViewModel.create(service);
                Context.setNestedObject(null);
            }, function (error) {
                $scope.service = {};
            });
        });

        Angular.app.controller('ActionController', function ($scope, $routeParams, RepresentationLoader, Context) {
            Context.getObject($routeParams.sid || $routeParams.dt, $routeParams.id).then(function (object) {
                $scope.object = object.extensions().isService ? Angular.ServiceViewModel.create(object) : Angular.DomainObjectViewModel.create(object);

                var actions = _.map(object.actionMembers(), function (value, key) {
                    return { key: key, value: value };
                });
                var action = _.find(actions, function (kvp) {
                    return kvp.key === $routeParams.aid;
                });
                var actionTarget = action.value.getDetails();

                return RepresentationLoader.populate(actionTarget);
            }).then(function (action) {
                if (action.extensions().hasParams) {
                } else {
                    var result = action.getInvoke();
                    return RepresentationLoader.populate(result, true);
                }
            }).then(function (result) {
                $scope.result = Angular.DomainObjectViewModel.create(result.result().object());
                $scope.nestedTemplate = "Content/partials/nestedObject.html";
                Context.setNestedObject(result.result().object());
            }, function (error) {
                $scope.service = {};
            });
        });

        Angular.app.controller('LinkController', function ($scope, $routeParams, $location, RepresentationLoader, Context) {
            var isNestedContext = Context.isNestedContext($routeParams.dt, $routeParams.id);

            var promise = isNestedContext ? Context.getNestedObject($routeParams.dt, $routeParams.id) : Context.getObject($routeParams.dt, $routeParams.id);

            promise.then(function (object) {
                if (!isNestedContext) {
                    $scope.object = Angular.DomainObjectViewModel.create(object);
                }

                var properties = _.map(object.propertyMembers(), function (value, key) {
                    return { key: key, value: value };
                });
                var property = _.find(properties, function (kvp) {
                    return kvp.key === $routeParams.pid;
                });
                var propertyDetails = property.value.getDetails();
                return RepresentationLoader.populate(propertyDetails);
            }).then(function (details) {
                var target = details.value().link().getTarget();
                return RepresentationLoader.populate(target);
            }).then(function (object) {
                if (isNestedContext) {
                    $scope.object = Angular.DomainObjectViewModel.create(object);
                    Context.setObject(object);
                    Context.setNestedObject(null);
                } else {
                    $scope.result = Angular.DomainObjectViewModel.create(object);
                    $scope.nestedTemplate = "Content/partials/nestedObject.html";
                    Context.setNestedObject(object);
                }
            }, function (error) {
                $scope.object = {};
            });
        });

        Angular.app.controller('CollectionController', function ($scope, $routeParams, $location, RepresentationLoader, Context) {
            Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                $scope.object = Angular.DomainObjectViewModel.create(object);

                var collections = _.map(object.collectionMembers(), function (value, key) {
                    return { key: key, value: value };
                });
                var collection = _.find(collections, function (kvp) {
                    return kvp.key === $routeParams.cid;
                });
                var collectionDetails = collection.value.getDetails();
                return RepresentationLoader.populate(collectionDetails);
            }).then(function (details) {
                $scope.collection = Angular.CollectionViewModel.createFromDetails(details);
                $scope.collectionTemplate = "Content/partials/nestedCollection.html";
            }, function (error) {
                $scope.collection = {};
            });
        });

        Angular.app.controller('ObjectController', function ($scope, $routeParams, $location, RepresentationLoader, Context) {
            Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                $scope.object = Angular.DomainObjectViewModel.create(object);
                Context.setNestedObject(null);
            }, function (error) {
                $scope.object = {};
            });
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
