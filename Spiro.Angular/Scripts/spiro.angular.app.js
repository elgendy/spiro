var Spiro;
(function (Spiro) {
    (function (Angular) {
        Angular.app = angular.module('app', ['ngResource']);

        Angular.app.config(function ($routeProvider) {
            $routeProvider.when('/services', {
                templateUrl: svrPath + 'Content/partials/services.html',
                controller: 'ServicesController'
            }).when('/services/:sid', {
                templateUrl: svrPath + 'Content/partials/service.html',
                controller: 'ServiceController'
            }).when('/objects/:dt/:id', {
                templateUrl: svrPath + 'Content/partials/object.html',
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

        function getData(model) {
            var data = {};

            if (model.method === "POST" || model.method === "PUT") {
                data = _.clone((model).attributes);
            }

            return data;
        }

        Angular.app.service('ViewModelFactory', function ($routeParams, $location) {
            this.errorViewModel = function (errorRep) {
                return Angular.ErrorViewModel.create(errorRep);
            };

            this.linkViewModel = function (linkRep) {
                return Angular.LinkViewModel.create(linkRep);
            };

            this.itemViewModel = function (linkRep, parentHref, index) {
                return Angular.ItemViewModel.create(linkRep, parentHref, index, $routeParams);
            };

            this.parameterViewModel = function (parmRep, id) {
                return Angular.ParameterViewModel.create(parmRep, id);
            };

            this.actionViewModel = function (actionRep) {
                return Angular.ActionViewModel.create(actionRep, $routeParams);
            };

            this.dialogViewModel = function (actionRep, invoke) {
                return Angular.DialogViewModel.create(actionRep, $routeParams, invoke);
            };

            this.propertyViewModel = function (propertyRep, id) {
                return Angular.PropertyViewModel.create(propertyRep, id, $routeParams);
            };

            this.collectionViewModel = function (collection) {
                if (collection instanceof Spiro.CollectionMember) {
                    return Angular.CollectionViewModel.create(collection, $routeParams);
                }
                if (collection instanceof Spiro.CollectionRepresentation) {
                    return Angular.CollectionViewModel.createFromDetails(collection, $routeParams);
                }
                if (collection instanceof Spiro.ListRepresentation) {
                    return Angular.CollectionViewModel.createFromList(collection, $routeParams, $location);
                }
                return null;
            };

            this.servicesViewModel = function (servicesRep) {
                return Angular.ServicesViewModel.create(servicesRep);
            };

            this.serviceViewModel = function (serviceRep) {
                return Angular.ServiceViewModel.create(serviceRep, $routeParams);
            };

            this.domainObjectViewModel = function (objectRep, save) {
                return Angular.DomainObjectViewModel.create(objectRep, $routeParams, save);
            };
        });

        Angular.app.service("RepresentationLoader", function ($http, $q) {
            this.populate = function (model, ignoreCache, expected) {
                var response = expected || model;
                var useCache = !ignoreCache;

                var delay = $q.defer();

                var config = {
                    url: getUrl(model),
                    method: model.method,
                    cache: useCache,
                    data: getData(model)
                };

                $http(config).success(function (data, status, headers, config) {
                    (response).attributes = data;
                    delay.resolve(response);
                }).error(function (data, status, headers, config) {
                    if (status === 500) {
                        var error = new Spiro.ErrorRepresentation(data);
                        delay.reject(error);
                    } else if (status === 400 || status === 422) {
                        var errorMap = new Spiro.ErrorMap(data, status, headers().warning);
                        delay.reject(errorMap);
                    } else {
                        delay.reject(headers().warning);
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

        Angular.app.service("Handlers", function ($routeParams, $location, $q, $cacheFactory, RepresentationLoader, Context, ViewModelFactory) {
            function setError(error) {
                var errorRep;
                if (error instanceof Spiro.ErrorRepresentation) {
                    errorRep = error;
                } else {
                    errorRep = new Spiro.ErrorRepresentation({ message: "an unrecognised error has occurred" });
                }
                Context.setError(errorRep);
            }
            ;

            this.handleCollectionResult = function ($scope) {
                Context.getCollection().then(function (list) {
                    $scope.collection = ViewModelFactory.collectionViewModel(list);
                    $scope.collectionTemplate = svrPath + "Content/partials/nestedCollection.html";
                }, function (error) {
                    setError(error);
                });
            };

            this.handleCollection = function ($scope) {
                Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                    var collectionDetails = object.collectionMember($routeParams.collection).getDetails();
                    return RepresentationLoader.populate(collectionDetails);
                }).then(function (details) {
                    $scope.collection = ViewModelFactory.collectionViewModel(details);
                    $scope.collectionTemplate = svrPath + "Content/partials/nestedCollection.html";
                }, function (error) {
                    setError(error);
                });
            };

            function handleResult(result, dvm, show) {
                if (result.result().isNull()) {
                    if (dvm) {
                        dvm.error = "no result found";
                    }
                    return;
                }

                var resultParm = "";
                var actionParm = "";

                if (result.resultType() === "object") {
                    var resultObject = result.result().object();

                    Context.setNestedObject(resultObject);

                    resultParm = "resultObject=" + resultObject.domainType() + "-" + resultObject.instanceId();
                    actionParm = show ? "&action=" + $routeParams.action : "";
                }

                if (result.resultType() === "list") {
                    var resultList = result.result().list();

                    Context.setCollection(resultList);

                    var pps = dvm ? _.reduce(dvm.parameters, function (memo, parm) {
                        return memo + parm.value + "-";
                    }, "") : "";

                    resultParm = "resultCollection=" + $routeParams.action + pps;
                    actionParm = show ? "&action=" + $routeParams.action : "";
                }
                $location.search(resultParm + actionParm);
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
                        $scope.dialogTemplate = svrPath + "Content/partials/dialog.html";
                        $scope.dialog = ViewModelFactory.dialogViewModel(action, function (dvm, show) {
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
                                        var error = errorMap.valuesMap()[parm.id];

                                        if (error) {
                                            parm.value = error.value.toValueString();
                                            parm.error = error.invalidReason;
                                        }
                                    });

                                    dvm.error = errorMap.invalidReason();
                                } else if (error instanceof Spiro.ErrorRepresentation) {
                                    var errorRep = error;
                                    var evm = ViewModelFactory.errorViewModel(errorRep);
                                    $scope.error = evm;

                                    $scope.dialogTemplate = svrPath + "Content/partials/error.html";
                                } else {
                                    dvm.error = error;
                                }
                            });
                        });
                    }
                }, function (error) {
                    setError(error);
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
                        setError(error);
                    }
                });
            };

            function handleNestedObject(object, $scope) {
                $scope.result = ViewModelFactory.domainObjectViewModel(object);
                $scope.nestedTemplate = svrPath + "Content/partials/nestedObject.html";
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
                    setError(error);
                });
            };

            this.handleCollectionItem = function ($scope) {
                var collectionItemTypeKey = $routeParams.collectionItem.split("/");
                var collectionItemType = collectionItemTypeKey[0];
                var collectionItemKey = collectionItemTypeKey[1];

                Context.getNestedObject(collectionItemType, collectionItemKey).then(function (object) {
                    handleNestedObject(object, $scope);
                }, function (error) {
                    setError(error);
                });
            };

            this.handleServices = function ($scope) {
                Context.getServices().then(function (services) {
                    $scope.services = ViewModelFactory.servicesViewModel(services);
                    Context.setObject(null);
                    Context.setNestedObject(null);
                }, function (error) {
                    setError(error);
                });
            };

            this.handleService = function ($scope) {
                Context.getObject($routeParams.sid).then(function (service) {
                    $scope.object = ViewModelFactory.serviceViewModel(service);
                }, function (error) {
                    setError(error);
                });
            };

            this.handleResult = function ($scope) {
                var result = $routeParams.resultObject.split("-");
                var dt = result[0];
                var id = result[1];

                Context.getNestedObject(dt, id).then(function (object) {
                    $scope.result = ViewModelFactory.domainObjectViewModel(object);
                    $scope.nestedTemplate = svrPath + "Content/partials/nestedObject.html";
                    Context.setNestedObject(object);
                }, function (error) {
                    setError(error);
                });
            };

            this.handleError = function ($scope) {
                var error = Context.getError();
                if (error) {
                    var evm = ViewModelFactory.errorViewModel(error);
                    $scope.error = evm;
                    $scope.errorTemplate = svrPath + "Content/partials/error.html";
                }
            };

            this.handleAppBar = function ($scope) {
                $scope.appBar = {};

                $scope.appBar.template = svrPath + "Content/partials/appbar.html";

                $scope.appBar.goHome = "#/";

                $scope.appBar.goBack = function () {
                    parent.history.back();
                };

                $scope.appBar.goForward = function () {
                    parent.history.forward();
                };

                $scope.appBar.hideEdit = true;

                if ($routeParams.dt && $routeParams.id) {
                    Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                        $scope.appBar.hideEdit = !(object) || $routeParams.editMode || false;

                        $scope.appBar.doEdit = "#" + $location.path() + "?editMode=true";
                    });
                }
            };

            this.handleObject = function ($scope) {
                Context.getObject($routeParams.dt, $routeParams.id).then(function (object) {
                    Context.setNestedObject(null);
                    $scope.actionTemplate = $routeParams.editMode ? "" : svrPath + "Content/partials/actions.html";
                    $scope.propertiesTemplate = svrPath + ($routeParams.editMode ? "Content/partials/editProperties.html" : "Content/partials/viewProperties.html");

                    $scope.object = ViewModelFactory.domainObjectViewModel(object, function (ovm) {
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
                                    var error = errorMap.valuesMap()[property.id];

                                    if (error) {
                                        property.value = error.value.toValueString();
                                        property.error = error.invalidReason;
                                    }
                                });

                                ovm.message = errorMap.invalidReason();
                            } else if (error instanceof Spiro.ErrorRepresentation) {
                                var errorRep = error;
                                var evm = ViewModelFactory.errorViewModel(errorRep);
                                $scope.error = evm;

                                $scope.propertiesTemplate = svrPath + "Content/partials/error.html";
                            } else {
                                ovm.message = error;
                            }
                        });
                    });
                }, function (error) {
                    $scope.object = {};
                });
            };
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.angular.app.js.map
