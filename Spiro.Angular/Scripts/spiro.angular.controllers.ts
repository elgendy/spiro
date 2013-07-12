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
                $scope.object = ServiceViewModel.create(service);
                Context.setNestedObject(null);
            }, function (error) {
                $scope.service = {};
            });
    });

    app.controller('ActionController', function ($scope, $routeParams, RepresentationLoader: RLInterface, Context: ContextInterface) {

        Context.getObject($routeParams.sid || $routeParams.dt, $routeParams.id).
            then(function (object: DomainObjectRepresentation) {
         
                $scope.object = object.extensions().isService ? <any>ServiceViewModel.create(object) : DomainObjectViewModel.create(object);
                
                var actions: { key: string; value: ActionMember }[] = _.map(object.actionMembers(), (value, key) => {
                    return { key: key, value: value };
                });
                var action = _.find(actions, (kvp) => { return kvp.key === $routeParams.aid; });
                var actionTarget = action.value.getDetails();

                return RepresentationLoader.populate(actionTarget);
            }).
            then(function (action: ActionRepresentation) {
                if (action.extensions().hasParams) {
                    // dosomething
                    // $scope.dialogTemplate = "Content/partials/dialog.html";

                    // $scope.invoke = function (parms) {
                    // var parm = $scope.parm;
                } else {
                    var result = action.getInvoke();
                    return RepresentationLoader.populate(result, true);
                }
            }).
            then(function (result: ActionResultRepresentation) {
                $scope.result = DomainObjectViewModel.create(result.result().object());
                $scope.nestedTemplate = "Content/partials/nestedObject.html";
                Context.setNestedObject(result.result().object());
            }, function (error) {
                $scope.service = {};
            });
    });

    app.controller('LinkController', function ($scope, $routeParams, $location, RepresentationLoader: RLInterface, Context: ContextInterface) {
        
        Context.getObject($routeParams.dt, $routeParams.id).
            then(function (object: DomainObjectRepresentation) {

                $scope.object = DomainObjectViewModel.create(object);
                
                var properties: { key: string; value: PropertyMember }[] = _.map(object.propertyMembers(), (value, key) => {
                    return { key: key, value: value };
                });
                var property = _.find(properties, (kvp) => { return kvp.key === $routeParams.pid; });
                var propertyDetails = property.value.getDetails();
                return RepresentationLoader.populate(propertyDetails)
            }).
            then(function (details: PropertyRepresentation) {
                var target = details.value().link().getTarget()
                return RepresentationLoader.populate(target);
            }).then(function (object: DomainObjectRepresentation) {
                
                $scope.result = DomainObjectViewModel.create(object); // todo rename result
                $scope.nestedTemplate = "Content/partials/nestedObject.html";
                Context.setNestedObject(object);
            
            }, function (error) {
                $scope.object = {};
            });
    });

    app.controller('CollectionController', function ($scope, $routeParams, $location, RepresentationLoader: RLInterface, Context: ContextInterface) {

        Context.getObject($routeParams.dt, $routeParams.id).
            then(function (object: DomainObjectRepresentation) {

                $scope.object = DomainObjectViewModel.create(object); 

                var collections: { key: string; value: CollectionMember }[] = _.map(object.collectionMembers(), (value, key) => {
                    return { key: key, value: value };
                });
                var collection = _.find(collections, (kvp) => { return kvp.key === $routeParams.cid; });
                var collectionDetails = collection.value.getDetails();
                return RepresentationLoader.populate(collectionDetails)
            }).
            then(function (details: CollectionRepresentation) {
                $scope.collection = CollectionViewModel.createFromDetails(details);
                $scope.collectionTemplate = "Content/partials/nestedCollection.html";
            }, function (error) {
                $scope.collection = {};
            });
    });

    app.controller('ObjectController', function ($scope, $routeParams, $location, RepresentationLoader: RLInterface, Context: ContextInterface) {

        Context.getObject($routeParams.dt, $routeParams.id).
            then(function (object: DomainObjectRepresentation) {
                $scope.object = DomainObjectViewModel.create(object);
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