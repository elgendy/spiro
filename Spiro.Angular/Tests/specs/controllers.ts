/// <reference path="../../Scripts/typings/jasmine/jasmine.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../Scripts/spiro.angular.app.ts" />

describe('Controllers', function () {
    var $scope, ctrl;

    beforeEach(module('app'));

    describe('ServicesController', function () {

        var handleServices;

        beforeEach(inject(function ($rootScope, $controller, Handlers: Spiro.Angular.HandlersInterface) {
            $scope = $rootScope.$new();
            handleServices = spyOn(Handlers, 'handleServices');
            ctrl = $controller('ServicesController', { $scope: $scope, Handlers: Handlers });
        }));

        it('should call the handler', function () {
            expect(handleServices).toHaveBeenCalledWith($scope);
        });

    });

    describe('ServiceController', function () {

        var handleService;

        beforeEach(inject(function ($rootScope, $controller, Handlers: Spiro.Angular.HandlersInterface) {
            $scope = $rootScope.$new();
            handleService = spyOn(Handlers, 'handleService');
            ctrl = $controller('ServiceController', { $scope: $scope, Handlers: Handlers });
        }));

        it('should call the handler', function () {
            expect(handleService).toHaveBeenCalledWith($scope);
        });

    });

    describe('ObjectController', function () {

        var handleObject;

        beforeEach(inject(function ($rootScope, $controller, Handlers: Spiro.Angular.HandlersInterface) {
            $scope = $rootScope.$new();
            handleObject = spyOn(Handlers, 'handleObject');
            ctrl = $controller('ObjectController', { $scope: $scope, Handlers: Handlers });
        }));

        it('should call the handler', function () {
            expect(handleObject).toHaveBeenCalledWith($scope);
        });

    });


    describe('DialogController', function () {

        var handleActionDialog;

        beforeEach(inject(function ($rootScope, Handlers: Spiro.Angular.HandlersInterface) {
            $scope = $rootScope.$new();
            handleActionDialog = spyOn(Handlers, 'handleActionDialog');    
        }));


        describe('if action parm set', function () {
            
            beforeEach(inject(function ($routeParams, $controller, Handlers: Spiro.Angular.HandlersInterface) {
                $routeParams.action = "test";            
                ctrl = $controller('DialogController', { $scope: $scope, Handlers: Handlers });
            }));

            it('should call the handler', function () {
                expect(handleActionDialog).toHaveBeenCalledWith($scope);
            });
        });

        describe('if action parm not set', function () {
          
            beforeEach(inject(function ($controller, Handlers: Spiro.Angular.HandlersInterface) {                
                ctrl = $controller('DialogController', { $scope: $scope, Handlers: Handlers });
            }));

            it('should not call the handler', function () {
                expect(handleActionDialog).wasNotCalled();
            });

        });
    });

    describe('NestedObjectController', function () {

        var handleActionResult;
        var handleProperty;
        var handleCollectionItem;
        var handleResult;

        beforeEach(inject(function ($rootScope, Handlers: Spiro.Angular.HandlersInterface) {
            $scope = $rootScope.$new();
            handleActionResult = spyOn(Handlers, 'handleActionResult');
            handleProperty = spyOn(Handlers, 'handleProperty');
            handleCollectionItem = spyOn(Handlers, 'handleCollectionItem');
            handleResult = spyOn(Handlers, 'handleResult');
        }));


        describe('if action parm set', function () {

            beforeEach(inject(function ($routeParams, $controller, Handlers: Spiro.Angular.HandlersInterface) {
                $routeParams.action = "test";
                ctrl = $controller('NestedObjectController', { $scope: $scope, Handlers: Handlers });
            }));

            it('should call the action handler only', function () {
                expect(handleActionResult).toHaveBeenCalledWith($scope);
                expect(handleProperty).wasNotCalled();
                expect(handleCollectionItem).wasNotCalled();
                expect(handleResult).wasNotCalled();
            });
        });

        describe('if property parm set', function () {
            
            beforeEach(inject(function ($routeParams, $controller, Handlers: Spiro.Angular.HandlersInterface) {
                $routeParams.property = "test";
                ctrl = $controller('NestedObjectController', { $scope: $scope, Handlers: Handlers });
            }));

            it('should call the property handler only', function () {
                expect(handleActionResult).wasNotCalled();
                expect(handleProperty).toHaveBeenCalledWith($scope);
                expect(handleCollectionItem).wasNotCalled();
                expect(handleResult).wasNotCalled();
            });

        });

        describe('if collection Item parm set', function () {

            beforeEach(inject(function ($routeParams, $controller, Handlers: Spiro.Angular.HandlersInterface) {
                $routeParams.collectionItem = "test";
                ctrl = $controller('NestedObjectController', { $scope: $scope, Handlers: Handlers });
            }));

            it('should call the collection item handler only', function () {
                expect(handleActionResult).wasNotCalled();
                expect(handleProperty).wasNotCalled();
                expect(handleCollectionItem).toHaveBeenCalledWith($scope);
                expect(handleResult).wasNotCalled();
            });

        });

        describe('if result object parm set', function () {

            beforeEach(inject(function ($routeParams, $controller, Handlers: Spiro.Angular.HandlersInterface) {
                $routeParams.resultObject = "test";
                ctrl = $controller('NestedObjectController', { $scope: $scope, Handlers: Handlers });
            }));

            it('should call the result object handler only', function () {
                expect(handleActionResult).wasNotCalled();
                expect(handleProperty).wasNotCalled();
                expect(handleCollectionItem).wasNotCalled();
                expect(handleResult).toHaveBeenCalledWith($scope);
            });
        });

        describe('if all parms set', function () {

            beforeEach(inject(function ($routeParams, $controller, Handlers: Spiro.Angular.HandlersInterface) {
                $routeParams.action = "test";
                $routeParams.property = "test";
                $routeParams.collectionItem = "test";
                $routeParams.resultObject = "test";
                ctrl = $controller('NestedObjectController', { $scope: $scope, Handlers: Handlers });
            }));

            it('should call the action and property handler only', function () {
                expect(handleActionResult).toHaveBeenCalledWith($scope);
                expect(handleProperty).toHaveBeenCalledWith($scope);
                expect(handleCollectionItem).wasNotCalled();
                expect(handleResult).wasNotCalled();
            });
        });

        describe('if no parms set', function () {

            beforeEach(inject(function ($routeParams, $controller, Handlers: Spiro.Angular.HandlersInterface) {
                ctrl = $controller('NestedObjectController', { $scope: $scope, Handlers: Handlers });
            }));

            it('should call no handlers', function () {
                expect(handleActionResult).wasNotCalled();
                expect(handleProperty).wasNotCalled();
                expect(handleCollectionItem).wasNotCalled();
                expect(handleResult).wasNotCalled();
            });
        });

    });

    describe('CollectionController', function () {

        var handleCollectionResult;
        var handleCollection;

        beforeEach(inject(function ($rootScope, Handlers: Spiro.Angular.HandlersInterface) {
            $scope = $rootScope.$new();
            handleCollectionResult = spyOn(Handlers, 'handleCollectionResult');
            handleCollection = spyOn(Handlers, 'handleCollection');
        }));


        describe('if result collection parm set', function () {

            beforeEach(inject(function ($routeParams, $controller, Handlers: Spiro.Angular.HandlersInterface) {
                $routeParams.resultCollection = "test";
                ctrl = $controller('CollectionController', { $scope: $scope, Handlers: Handlers });
            }));

            it('should call the result collection handler', function () {
                expect(handleCollectionResult).toHaveBeenCalledWith($scope);
                expect(handleCollection).wasNotCalled();
            });
        });

        describe('if collection parm set', function () {
            
            beforeEach(inject(function ($routeParams, $controller, Handlers: Spiro.Angular.HandlersInterface) {
                $routeParams.collection = "test";
                ctrl = $controller('CollectionController', { $scope: $scope, Handlers: Handlers });
            }));

            it('should  call the collection handler', function () {
                expect(handleCollectionResult).wasNotCalled();
                expect(handleCollection).toHaveBeenCalledWith($scope);
            });

        });

        describe('if no parms set', function () {

            beforeEach(inject(function ($controller, Handlers: Spiro.Angular.HandlersInterface) {
                ctrl = $controller('CollectionController', { $scope: $scope, Handlers: Handlers });
            }));

            it('should not call the handler', function () {
                expect(handleCollectionResult).wasNotCalled();
                expect(handleCollection).wasNotCalled();
            });

        });

    });

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

        return spyOn(tgt, func).andReturn(mp);
    }

    describe('handleCollectionResult', function () {

        var testObject = new Spiro.ListRepresentation(); 
        var testViewModel = { test: testObject };
        var getCollection; 
        var collectionViewModel; 

        beforeEach(inject(function ($rootScope, Handlers: Spiro.Angular.HandlersInterface, Context: Spiro.Angular.ContextInterface, ViewModelFactory : Spiro.Angular.VMFInterface) {
            $scope = $rootScope.$new();

            getCollection = mockPromise(Context, 'getCollection', testObject);
            collectionViewModel = spyOn(ViewModelFactory, 'collectionViewModel').andReturn(testViewModel);

            Handlers.handleCollectionResult($scope);
        }));


        it('should update the scope', function () {
            expect(getCollection).toHaveBeenCalled();
            expect(collectionViewModel).toHaveBeenCalledWith(testObject); 

            expect($scope.collection).toEqual(testViewModel);
            expect($scope.collectionTemplate).toEqual("Content/partials/nestedCollection.html");
        });

        // TODO handle error ? 

    });

    describe('handleCollection', function () {

        var testObject = new Spiro.DomainObjectRepresentation();
        var testMember = new Spiro.CollectionMember({}, testObject);
        var testDetails = new Spiro.CollectionRepresentation();
        var testViewModel = { test: testObject };

        var getObject;
        var collectionMember;
        var collectionDetails;
        var populate; 
        var collectionViewModel;

        beforeEach(inject(function ($rootScope, $routeParams, Handlers: Spiro.Angular.HandlersInterface, Context: Spiro.Angular.ContextInterface, ViewModelFactory: Spiro.Angular.VMFInterface, RepresentationLoader : Spiro.Angular.RLInterface) {
            $scope = $rootScope.$new();

            getObject = mockPromise(Context, 'getObject', testObject);

            collectionMember = spyOn(testObject, "collectionMember").andReturn(testMember);
            collectionDetails = spyOn(testMember, "getDetails").andReturn(testDetails);  
            populate = mockPromise(RepresentationLoader, "populate", testDetails); 
            collectionViewModel = spyOn(ViewModelFactory, 'collectionViewModel').andReturn(testViewModel);


            $routeParams.dt = "test";
            $routeParams.id = "1";
            $routeParams.collection = "aCollection";        

            Handlers.handleCollection($scope);
        }));


        it('should update the scope', function () {
            expect(getObject).toHaveBeenCalledWith("test", "1");
            expect(collectionMember).toHaveBeenCalledWith("aCollection");
            expect(collectionDetails).toHaveBeenCalled();
            expect(populate).toHaveBeenCalledWith(testDetails);
            expect(collectionViewModel).toHaveBeenCalledWith(testDetails);

            expect($scope.collection).toEqual(testViewModel);
            expect($scope.collectionTemplate).toEqual("Content/partials/nestedCollection.html");
        });

        // TODO handle error ? 

    });




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