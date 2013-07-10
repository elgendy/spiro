/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.viewmodels.ts" />
/// <reference path="spiro.angular.app.ts" />

module Spiro.Angular {

    // inject home by using resolve ?  
    app.controller('ServicesController', function ($scope, RepresentationLoader : RLInterface, Home : ng.IPromise, Context: ContextInterface) {

        Home.
            then(function (home: HomePageRepresentation) {
                var ds = home.getDomainServices();
                return RepresentationLoader.populate(ds); 
            }).
            then(function (services: DomainServicesRepresentation) {
                $scope.services = ServicesViewModel.create(services); 
                Context.setCurrentServices(services);
            }, function (error) {
                $scope.services = [];
            });    
    });

    app.controller('ServiceController', function ($scope, $routeParams, RepresentationLoader: RLInterface, Context: ContextInterface) {
        
        var services = (<DomainServicesRepresentation>Context.getCurrentServices());
        var serviceLink = _.find(services.value().models, (model) => { return model.rel().parms[0] === 'serviceId="' +  $routeParams.sid  +'"'; }); 
        var service = serviceLink.getTarget(); 

        RepresentationLoader.populate(service).then(function (service: DomainObjectRepresentation) {     
            $scope.service = ServiceViewModel.create(service); 
            Context.setCurrentObject(service);
        }, function (error) {
            $scope.service = {};
        });  
    });

    app.controller('ActionController', function ($scope, $routeParams, RepresentationLoader: RLInterface, Context: ContextInterface) {

        var object = (<DomainObjectRepresentation>Context.getCurrentObject());

        if (object.extensions().isService) {     
            $scope.service = ServiceViewModel.create(object);   
            $scope.backGroundColor = "bg-color-darkBlue";         
        };

        var actions: { key: string; value: ActionMember }[] = _.map(object.actionMembers(), (value, key) => {
            return { key: key, value: value };
        });
        var action = _.find(actions, (kvp) => { return kvp.key === $routeParams.aid; });
        var actionTarget = action.value.getDetails();

        RepresentationLoader.populate(actionTarget).then(function (action: ActionRepresentation) {
            if (action.extensions().hasParams) {
                // dosomething
                // $scope.dialogTemplate = "Content/partials/dialog.html";

                // $scope.invoke = function (parms) {
                // var parm = $scope.parm;
            } else {
                var result = action.getInvoke();
                return RepresentationLoader.populate(result);
            }
        }).then(function (result: ActionResultRepresentation) {
           
            $scope.result = DomainObjectViewModel.create(result.result().object()); 
            $scope.nestedTemplate = "Content/partials/nestedObject.html";
            Context.setCurrentNestedObject(result.result().object());

        }, function (error) {
            $scope.service = {};
        });
    });


    app.controller('LinkController', function ($scope, $routeParams, RepresentationLoader: RLInterface, Context: ContextInterface) {

        var object = (<DomainObjectRepresentation>Context.getCurrentNestedObject());

        var properties: { key: string; value: PropertyMember }[] = _.map(object.propertyMembers(), (value, key) => {
            return { key: key, value: value };
        });
        var property = _.find(properties, (kvp) => { return kvp.key === $routeParams.pid; });
        var propertyDetails = property.value.getDetails();

        RepresentationLoader.populate(propertyDetails).then(function (details: PropertyRepresentation) {
            var target = details.value().link().getTarget()
            return RepresentationLoader.populate(target);
        }).then(function (object: DomainObjectRepresentation) {
            $scope.object = DomainObjectViewModel.create(object); 
            Context.setCurrentObject(object); 
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