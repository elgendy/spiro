/// <reference path="../../Scripts/typings/jasmine/jasmine.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../Scripts/spiro.angular.app.ts" />

describe('Controllers', function () {
    var $scope, ctrl;

    beforeEach(module('app'));

    function mockPromise(tgt: Object, func: string, mock: Object) {
       
        var mp: any = {};

        mp.then = (f) => {
            return f(mock);
        };

        spyOn(tgt, func).andReturn(mp); 
    } 


    describe('ErrorController', function () {

        beforeEach(inject(function ($rootScope, $controller, $routeParams, $location, Context: Spiro.Angular.ContextInterface) {
            $scope = $rootScope.$new();

            spyOn(Context, 'getError').andReturn(new Spiro.ErrorRepresentation({ message: "", stacktrace: [] } )); 

            ctrl = $controller('ErrorController', { $scope: $scope, Context: Context });
        }));

    
        it('should set a error data', function () {
            expect($scope.error).toBeDefined();
            expect($scope.errorTemplate).toEqual("Content/partials/error.html");
        });

    });

    describe('AppBarController', function () {

   
        function expectAppBarData() {
            expect($scope.appBar).toBeDefined();
            expect($scope.appBar.goHome).toEqual("#/");
            expect($scope.appBar.template).toEqual("Content/partials/appbar.html");
            expect($scope.appBar.goBack).toBeDefined();
            expect($scope.appBar.goForward).toBeDefined();       
        }

        describe('AppBarController when not viewing an  object', function () {

            beforeEach(inject(function ($rootScope, $controller, $routeParams, $location, Context: Spiro.Angular.ContextInterface) {
                $scope = $rootScope.$new();

                ctrl = $controller('AppBarController', { $scope: $scope, $routeParams: $routeParams, $location: $location, Context: Context });
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
          
                mockPromise(Context, 'getObject', new Spiro.DomainObjectRepresentation()); 

                spyOn($location, 'path').andReturn("aPath"); 

                ctrl = $controller('AppBarController', { $scope: $scope, $routeParams: $routeParams, $location: $location, Context: Context });
            }));

            it('should set appBar data', function () {
                expectAppBarData();
            });

            it('should enable edit button', function () {   
                expect($scope.appBar.hideEdit).toBe(false);
                expect($scope.appBar.doEdit).toEqual("#aPath?editMode=true");
            });
            
        });

    });

    //describe('ObjectController', function () {

    //    beforeEach(inject(function ($rootScope, $controller, $routeParams, $location, $cacheFactory, RepresentationLoader: Spiro.Angular.RLInterface, Context: Spiro.Angular.ContextInterface) {
    //        $scope = $rootScope.$new();
            
    //        $routeParams.dt = "test";
    //        $routeParams.id = "1";
            
    //        mockPromise(Context, 'getObject', new Spiro.DomainObjectRepresentation());

    //        ctrl = $controller('ObjectController', { $scope: $scope, $routeParams: $routeParams, $location: $location, $cacheFactory: $cacheFactory, RepresentationLoader : RepresentationLoader , Context: Context });
    //    }));
       

    //    it('should set the domain object view model', function () {
    //        expect($scope.object).toBeDefined();
    //    });


    //    //in edit mode it sets the action template 

    //    //it sets the properties template
        
    //    //it sets the update callback  




    //});


});