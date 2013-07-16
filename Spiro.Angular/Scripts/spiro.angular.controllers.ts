/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.viewmodels.ts" />
/// <reference path="spiro.angular.app.ts" />

module Spiro.Angular {

    app.controller('ServicesController', function ($scope, RepresentationLoader : RLInterface, Context: ContextInterface) {

        Context.getServices().
            then(function (services: DomainServicesRepresentation) {
                $scope.services = ServicesViewModel.create(services); 
                Context.setObject(null);
                Context.setNestedObject(null);
            }, function (error) {
                $scope.services = [];
            });    
    });

    app.controller('ServiceController', function ($scope, $routeParams, RepresentationLoader: RLInterface, Context: ContextInterface) {

        Context.getObject($routeParams.sid).
            then(function (service: DomainObjectRepresentation) {
                $scope.object = ServiceViewModel.create(service, $routeParams);          
            }, function (error) {
                $scope.service = {};
            });
    });

  

    function getActionDialog($scope, $routeParams, $location, RepresentationLoader: RLInterface, Context: ContextInterface) {
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
                    var invoke = action.getInvoke();
                    invoke.attributes = {}; // todo make automatic 
                    $scope.dialogTemplate = "Content/partials/dialog.html";
                    $scope.dialog = DialogViewModel.create(action, $routeParams, function (dvm: DialogViewModel) {
                        var parameters = dvm.parameters;

                        _.each(parameters, (parm) => invoke.setParameter(parm.id, new Value(parm.value || "")));

                        RepresentationLoader.populate(invoke, true).
                            then(function (result: ActionResultRepresentation) {
                                var resultObject = result.result().object()

                                    // set the nested object here and then update the url. That should reload the page but pick up this object 
                                    // so we don't hit the server again. 
                                    Context.setNestedObject(resultObject);

                                if (resultObject) {
                                    var resultParm = "result=" + resultObject.domainType() + "-" + resultObject.instanceId();  // todo add some parm handling code 
                                    $location.search(resultParm);
                                }
                                else {
                                    dvm.error = "no result found";
                                }

                            }, function (errorMap: ErrorMap) {
                                _.each(parameters, (parm) => {
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


    function getActionResult($scope, $routeParams, $location, RepresentationLoader: RLInterface, Context: ContextInterface) {
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
                if (!action.extensions().hasParams) {
                    var result = action.getInvoke();
                    return RepresentationLoader.populate(result, true);
                }
                // how do we fail here 
            }).
            then(function (result: ActionResultRepresentation) {
                var resultObject = result.result().object()

                // set the nested object here and then update the url. That should reload the page but pick up this object 
                // so we don't hit the server again. 
                Context.setNestedObject(resultObject);
                
                var resultParm = "result=" + resultObject.domainType() + "-" + resultObject.instanceId();  // todo add some parm handling code 
                var otherParms = getOtherParms($routeParams, ["property", "collectionItem", "result", "action" ]); 

                $location.search(resultParm + otherParms);
            
            }, function (error) {
                $scope.service = {};
            });
    }


    function getProperty($scope, $routeParams, $location, RepresentationLoader: RLInterface, Context: ContextInterface) {
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

                $scope.result = DomainObjectViewModel.create(object, $routeParams); // todo rename result
                $scope.nestedTemplate = "Content/partials/nestedObject.html";
                Context.setNestedObject(object);
            }, function (error) {
                $scope.object = {};
            }); 
    }

    function getCollectionItem($scope, $routeParams, $location, RepresentationLoader: RLInterface, Context: ContextInterface) {
        var collectionIndex = $routeParams.collectionItem.split("/");
        var collectionName = collectionIndex[0];
        var itemIndex = parseInt(collectionIndex[1]);

        Context.getObject($routeParams.dt, $routeParams.id).
            then(function (object: DomainObjectRepresentation) {

                var collections: { key: string; value: CollectionMember }[] = _.map(object.collectionMembers(), (value, key) => {
                    return { key: key, value: value };
                });
                var collection = _.find(collections, (kvp) => { return kvp.key === collectionName; });
                var collectionDetails = collection.value.getDetails();
                return RepresentationLoader.populate(collectionDetails);
            }).
            then(function (details: CollectionRepresentation) {
                var target = details.value().models[itemIndex].getTarget();
                return RepresentationLoader.populate(target);
            }).
            then(function (object: DomainObjectRepresentation) {
                $scope.result = DomainObjectViewModel.create(object, $routeParams); // todo rename result
                $scope.nestedTemplate = "Content/partials/nestedObject.html";
                Context.setNestedObject(object);
            }, function (error) {
                $scope.object = {};
            });
    
    }

    app.controller('DialogController', function ($scope, $routeParams, $location, RepresentationLoader: RLInterface, Context: ContextInterface) {

        if ($routeParams.action) {
            getActionDialog($scope, $routeParams, $location, RepresentationLoader, Context);
        }
    });


    app.controller('NestedObjectController', function ($scope, $routeParams, $location, RepresentationLoader: RLInterface, Context: ContextInterface) {

        // action takes priority 
        if ($routeParams.action) {
            getActionResult($scope, $routeParams, $location, RepresentationLoader, Context);
        }
        if ($routeParams.property) {
            getProperty($scope, $routeParams, $location, RepresentationLoader, Context);
        }
        else if ($routeParams.collectionItem) {
            getCollectionItem($scope, $routeParams, $location, RepresentationLoader, Context);
        }
        else if ($routeParams.result) {
            var result = $routeParams.result.split("-");
            var dt = result[0];
            var id = result[1]; 

            Context.getNestedObject(dt, id).
                then(function (object: DomainObjectRepresentation) {
                    $scope.result = DomainObjectViewModel.create(object, $routeParams); // todo rename result
                    $scope.nestedTemplate = "Content/partials/nestedObject.html";
                    Context.setNestedObject(object);
                }, function (error) {
                    $scope.object = {};
                });
        }
    });

   
    app.controller('CollectionController', function ($scope, $routeParams, $location, RepresentationLoader: RLInterface, Context: ContextInterface) {

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
                $scope.collection = {};
            });
    });

    app.controller('ObjectController', function ($scope, $routeParams, $location, RepresentationLoader: RLInterface, Context: ContextInterface) {

        Context.getObject($routeParams.dt, $routeParams.id).
            then(function (object: DomainObjectRepresentation) {
                $scope.object = DomainObjectViewModel.create(object, $routeParams);
                Context.setNestedObject(null);
            }, function (error) {
                $scope.object = {};
            });
    });

    app.controller('AppBarController', function ($scope) {

        $scope.goHome = "#/";

        $scope.goBack = function () {
            parent.history.back();
        };
        
        $scope.goForward = function () {
            parent.history.forward();
        };

        $scope.hideEdit = !$scope.object;
    });
}