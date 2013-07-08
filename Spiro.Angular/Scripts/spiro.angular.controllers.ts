/* Controllers */


// todo - 
// change so that raw values are loaded in viewmodels ($scope) - keep all spiro models in the controller code 
// and then change controller code to be typescript. 
// simplfy and merge controller code 
// need to think about correct role/name for these controllers 

// for spiro need to decouple models from backbone 

/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.app.ts" />

module Spiro.Angular {

    app.controller('ServicesController', function ($scope, RoServer) {

        var services = RoServer.getServices();
        
        services.success(function (data, status) {
            $scope.services = new Spiro.DomainServicesRepresentation(data);
        }).error(function (data, status) {
                $scope.services = {};
            });

        $scope.backGroundColor = "bg-color-darkBlue";
        $scope.title = "Services";
    });

    app.controller('ServiceController', function ($scope, $routeParams, RoServer) {

        var service = RoServer.getService($routeParams.sid);

        service.success(function (data, status) {
            $scope.service = new Spiro.DomainObjectRepresentation(data);
        }).error(function (data, status) {
                $scope.service = {};
            });

        if ($routeParams.aid) {

            var actionDetails = RoServer.getAction($routeParams.sid, $routeParams.aid);

            actionDetails.success(function (data, status) {
                var action = new Spiro.ActionRepresentation(data);

                $scope.action = action;

                if (action.extensions().hasParams) {
                    
                    $scope.dialogTemplate = "Content/partials/dialog.html";

                    $scope.invoke = function (parms) {
                        var parm = $scope.parm;


                    };
                } else {
                    
                    var result = RoServer.getResult($routeParams.sid, $routeParams.aid);
                    

                    result.success(function (data, status) {
                        $scope.result = new Spiro.ActionResultRepresentation(data);
                        $scope.nestedTemplate = "Content/partials/nestedObject.html";
                    }).error(function (data, status) {
                            $scope.result = {};
                        });

                }
            }).error(function (data, status) {
                    $scope.object = {};
                });
        }

        $scope.backGroundColor = "bg-color-darkBlue";
        $scope.title = "Services";

        $scope.propertyType = function (property) { return property.isScalar() ? "scalar" : "ref"; };

    });

    app.controller('ObjectController', function ($scope, $routeParams, RoServer) {

        var object = RoServer.getObject($routeParams.dt, $routeParams.id);

        object.success(function (data, status) {
            $scope.object = new Spiro.DomainObjectRepresentation(data);
        }).error(function (data, status) {
                $scope.object = {};
            });

        $scope.propertyType = function (property) { return property.isScalar() ? "scalar" : "ref"; };

        $scope.backGroundColor = "bg-color-darkBlue";
        $scope.title = "Services";
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