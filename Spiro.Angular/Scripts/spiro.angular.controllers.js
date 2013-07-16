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
                $scope.object = Angular.ServiceViewModel.create(service, $routeParams);
            }, function (error) {
                $scope.service = {};
            });
        });

        function getActionDialog($scope, $routeParams, $location, RepresentationLoader, Context) {
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
                    var invoke = action.getInvoke();
                    invoke.attributes = {};
                    $scope.dialogTemplate = "Content/partials/dialog.html";
                    $scope.dialog = Angular.DialogViewModel.create(action, $routeParams, function (dvm) {
                        var parameters = dvm.parameters;

                        _.each(parameters, function (parm) {
                            return invoke.setParameter(parm.id, new Spiro.Value(parm.value || ""));
                        });

                        RepresentationLoader.populate(invoke, true).then(function (result) {
                            var resultObject = result.result().object();

                            Context.setNestedObject(resultObject);

                            if (resultObject) {
                                var resultParm = "result=" + resultObject.domainType() + "-" + resultObject.instanceId();
                                $location.search(resultParm);
                            } else {
                                dvm.error = "no result found";
                            }
                        }, function (errorMap) {
                            _.each(parameters, function (parm) {
                                var error = errorMap.values()[parm.id];

                                if (error) {
                                    parm.value = error.value.toValueString();
                                    parm.error = error.invalidReason;
                                }
                            });

                            dvm.error = errorMap.invalidReason();
                        });
                    });
                }
            }, function (error) {
                $scope.service = {};
            });
        }

        function getActionResult($scope, $routeParams, $location, RepresentationLoader, Context) {
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
                if (!action.extensions().hasParams) {
                    var result = action.getInvoke();
                    return RepresentationLoader.populate(result, true);
                }
            }).then(function (result) {
                var resultObject = result.result().object();

                Context.setNestedObject(resultObject);

                var resultParm = "result=" + resultObject.domainType() + "-" + resultObject.instanceId();
                var otherParms = Angular.getOtherParms($routeParams, ["property", "collectionItem", "result", "action"]);

                $location.search(resultParm + otherParms);
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

        Angular.app.controller('DialogController', function ($scope, $routeParams, $location, RepresentationLoader, Context) {
            if ($routeParams.action) {
                getActionDialog($scope, $routeParams, $location, RepresentationLoader, Context);
            }
        });

        Angular.app.controller('NestedObjectController', function ($scope, $routeParams, $location, RepresentationLoader, Context) {
            if ($routeParams.action) {
                getActionResult($scope, $routeParams, $location, RepresentationLoader, Context);
            }
            if ($routeParams.property) {
                getProperty($scope, $routeParams, $location, RepresentationLoader, Context);
            } else if ($routeParams.collectionItem) {
                getCollectionItem($scope, $routeParams, $location, RepresentationLoader, Context);
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
