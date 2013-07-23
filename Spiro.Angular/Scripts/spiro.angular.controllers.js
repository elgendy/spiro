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

        Angular.app.controller('ObjectController', function ($scope, $routeParams, $location, $cacheFactory, RepresentationLoader, Context) {
            Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                Context.setNestedObject(null);
                $scope.actionTemplate = $routeParams.editMode ? "" : "Content/partials/actions.html";
                $scope.propertiesTemplate = $routeParams.editMode ? "Content/partials/editProperties.html" : "Content/partials/viewProperties.html";

                $scope.object = Angular.DomainObjectViewModel.create(object, $routeParams, function (ovm) {
                    var update = object.getUpdateMap();

                    var properties = _.filter(ovm.properties, function (property) {
                        return property.isEditable;
                    });
                    _.each(properties, function (property) {
                        return update.setProperty(property.id, property.getValue());
                    });

                    RepresentationLoader.populate(update, true, new Spiro.DomainObjectRepresentation()).then(function (updatedObject) {
                        var rawLinks = (object).get("links");
                        (updatedObject).set("links", rawLinks);

                        $cacheFactory.get('$http').remove(updatedObject.url());

                        Context.setObject(updatedObject);

                        $location.search("");
                    }, function (error) {
                        if (error instanceof Spiro.ErrorMap) {
                            var errorMap = error;

                            _.each(properties, function (property) {
                                var error = errorMap.values()[property.id];

                                if (error) {
                                    property.value = error.value.toValueString();
                                    property.error = error.invalidReason;
                                }
                            });

                            ovm.message = errorMap.invalidReason();
                        } else if (error instanceof Spiro.ErrorRepresentation) {
                            var errorRep = error;
                            var evm = Angular.ErrorViewModel.create(errorRep);
                            $scope.error = evm;

                            $scope.propertiesTemplate = "Content/partials/error.html";
                        } else {
                            ovm.message = error;
                        }
                    });
                });
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

        Angular.app.controller('AppBarController', function ($scope, $routeParams, $location, Context) {
            $scope.appBar = {};

            $scope.appBar.goHome = "#/";

            $scope.appBar.goBack = function () {
                parent.history.back();
            };

            $scope.appBar.goForward = function () {
                parent.history.forward();
            };

            $scope.appBar.hideEdit = true;

            Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                $scope.appBar.hideEdit = !(object);

                $scope.appBar.doEdit = "#" + $location.url() + "?editMode=true";
            });
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.angular.controllers.js.map
