/// <reference path="../../Scripts/typings/jasmine/jasmine.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../Scripts/spiro.angular.app.ts" />

describe('Controllers', function () {
    var $scope, ctrl;

    beforeEach(module('app'));

    describe('ErrorController', function () {

        var handleError; 

        beforeEach(inject(function ($rootScope, $controller, Handlers: Spiro.Angular.HandlersInterface) {
            $scope = $rootScope.$new();
            handleError = spyOn(Handlers, 'handleError');
            ctrl = $controller('ErrorController', { $scope: $scope, Handlers: Handlers });
        }));

        it('should call the handler', function () {
            expect(handleError).toHaveBeenCalledWith($scope); 
        });

    });

    describe('AppBarController', function () {
        
        var handleAppBar;

        beforeEach(inject(function ($rootScope, $controller, Handlers: Spiro.Angular.HandlersInterface) {
            $scope = $rootScope.$new();
            handleAppBar = spyOn(Handlers, 'handleAppBar');
            ctrl = $controller('AppBarController', { $scope: $scope, Handlers: Handlers });
        }));

        it('should call the handler', function () {
            expect(handleAppBar).toHaveBeenCalledWith($scope);
        });

    });

});

describe('Handlers Service', function () {
    var $scope;

    beforeEach(module('app'));

    function mockPromise(tgt: Object, func: string, mock: Object) {

        var mp: any = {};

        mp.then = (f) => {
            return f(mock);
        };

        spyOn(tgt, func).andReturn(mp);
    }


    describe('handleError', function () {

        beforeEach(inject(function ($rootScope, Handlers: Spiro.Angular.HandlersInterface, Context: Spiro.Angular.ContextInterface) {
            $scope = $rootScope.$new();

            spyOn(Context, 'getError').andReturn(new Spiro.ErrorRepresentation({ message: "", stacktrace: [] }));

            Handlers.handleError($scope);
        }));


        it('should set a error data', function () {
            expect($scope.error).toBeDefined();
            expect($scope.errorTemplate).toEqual("Content/partials/error.html");
        });

    });

    describe('handleAppBar', function () {


        function expectAppBarData() {
            expect($scope.appBar).toBeDefined();
            expect($scope.appBar.goHome).toEqual("#/");
            expect($scope.appBar.template).toEqual("Content/partials/appbar.html");
            expect($scope.appBar.goBack).toBeDefined();
            expect($scope.appBar.goForward).toBeDefined();
        }

        describe('handleAppBar when not viewing an  object', function () {

            beforeEach(inject(function ($rootScope, Handlers: Spiro.Angular.HandlersInterface) {
                $scope = $rootScope.$new();

                Handlers.handleAppBar($scope);
            }));

            it('should set appBar data', function () {
                expectAppBarData();
            });

            it('should disable edit button', function () {
                expect($scope.appBar.hideEdit).toEqual(true);
                expect($scope.appBar.doEdit).toBeUndefined();
            });

        });

        describe('handleAppBar when viewing an object', function () {

            beforeEach(inject(function ($rootScope, $location, $routeParams, Handlers: Spiro.Angular.HandlersInterface, Context: Spiro.Angular.ContextInterface) {
                $scope = $rootScope.$new();

                $routeParams.dt = "test";
                $routeParams.id = "1";

                mockPromise(Context, 'getObject', new Spiro.DomainObjectRepresentation());

                spyOn($location, 'path').andReturn("aPath");

                Handlers.handleAppBar($scope);
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

});