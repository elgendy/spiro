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
            }, function (error) {
                $scope.service = {};
            });
        });

        Angular.app.controller('ActionController', function ($scope, $routeParams, RepresentationLoader, Context) {
            if ($routeParams.action) {
                Context.getObject($routeParams.sid || $routeParams.dt, $routeParams.id).then(function (object) {
                    var actions = _.map(object.actionMembers(), function (value, key) {
                        return { key: key, value: value };
                    });
                    var action = _.find(actions, function (kvp) {
                        return kvp.key === $routeParams.action;
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
                    $scope.result = Angular.DomainObjectViewModel.create(result.result().object(), $routeParams);
                    $scope.nestedTemplate = "Content/partials/nestedObject.html";
                    Context.setNestedObject(result.result().object());
                }, function (error) {
                    $scope.service = {};
                });
            }
        });

        function getAction($scope, $routeParams, $location, RepresentationLoader, Context) {
            Context.getObject($routeParams.sid || $routeParams.dt, $routeParams.id).then(function (object) {
                var actions = _.map(object.actionMembers(), function (value, key) {
                    return { key: key, value: value };
                });
                var action = _.find(actions, function (kvp) {
                    return kvp.key === $routeParams.action;
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
                var resultObject = result.result().object();

                Context.setNestedObject(resultObject);
                var resultParm = "result=" + resultObject.domainType() + "-" + resultObject.instanceId();
                $location.search(resultParm);
            }, function (error) {
                $scope.service = {};
            });
        }

        function getProperty($scope, $routeParams, $location, RepresentationLoader, Context) {
            Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                var properties = _.map(object.propertyMembers(), function (value, key) {
                    return { key: key, value: value };
                });
                var property = _.find(properties, function (kvp) {
                    return kvp.key === $routeParams.property;
                });
                var propertyDetails = property.value.getDetails();
                return RepresentationLoader.populate(propertyDetails);
            }).then(function (details) {
                var target = details.value().link().getTarget();
                return RepresentationLoader.populate(target);
            }).then(function (object) {
                $scope.result = Angular.DomainObjectViewModel.create(object, $routeParams);
                $scope.nestedTemplate = "Content/partials/nestedObject.html";
                Context.setNestedObject(object);
            }, function (error) {
                $scope.object = {};
            });
        }

        function getCollectionItem($scope, $routeParams, $location, RepresentationLoader, Context) {
            var collectionIndex = $routeParams.collectionItem.split("/");
            var collectionName = collectionIndex[0];
            var itemIndex = parseInt(collectionIndex[1]);

            Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                var collections = _.map(object.collectionMembers(), function (value, key) {
                    return { key: key, value: value };
                });
                var collection = _.find(collections, function (kvp) {
                    return kvp.key === collectionName;
                });
                var collectionDetails = collection.value.getDetails();
                return RepresentationLoader.populate(collectionDetails);
            }).then(function (details) {
                var target = details.value().models[itemIndex].getTarget();
                return RepresentationLoader.populate(target);
            }).then(function (object) {
                $scope.result = Angular.DomainObjectViewModel.create(object, $routeParams);
                $scope.nestedTemplate = "Content/partials/nestedObject.html";
                Context.setNestedObject(object);
            }, function (error) {
                $scope.object = {};
            });
        }

        Angular.app.controller('NestedObjectController', function ($scope, $routeParams, $location, RepresentationLoader, Context) {
            if ($routeParams.property) {
                getProperty($scope, $routeParams, $location, RepresentationLoader, Context);
            } else if ($routeParams.collectionItem) {
                getCollectionItem($scope, $routeParams, $location, RepresentationLoader, Context);
            } else if ($routeParams.action) {
                getAction($scope, $routeParams, $location, RepresentationLoader, Context);
            } else if ($routeParams.result) {
                var result = $routeParams.result.split("-");
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

        Angular.app.controller('CollectionController', function ($scope, $routeParams, $location, RepresentationLoader, Context) {
            Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                var collections = _.map(object.collectionMembers(), function (value, key) {
                    return { key: key, value: value };
                });
                var collection = _.find(collections, function (kvp) {
                    return kvp.key === $routeParams.collection;
                });
                var collectionDetails = collection.value.getDetails();
                return RepresentationLoader.populate(collectionDetails);
            }).then(function (details) {
                $scope.collection = Angular.CollectionViewModel.createFromDetails(details, $routeParams);
                $scope.collectionTemplate = "Content/partials/nestedCollection.html";
            }, function (error) {
                $scope.collection = {};
            });
        });

        Angular.app.controller('ObjectController', function ($scope, $routeParams, $location, RepresentationLoader, Context) {
            Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                $scope.object = Angular.DomainObjectViewModel.create(object, $routeParams);
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
