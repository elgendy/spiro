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
        populate: (m: HateoasModel, ignoreCache?: bool) => ng.IPromise;
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
            return sid ? sid === type : (object.domainType() == type && object.instanceId() === id);
        }

        this.getDomainObject = function (type: string, id: string) {
            
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

    export interface HandlersInterface {
        handleCollectionResult($scope):  void;
        handleCollection($scope):  void;
        handleActionDialog($scope):  void;
        handleActionResult($scope):  void;
        handleProperty($scope):  void;
        handleCollectionItem($scope):  void;
        handleError(error: any): void;
    }

    // TODO rename 
    app.service("Handlers", function ($routeParams, $location, $q, RepresentationLoader: RLInterface, Context: ContextInterface) {
        this.handleError = function (error) {

            var errorRep: ErrorRepresentation;
            if (error instanceof ErrorRepresentation) {
                errorRep = <ErrorRepresentation>error;
            }
            else {
                errorRep = new ErrorRepresentation({ message: "an unrecognised error has occurred" });
            }
            Context.setError(errorRep);
        }
        
        this.handleCollectionResult = function ($scope) {

            Context.getCollection().
                then(function (list: ListRepresentation) {
                    $scope.collection = CollectionViewModel.createFromList(list, $routeParams, $location);
                    $scope.collectionTemplate = "Content/partials/nestedCollection.html";
                }, function (error) {
                    this.handleError(error);
                });
        }

        this.handleCollection = function ($scope) {

            Context.getObject($routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {

                    var collections: { key: string; value: CollectionMember }[] = _.map(object.collectionMembers(), (value, key) => {
                        return { key: key, value: value };
                    });
                    var collection = _.find(collections, (kvp) => { return kvp.key === $routeParams.collection; });
                    var collectionDetails = collection.value.getDetails();
                return RepresentationLoader.populate(collectionDetails)
            }).
                then(function (details: CollectionRepresentation) {
                    $scope.collection = CollectionViewModel.createFromDetails(details, $routeParams);
                    $scope.collectionTemplate = "Content/partials/nestedCollection.html";
                }, function (error) {
                    this.handleError(error);
                });
        }

        function handleResult(result: ActionResultRepresentation, dvm?: DialogViewModel, show?: boolean) {
            if (result.result().isNull()) {
                if (dvm) {
                    dvm.error = "no result found";
                }
                return;
            }

            if (result.resultType() === "object") {
                var resultObject = result.result().object();

                // set the nested object here and then update the url. That should reload the page but pick up this object 
                // so we don't hit the server again. 
                Context.setNestedObject(resultObject);

                var resultParm = "resultObject=" + resultObject.domainType() + "-" + resultObject.instanceId();  // todo add some parm handling code 
                var actionParm = show ? "&action=" + $routeParams.action : "";

                $location.search(resultParm + actionParm);
            }

            if (result.resultType() === "list") {
                var resultList = result.result().list();

                Context.setCollection(resultList);

                var pps = dvm ? _.reduce(dvm.parameters, (memo, parm) => { return memo + parm.value + "-"; }, "") : "";

                var resultParm = "resultCollection=" + $routeParams.action + pps;  // todo add some parm handling code 
                var actionParm = show ? "&action=" + $routeParams.action : "";

                $location.search(resultParm + actionParm);
            }

        }

        this.handleActionDialog = function ($scope) {
            Context.getObject($routeParams.sid || $routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {

                    var actions: { key: string; value: ActionMember }[] = _.map(object.actionMembers(), (value, key) => {
                        return { key: key, value: value };
                    });
                    var action = _.find(actions, (kvp) => { return kvp.key === $routeParams.action; });
                    var actionTarget = action.value.getDetails();

                    return RepresentationLoader.populate(actionTarget);
                }).
                then(function (action: ActionRepresentation) {
                    if (action.extensions().hasParams) {
                        
                        $scope.dialogTemplate = "Content/partials/dialog.html";
                        $scope.dialog = DialogViewModel.create(action, $routeParams, function (dvm: DialogViewModel, show: boolean) {
                            dvm.clearErrors();

                            var invoke = action.getInvoke();
                            invoke.attributes = {}; // todo make automatic 

                            var parameters = dvm.parameters;
                            _.each(parameters, (parm) => invoke.setParameter(parm.id, new Value(parm.value || "")));

                            RepresentationLoader.populate(invoke, true).
                                then(function (result: ActionResultRepresentation) {
                                    handleResult(result, dvm, show);
                                }, function (error: HateoasModelBase) {

                                    if (error instanceof ErrorMap) {
                                        var errorMap = <ErrorMap>error;

                                        _.each(parameters, (parm) => {
                                            var error = errorMap.values()[parm.id];

                                            if (error) {
                                                parm.value = error.value.toValueString();
                                                parm.error = error.invalidReason;
                                            }
                                        });

                                        dvm.error = errorMap.invalidReason();
                                    }
                                    else if (error instanceof ErrorRepresentation) {
                                        var errorRep = <ErrorRepresentation>error;
                                        var evm = ErrorViewModel.create(errorRep);
                                        $scope.error = evm;

                                        $scope.dialogTemplate = "Content/partials/error.html";
                                    }
                                });
                        });
                    }
                }, function (error) {
                    this.handleError(error);
                });
        }


        this.handleActionResult = function ($scope) {
            Context.getObject($routeParams.sid || $routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {

                    var actions: { key: string; value: ActionMember }[] = _.map(object.actionMembers(), (value, key) => {
                        return { key: key, value: value };
                    });
                    var action = _.find(actions, (kvp) => { return kvp.key === $routeParams.action; });

                    if (action.value.extensions().hasParams) {
                        var delay = $q.defer();
                        delay.reject();
                        return delay.promise;
                    }
                    var actionTarget = action.value.getDetails();
                    return RepresentationLoader.populate(actionTarget);
                }).
                then(function (action: ActionRepresentation) {
                    var result = action.getInvoke();
                    return RepresentationLoader.populate(result, true);
                }).
                then(function (result: ActionResultRepresentation) {
                    handleResult(result);
                }, function (error) {
                    if (error) {
                        this.handleError(error);
                    }
                    // otherwise just action with parms 
                });
        }

        function handleNestedObject(object: DomainObjectRepresentation, $scope) {
            
            $scope.result = DomainObjectViewModel.create(object, $routeParams); // todo rename result
            $scope.nestedTemplate = "Content/partials/nestedObject.html";
            Context.setNestedObject(object);
        }

        this.handleProperty = function ($scope) {
            Context.getObject($routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {
                    var properties: { key: string; value: PropertyMember }[] = _.map(object.propertyMembers(), (value, key) => {
                        return { key: key, value: value };
                    });
                    var property = _.find(properties, (kvp) => { return kvp.key === $routeParams.property; });
                    var propertyDetails = property.value.getDetails();
                    return RepresentationLoader.populate(propertyDetails);
                }).
                then(function (details: PropertyRepresentation) {
                    var target = details.value().link().getTarget()
                    return RepresentationLoader.populate(target);
                }).
                then(function (object: DomainObjectRepresentation) {
                    handleNestedObject(object, $scope); 
                }, function (error) {
                    this.handleError(error);
                });
        }

        this.handleCollectionItem = function ($scope) {
            var collectionIndex = $routeParams.collectionItem.split("/");
            var collectionType = collectionIndex[0];
            var collectionKey = collectionIndex[1];

            Context.getNestedObject(collectionType, collectionKey).
                then(function (object: DomainObjectRepresentation) {
                    handleNestedObject(object, $scope); 
                }, function (error) {
                    this.handleError(error);
                });    
        }
    });
}