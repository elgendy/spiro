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

    app.controller('ObjectController', function ($scope, $routeParams, $location, RepresentationLoader: RLInterface, Context: ContextInterface) {
        Context.getObject($routeParams.dt, $routeParams.id).
            then(function (object: DomainObjectRepresentation) {
                $scope.object = DomainObjectViewModel.create(object, $routeParams);
                Context.setNestedObject(null);
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