/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.viewmodels.ts" />
/// <reference path="spiro.angular.app.ts" />

module Spiro.Angular {

    

    app.controller('ServicesController', function ($scope, RepresentationLoader: RLInterface, Context: ContextInterface, Handlers:HandlersInterface) {

        Context.getServices().
            then(function (services: DomainServicesRepresentation) {
                $scope.services = ServicesViewModel.create(services); 
                Context.setObject(null);
                Context.setNestedObject(null);
            }, function (error) {
                Handlers.handleError(error); 
            });    
    });

    app.controller('ServiceController', function ($scope, $routeParams, RepresentationLoader: RLInterface, Context: ContextInterface, Handlers: HandlersInterface) {

        Context.getObject($routeParams.sid).
            then(function (service: DomainObjectRepresentation) {
                $scope.object = ServiceViewModel.create(service, $routeParams);          
            }, function (error) {
                Handlers.handleError(error); 
            });
    });

    app.controller('DialogController', function ($routeParams, $scope, Handlers: HandlersInterface) {
        if ($routeParams.action) {
            Handlers.handleActionDialog($scope);
        }
    });

    app.controller('NestedObjectController', function ($scope, $q, $routeParams, $location, RepresentationLoader: RLInterface, Context: ContextInterface, Handlers: HandlersInterface) {

        // action takes priority 
        if ($routeParams.action) {
            Handlers.handleActionResult($scope);
        }
        if ($routeParams.property) {
            Handlers.handleProperty($scope);
        }
        else if ($routeParams.collectionItem) {
            Handlers.handleCollectionItem($scope);
        }
        else if ($routeParams.resultObject) {
            var result = $routeParams.resultObject.split("-");
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

    app.controller('CollectionController', function ($routeParams, $scope, Handlers: HandlersInterface) {
        if ($routeParams.resultCollection) {
             Handlers.handleCollectionResult($scope);
        }
        else if ($routeParams.collection) {
             Handlers.handleCollection($scope);
        }
    });

    app.controller('ObjectController', function ($scope, $routeParams, $location, $cacheFactory,  RepresentationLoader: RLInterface, Context: ContextInterface) {
        Context.getObject($routeParams.dt, $routeParams.id).
            then(function (object: DomainObjectRepresentation) {
               
                Context.setNestedObject(null);
                $scope.actionTemplate = $routeParams.editMode ? "" : "Content/partials/actions.html";
                $scope.propertiesTemplate = $routeParams.editMode ? "Content/partials/editProperties.html" : "Content/partials/viewProperties.html";

                $scope.object = DomainObjectViewModel.create(object, $routeParams, function (ovm: DomainObjectViewModel) {

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

                        }, function (error : any) {

                            if (error instanceof ErrorMap) {
                                var errorMap = <ErrorMap>error;

                                _.each(properties, (property) => {
                                    var error = errorMap.valuesMap()[property.id];

                                    if (error) {
                                        property.value = error.value.toValueString();
                                        property.error = error.invalidReason;
                                    }
                                });

                                ovm.message = errorMap.invalidReason();
                            }
                            else if (error instanceof ErrorRepresentation) {
                                var errorRep = <ErrorRepresentation>error;
                                var evm = ErrorViewModel.create(errorRep);
                                $scope.error = evm;

                                $scope.propertiesTemplate = "Content/partials/error.html";
                            }
                            else {
                                ovm.message = error; 
                            }
                        });
                
                });
            }, function (error) {
                $scope.object = {};
            });
    });

    app.controller('ErrorController', function ($scope, Context: ContextInterface) {
        var error = Context.getError(); 
        if (error) {
            var evm = ErrorViewModel.create(error);
            $scope.error = evm; 
            $scope.errorTemplate = "Content/partials/error.html";
        }
    });


    app.controller('AppBarController', function ($scope, $routeParams, $location, Context : ContextInterface) {

        $scope.appBar = {}; 

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
                    
                    $scope.appBar.hideEdit = !(object) || $routeParams.editMode;

                    // rework to use viewmodel code
                    $scope.appBar.doEdit = "#" + $location.path() + "?editMode=true";
                
                });
        }
    });
}