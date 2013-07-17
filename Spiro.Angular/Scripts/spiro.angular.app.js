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
            }).otherwise({
                redirectTo: '/services'
            });
        });

        function getUrl(model) {
            var url = model.url();

            if (model.method === "GET" || model.method === "DELETE") {
                var asJson = _.clone((model).attributes);

                if (_.toArray(asJson).length > 0) {
                    var map = JSON.stringify(asJson);
                    var encodedMap = encodeURI(map);
                    url += "?" + encodedMap;
                }
            }

            return url;
        }

        Angular.app.service("RepresentationLoader", function ($http, $q) {
            this.populate = function (model, ignoreCache) {
                var useCache = !ignoreCache;

                var delay = $q.defer();

                var config = {
                    url: getUrl(model),
                    method: model.method,
                    cache: useCache
                };

                $http(config).success(function (data, status, headers, config) {
                    (model).attributes = data;
                    delay.resolve(model);
                }).error(function (data, status, headers, config) {
                    if (status === 500) {
                        var error = new Spiro.ErrorRepresentation(data);
                        delay.reject(error);
                    } else {
                        var errorMap = new Spiro.ErrorMap(data, status, headers().warning);
                        delay.reject(errorMap);
                    }
                });

                return delay.promise;
            };
        });

        Angular.app.service('Context', function ($q, RepresentationLoader) {
            var currentHome = null;

            function isSameObject(object, type, id) {
                var sid = object.serviceId();
                return sid ? sid === type : (object.domainType() == type && object.instanceId() === id);
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

            var currentError = null;

            this.getError = function () {
                return currentError;
            };
            this.setError = function (e) {
                currentError = e;
            };

            var currentCollection = null;

            this.getCollection = function () {
                var delay = $q.defer();
                delay.resolve(currentCollection);
                return delay.promise;
            };

            this.setCollection = function (c) {
                currentCollection = c;
            };
        });

        Angular.app.service("Handlers", function ($routeParams, $location, $q, RepresentationLoader, Context) {
            this.handleError = function (error) {
                var errorRep;
                if (error instanceof Spiro.ErrorRepresentation) {
                    errorRep = error;
                } else {
                    errorRep = new Spiro.ErrorRepresentation({ message: "an unrecognised error has occurred" });
                }
                Context.setError(errorRep);
            };

            this.handleCollectionResult = function ($scope) {
                Context.getCollection().then(function (list) {
                    $scope.collection = Angular.CollectionViewModel.createFromList(list, $routeParams, $location);
                    $scope.collectionTemplate = "Content/partials/nestedCollection.html";
                }, function (error) {
                    this.handleError(error);
                });
            };

            this.handleCollection = function ($scope) {
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
                    this.handleError(error);
                });
            };

            function handleResult(result, dvm, show) {
                if (result.result().isNull()) {
                    if (dvm) {
                        dvm.error = "no result found";
                    }
                    return;
                }

                if (result.resultType() === "object") {
                    var resultObject = result.result().object();

                    Context.setNestedObject(resultObject);

                    var resultParm = "resultObject=" + resultObject.domainType() + "-" + resultObject.instanceId();
                    var actionParm = show ? "&action=" + $routeParams.action : "";

                    $location.search(resultParm + actionParm);
                }

                if (result.resultType() === "list") {
                    var resultList = result.result().list();

                    Context.setCollection(resultList);

                    var pps = dvm ? _.reduce(dvm.parameters, function (memo, parm) {
                        return memo + parm.value + "-";
                    }, "") : "";

                    var resultParm = "resultCollection=" + $routeParams.action + pps;
                    var actionParm = show ? "&action=" + $routeParams.action : "";

                    $location.search(resultParm + actionParm);
                }
            }

            this.handleActionDialog = function ($scope) {
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
                        $scope.dialogTemplate = "Content/partials/dialog.html";
                        $scope.dialog = Angular.DialogViewModel.create(action, $routeParams, function (dvm, show) {
                            dvm.clearErrors();

                            var invoke = action.getInvoke();
                            invoke.attributes = {};

                            var parameters = dvm.parameters;
                            _.each(parameters, function (parm) {
                                return invoke.setParameter(parm.id, new Spiro.Value(parm.value || ""));
                            });

                            RepresentationLoader.populate(invoke, true).then(function (result) {
                                handleResult(result, dvm, show);
                            }, function (error) {
                                if (error instanceof Spiro.ErrorMap) {
                                    var errorMap = error;

                                    _.each(parameters, function (parm) {
                                        var error = errorMap.values()[parm.id];

                                        if (error) {
                                            parm.value = error.value.toValueString();
                                            parm.error = error.invalidReason;
                                        }
                                    });

                                    dvm.error = errorMap.invalidReason();
                                } else if (error instanceof Spiro.ErrorRepresentation) {
                                    var errorRep = error;
                                    var evm = Angular.ErrorViewModel.create(errorRep);
                                    $scope.error = evm;

                                    $scope.dialogTemplate = "Content/partials/error.html";
                                }
                            });
                        });
                    }
                }, function (error) {
                    this.handleError(error);
                });
            };

            this.handleActionResult = function ($scope) {
                Context.getObject($routeParams.sid || $routeParams.dt, $routeParams.id).then(function (object) {
                    var actions = _.map(object.actionMembers(), function (value, key) {
                        return { key: key, value: value };
                    });
                    var action = _.find(actions, function (kvp) {
                        return kvp.key === $routeParams.action;
                    });

                    if (action.value.extensions().hasParams) {
                        var delay = $q.defer();
                        delay.reject();
                        return delay.promise;
                    }
                    var actionTarget = action.value.getDetails();
                    return RepresentationLoader.populate(actionTarget);
                }).then(function (action) {
                    var result = action.getInvoke();
                    return RepresentationLoader.populate(result, true);
                }).then(function (result) {
                    handleResult(result);
                }, function (error) {
                    if (error) {
                        this.handleError(error);
                    }
                });
            };

            function handleNestedObject(object, $scope) {
                $scope.result = Angular.DomainObjectViewModel.create(object, $routeParams);
                $scope.nestedTemplate = "Content/partials/nestedObject.html";
                Context.setNestedObject(object);
            }

            function findProperty(map, id) {
                var properties = _.map(map, function (value, key) {
                    return { key: key, value: value };
                });
                return _.find(properties, function (kvp) {
                    return kvp.key === id;
                });
            }

            this.handleProperty = function ($scope) {
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
                    handleNestedObject(object, $scope);
                }, function (error) {
                    this.handleError(error);
                });
            };

            this.handleCollectionItem = function ($scope) {
                var collectionItemTypeKey = $routeParams.collectionItem.split("/");
                var collectionItemType = collectionItemTypeKey[0];
                var collectionItemKey = collectionItemTypeKey[1];

                Context.getNestedObject(collectionItemType, collectionItemKey).then(function (object) {
                    handleNestedObject(object, $scope);
                }, function (error) {
                    this.handleError(error);
                });
            };
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.angular.app.js.map
