/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="typings/underscore/underscore-typed.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.viewmodels.ts" />


module Spiro.Angular {

    declare var svrPath: string;

    /* Declare app level module */
    export var app = angular.module('app', ['ngResource']);

    app.config(function ($routeProvider) {
        $routeProvider.
            when('/services', {
                templateUrl: svrPath + 'Content/partials/services.html',
                controller: 'ServicesController'
            }).
            when('/services/:sid', {
                templateUrl: svrPath + 'Content/partials/service.html',
                controller: 'ServiceController'
            }).
            when('/objects/:dt/:id', {
                templateUrl: svrPath + 'Content/partials/object.html',
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
        populate: (m: HateoasModel, ignoreCache?: bool, r?: HateoasModel) => ng.IPromise;
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

    function getData(model: HateoasModel): Object {

        var data = {};

        if (model.method === "POST" || model.method === "PUT") {
            data = _.clone((<any>model).attributes);
        }

        return data;
    }

    export interface VMFInterface {
        errorViewModel(errorRep: ErrorRepresentation): ErrorViewModel;
        linkViewModel(linkRep: Link): LinkViewModel;
        itemViewModel(linkRep: Link, parentHref: string, index: number): ItemViewModel;
        parameterViewModel(parmRep: Parameter, id: string): ParameterViewModel;
        actionViewModel(actionRep: ActionMember): ActionViewModel;
        dialogViewModel(actionRep: ActionRepresentation, invoke: (dvm: DialogViewModel, show: boolean) => void ): DialogViewModel;
        propertyViewModel(propertyRep: PropertyMember, id: string): PropertyViewModel;
        collectionViewModel(collection: CollectionMember): CollectionViewModel;
        collectionViewModel(collection: CollectionRepresentation): CollectionViewModel;
        collectionViewModel(collection: ListRepresentation): CollectionViewModel;
        servicesViewModel(servicesRep: DomainServicesRepresentation): ServicesViewModel;
        serviceViewModel(serviceRep: DomainObjectRepresentation): ServiceViewModel;
        domainObjectViewModel(objectRep: DomainObjectRepresentation, save?: (ovm: DomainObjectViewModel) => void ): DomainObjectViewModel;

    }

    app.service('ViewModelFactory', function ($routeParams, $location) {

        this.errorViewModel = function (errorRep: ErrorRepresentation) {
            return ErrorViewModel.create(errorRep);
        };

        this.linkViewModel = function (linkRep: Link) {
            return LinkViewModel.create(linkRep);
        };

        this.itemViewModel = function (linkRep: Link, parentHref: string, index: number) {
            return ItemViewModel.create(linkRep, parentHref, index, $routeParams);
        };

        this.parameterViewModel = function (parmRep: Parameter, id: string) {
            return ParameterViewModel.create(parmRep, id);
        };

        this.actionViewModel = function (actionRep: ActionMember) {
            return ActionViewModel.create(actionRep, $routeParams);
        };

        this.dialogViewModel = function (actionRep: ActionRepresentation, invoke: (dvm: DialogViewModel, show: boolean) => void ) {
            return DialogViewModel.create(actionRep, $routeParams, invoke);
        };

        this.propertyViewModel = function (propertyRep: PropertyMember, id: string) {
            return PropertyViewModel.create(propertyRep, id, $routeParams);
        };

        this.collectionViewModel = function (collection) {
            if (collection instanceof CollectionMember) {
                return CollectionViewModel.create(<CollectionMember>collection, $routeParams);
            }
            if (collection instanceof CollectionRepresentation) {
                return CollectionViewModel.createFromDetails(<CollectionRepresentation>collection, $routeParams);
            }
            if (collection instanceof ListRepresentation) {
                return CollectionViewModel.createFromList(<ListRepresentation>collection, $routeParams, $location);
            }
            return null;
        };

        this.servicesViewModel = function (servicesRep: DomainServicesRepresentation) {
            return ServicesViewModel.create(servicesRep);
        };

        this.serviceViewModel = function (serviceRep: DomainObjectRepresentation) {
            return ServiceViewModel.create(serviceRep, $routeParams);
        };

        this.domainObjectViewModel = function (objectRep: DomainObjectRepresentation, save?: (ovm: DomainObjectViewModel) => void ) {
            return DomainObjectViewModel.create(objectRep, $routeParams, save);
        };

    });

    // TODO investigate using transformations to transform results 
    app.service("RepresentationLoader", function ($http, $q) {
        this.populate = function (model: HateoasModel, ignoreCache?: bool, expected?: HateoasModel) {

            var response = expected || model;
            var useCache = !ignoreCache;

            var delay = $q.defer();

            var config = {
                url: getUrl(model),
                method: model.method,
                cache: useCache,
                data: getData(model)
            };

            $http(config).
                success(function (data, status, headers, config) {
                    (<any>response).attributes = data; // TODO make typed 
                    delay.resolve(response);
                }).
                error(function (data, status, headers, config) {

                    if (status === 500) {
                        var error = new ErrorRepresentation(data);
                        delay.reject(error);
                    }
                    else if (status === 400 || status === 422) {
                        var errorMap = new ErrorMap(data, status, headers().warning);
                        delay.reject(errorMap);
                    }
                    else {
                        delay.reject(headers().warning);
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
        };

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
        };


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
        };

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
        };

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
        };

        this.setObject = function (co) {
            currentObject = co;
        };

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
        };

        this.setNestedObject = function (cno) {
            currentNestedObject = cno;
        };

        var currentError: ErrorRepresentation = null;

        this.getError = function () {
            return currentError;
        };

        this.setError = function (e: ErrorRepresentation) {
            currentError = e;
        };

        var currentCollection: ListRepresentation = null;

        this.getCollection = function () {
            var delay = $q.defer();
            delay.resolve(currentCollection);
            return delay.promise;
        };

        this.setCollection = function (c: ListRepresentation) {
            currentCollection = c;
        };

    });

    export interface HandlersInterface {
        handleCollectionResult($scope): void;
        handleCollection($scope): void;
        handleActionDialog($scope): void;
        handleActionResult($scope): void;
        handleProperty($scope): void;
        handleCollectionItem($scope): void;
        handleError(error: any): void;
        handleServices($scope): void;
        handleService($scope): void;
        handleResult($scope): void;
        handleObject($scope): void;
        handleAppBar($scope): void;
    }

    // TODO rename 
    app.service("Handlers", function ($routeParams, $location, $q, $cacheFactory, RepresentationLoader: RLInterface, Context: ContextInterface, ViewModelFactory: VMFInterface) {
        
        var handlers = this; 

        // tested
        this.handleCollectionResult = function ($scope) {
            Context.getCollection().
                then(function (list: ListRepresentation) {
                    $scope.collection = ViewModelFactory.collectionViewModel(list);
                    $scope.collectionTemplate = svrPath + "Content/partials/nestedCollection.html";
                }, function (error) {
                    setError(error);
                });
        };

        // tested
        this.handleCollection = function ($scope) {
            Context.getObject($routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {
                    var collectionDetails = object.collectionMember($routeParams.collection).getDetails();
                    return RepresentationLoader.populate(collectionDetails);
                }).
                then(function (details: CollectionRepresentation) {
                    $scope.collection = ViewModelFactory.collectionViewModel(details);
                    $scope.collectionTemplate = svrPath + "Content/partials/nestedCollection.html";
                }, function (error) {
                    setError(error);
                });
        };

        // tested
        this.handleActionDialog = function ($scope) {
            Context.getObject($routeParams.sid || $routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {
                    var actionTarget = object.actionMember($routeParams.action).getDetails();
                    return RepresentationLoader.populate(actionTarget);
                }).
                then(function (action: ActionRepresentation) {
                    if (action.extensions().hasParams) {
                        $scope.dialogTemplate = svrPath + "Content/partials/dialog.html";
                        $scope.dialog = ViewModelFactory.dialogViewModel(action, <(dvm: DialogViewModel, show: boolean) => void > _.partial(handlers.invokeAction, $scope, action));
                    }
                }, function (error) {
                    setError(error);
                });
        };

        // tested
        this.handleActionResult = function ($scope) {
            Context.getObject($routeParams.sid || $routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {
                    var action = object.actionMember($routeParams.action);

                    if (action.extensions().hasParams) {
                        var delay = $q.defer();
                        delay.reject();
                        return delay.promise;
                    }
                    var actionTarget = action.getDetails();
                    return RepresentationLoader.populate(actionTarget);
                }).
                then(function (action: ActionRepresentation) {
                    var result = action.getInvoke();
                    return RepresentationLoader.populate(result, true);
                }).
                then(function (result: ActionResultRepresentation) {
                    handlers.setResult(result);
                }, function (error) {
                    if (error) {
                        setError(error);
                    }
                    // otherwise just action with parms 
                });
        };
        
        // tested
        this.handleProperty = function ($scope) {
            Context.getObject($routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {
                    var propertyDetails = object.propertyMember($routeParams.property).getDetails();
                    return RepresentationLoader.populate(propertyDetails);
                }).
                then(function (details: PropertyRepresentation) {
                    var target = details.value().link().getTarget();
                    return RepresentationLoader.populate(target);
                }).
                then(function (object: DomainObjectRepresentation) {
                    setNestedObject(object, $scope);
                }, function (error) {
                    setError(error);
                });
        };

        //tested
        this.handleCollectionItem = function ($scope) {
            var collectionItemTypeKey = $routeParams.collectionItem.split("/");
            var collectionItemType = collectionItemTypeKey[0];
            var collectionItemKey = collectionItemTypeKey[1];

            Context.getNestedObject(collectionItemType, collectionItemKey).
                then(function (object: DomainObjectRepresentation) {
                    setNestedObject(object, $scope);
                }, function (error) {
                    setError(error);
                });
        };

        // tested
        this.handleServices = function ($scope) {
            Context.getServices().
                then(function (services: DomainServicesRepresentation) {
                    $scope.services = ViewModelFactory.servicesViewModel(services);
                    Context.setObject(null);
                    Context.setNestedObject(null);
                }, function (error) {
                    setError(error);
                });

        };

        // tested
        this.handleService = function ($scope) {
            Context.getObject($routeParams.sid).
                then(function (service: DomainObjectRepresentation) {
                    $scope.object = ViewModelFactory.serviceViewModel(service);
                }, function (error) {
                    setError(error);
                });

        };

        // tested
        this.handleResult = function ($scope) {
            var result = $routeParams.resultObject.split("-");
            var dt = result[0];
            var id = result[1];

            Context.getNestedObject(dt, id).
                then(function (object: DomainObjectRepresentation) {
                    $scope.result = ViewModelFactory.domainObjectViewModel(object); // todo rename result
                    $scope.nestedTemplate = svrPath + "Content/partials/nestedObject.html";
                    Context.setNestedObject(object);
                }, function (error) {
                    setError(error);
                });

        };

        // tested
        this.handleError = function ($scope) {
            var error = Context.getError();
            if (error) {
                var evm = ViewModelFactory.errorViewModel(error);
                $scope.error = evm;
                $scope.errorTemplate = svrPath + "Content/partials/error.html";
            }
        };

        // tested
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

            // TODO create appbar viewmodel 

            if ($routeParams.dt && $routeParams.id) {
                Context.getObject($routeParams.dt, $routeParams.id).
                    then(function (object: DomainObjectRepresentation) {

                        $scope.appBar.hideEdit = !(object) || $routeParams.editMode || false;

                        // rework to use viewmodel code
                        $scope.appBar.doEdit = "#" + $location.path() + "?editMode=true";

                    });
            }
        };

        //tested
        this.handleObject = function ($scope) {
            Context.getObject($routeParams.dt, $routeParams.id).
                then(function (object: DomainObjectRepresentation) {

                    Context.setNestedObject(null);
                    $scope.actionTemplate = $routeParams.editMode ? "" : svrPath + "Content/partials/actions.html";
                    $scope.propertiesTemplate = svrPath + ($routeParams.editMode ? "Content/partials/editProperties.html" : "Content/partials/viewProperties.html");

                    $scope.object = ViewModelFactory.domainObjectViewModel(object, <(ovm: DomainObjectViewModel) => void > _.partial(updateObject, $scope, object));
                }, function (error) {
                    setError(error);
                });

        };

        // helper functions 

        function setNestedObject(object: DomainObjectRepresentation, $scope) {
            $scope.result = ViewModelFactory.domainObjectViewModel(object); // todo rename result
            $scope.nestedTemplate = svrPath + "Content/partials/nestedObject.html";
            Context.setNestedObject(object);
        }

        // expose for testing 

        this.setResult = function (result: ActionResultRepresentation, dvm?: DialogViewModel, show?: boolean) {
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

                // set the nested object here and then update the url. That should reload the page but pick up this object 
                // so we don't hit the server again. 
                Context.setNestedObject(resultObject);

                resultParm = "resultObject=" + resultObject.domainType() + "-" + resultObject.instanceId();  // todo add some parm handling code 
                actionParm = show ? "&action=" + $routeParams.action : "";
            }

            if (result.resultType() === "list") {
                var resultList = result.result().list();

                Context.setCollection(resultList);

                var pps = dvm ? _.reduce(dvm.parameters, (memo, parm) => { return memo + parm.value + "-"; }, "") : "";

                resultParm = "resultCollection=" + $routeParams.action + pps;  // todo add some parm handling code 
                actionParm = show ? "&action=" + $routeParams.action : "";
            }
            $location.search(resultParm + actionParm);
        };

        this.invokeAction = function ($scope, action: Spiro.ActionRepresentation, dvm: DialogViewModel, show: boolean) {
            dvm.clearErrors();

            var invoke = action.getInvoke();
            invoke.attributes = {}; // todo make automatic 

            var parameters = dvm.parameters;
            _.each(parameters, (parm) => invoke.setParameter(parm.id, new Value(parm.value || "")));

            RepresentationLoader.populate(invoke, true).
                then(function (result: ActionResultRepresentation) {
                    handlers.setResult(result, dvm, show);
                }, function (error: any) {

                    if (error instanceof ErrorMap) {
                        var errorMap = <ErrorMap>error;

                        _.each(parameters, (parm) => {
                            var errorValue = errorMap.valuesMap()[parm.id];

                            if (errorValue) {
                                parm.value = errorValue.value.toValueString();
                                parm.error = errorValue.invalidReason;
                            }
                        });

                        dvm.error = errorMap.invalidReason();
                    }
                    else if (error instanceof ErrorRepresentation) {
                        var errorRep = <ErrorRepresentation>error;
                        var evm = ViewModelFactory.errorViewModel(errorRep);
                        $scope.error = evm;
                        $scope.dialogTemplate = svrPath + "Content/partials/error.html";
                    }
                    else {
                        dvm.error = error;
                    }
                });
        };

        function setError(error) {

            var errorRep: ErrorRepresentation;
            if (error instanceof ErrorRepresentation) {
                errorRep = <ErrorRepresentation>error;
            }
            else {
                errorRep = new ErrorRepresentation({ message: "an unrecognised error has occurred" });
            }
            Context.setError(errorRep);
        }

        function updateObject($scope, object: DomainObjectRepresentation, ovm: DomainObjectViewModel) {
            var update = object.getUpdateMap();

            var properties = _.filter(ovm.properties, (property) => property.isEditable);
            _.each(properties, (property) => update.setProperty(property.id, property.getValue()));

            RepresentationLoader.populate(update, true, new DomainObjectRepresentation()).
                then(function (updatedObject: DomainObjectRepresentation) {

                    // This is a kludge because updated object has no self link.
                    var rawLinks = (<any>object).get("links");
                    (<any>updatedObject).set("links", rawLinks);

                    // remove pre-changed object from cache
                    $cacheFactory.get('$http').remove(updatedObject.url());

                    Context.setObject(updatedObject);

                    $location.search("");

                }, function (error: any) {

                    if (error instanceof ErrorMap) {
                        var errorMap = <ErrorMap>error;

                        _.each(properties, (property) => {
                            var errorValue = errorMap.valuesMap()[property.id];

                            if (errorValue) {
                                property.value = errorValue.value.toValueString();
                                property.error = errorValue.invalidReason;
                            }
                        });

                        ovm.message = errorMap.invalidReason();
                    }
                    else if (error instanceof ErrorRepresentation) {
                        var errorRep = <ErrorRepresentation>error;
                        var evm = ViewModelFactory.errorViewModel(errorRep);
                        $scope.error = evm;

                        $scope.propertiesTemplate = svrPath + "Content/partials/error.html";
                    }
                    else {
                        ovm.message = error;
                    }
                });
        }

    
    });
}