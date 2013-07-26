/// <reference path="../../Scripts/typings/jasmine/jasmine.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../Scripts/spiro.angular.app.ts" />

describe('Controllers', function () {
    var $scope, ctrl;

    beforeEach(module('app'));

    describe('AppBarController', function () {

        var context; 

        function expectAppBarData() {
            expect($scope.appBar).toBeDefined();
            expect($scope.appBar.goHome).toEqual("#/");
            expect($scope.appBar.template).toEqual("Content/partials/appbar.html");
            expect($scope.appBar.goBack).toBeDefined();
            expect($scope.appBar.goForward).toBeDefined();       
        }


        describe('AppBarController when not viewing an  object', function () {

            beforeEach(inject(function ($rootScope, $controller, $routeParams, $location) {
                $scope = $rootScope.$new();
                context = null;
                ctrl = $controller('AppBarController', { $scope: $scope, $routeParams: $routeParams, $location: $location, Context: context });
            }));

            it('should set appBar data', function () {
                expectAppBarData();   
            });

            it('should disable edit button', function () {
                expect($scope.appBar.hideEdit).toEqual(true);
                expect($scope.appBar.doEdit).toBeUndefined();
            });

        });


        describe('AppBarController when viewing an object', function () {

            beforeEach(inject(function ($rootScope, $controller, $routeParams, $location, Context: Spiro.Angular.ContextInterface) {
                $scope = $rootScope.$new();
              
                $routeParams.dt = "test";
                $routeParams.id = "1"; 

                var mockObject: any = {}; 

                mockObject.serviceId = () => {
                    return "";
                };

                mockObject.domainType = () => {
                    return "test";
                };

                mockObject.instanceId = () => {
                    return "1";
                };

                Context.setObject(mockObject); 

                ctrl = $controller('AppBarController', { $scope: $scope, $routeParams: $routeParams, $location: $location, Context: Context });
            }));

            it('should set appBar data', function () {
                expectAppBarData();
            });

            it('should enable edit button', function () {
               
                //expect($scope.appBar.hideEdit).toEqual(false);
                //expect($scope.appBar.doEdit).toEqual("something");
            });
            
        });

    });
});