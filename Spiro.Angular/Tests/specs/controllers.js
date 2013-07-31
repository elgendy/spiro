describe('Controllers', function () {
    var $scope, ctrl;

    beforeEach(module('app'));

    describe('ServicesController', function () {
        var handleServices;

        beforeEach(inject(function ($rootScope, $controller, Handlers) {
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

        beforeEach(inject(function ($rootScope, $controller, Handlers) {
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

        beforeEach(inject(function ($rootScope, $controller, Handlers) {
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

        beforeEach(inject(function ($rootScope, Handlers) {
            $scope = $rootScope.$new();
            handleActionDialog = spyOn(Handlers, 'handleActionDialog');
        }));

        describe('if action parm set', function () {
            beforeEach(inject(function ($routeParams, $controller, Handlers) {
                $routeParams.action = "test";
                ctrl = $controller('DialogController', { $scope: $scope, Handlers: Handlers });
            }));

            it('should call the handler', function () {
                expect(handleActionDialog).toHaveBeenCalledWith($scope);
            });
        });

        describe('if action parm not set', function () {
            beforeEach(inject(function ($controller, Handlers) {
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

        beforeEach(inject(function ($rootScope, Handlers) {
            $scope = $rootScope.$new();
            handleActionResult = spyOn(Handlers, 'handleActionResult');
            handleProperty = spyOn(Handlers, 'handleProperty');
            handleCollectionItem = spyOn(Handlers, 'handleCollectionItem');
            handleResult = spyOn(Handlers, 'handleResult');
        }));

        describe('if action parm set', function () {
            beforeEach(inject(function ($routeParams, $controller, Handlers) {
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
            beforeEach(inject(function ($routeParams, $controller, Handlers) {
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
            beforeEach(inject(function ($routeParams, $controller, Handlers) {
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
            beforeEach(inject(function ($routeParams, $controller, Handlers) {
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
            beforeEach(inject(function ($routeParams, $controller, Handlers) {
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
            beforeEach(inject(function ($routeParams, $controller, Handlers) {
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

        beforeEach(inject(function ($rootScope, Handlers) {
            $scope = $rootScope.$new();
            handleCollectionResult = spyOn(Handlers, 'handleCollectionResult');
            handleCollection = spyOn(Handlers, 'handleCollection');
        }));

        describe('if result collection parm set', function () {
            beforeEach(inject(function ($routeParams, $controller, Handlers) {
                $routeParams.resultCollection = "test";
                ctrl = $controller('CollectionController', { $scope: $scope, Handlers: Handlers });
            }));

            it('should call the result collection handler', function () {
                expect(handleCollectionResult).toHaveBeenCalledWith($scope);
                expect(handleCollection).wasNotCalled();
            });
        });

        describe('if collection parm set', function () {
            beforeEach(inject(function ($routeParams, $controller, Handlers) {
                $routeParams.collection = "test";
                ctrl = $controller('CollectionController', { $scope: $scope, Handlers: Handlers });
            }));

            it('should  call the collection handler', function () {
                expect(handleCollectionResult).wasNotCalled();
                expect(handleCollection).toHaveBeenCalledWith($scope);
            });
        });

        describe('if no parms set', function () {
            beforeEach(inject(function ($controller, Handlers) {
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

        beforeEach(inject(function ($rootScope, $controller, Handlers) {
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

        beforeEach(inject(function ($rootScope, $controller, Handlers) {
            $scope = $rootScope.$new();
            handleAppBar = spyOn(Handlers, 'handleAppBar');
            ctrl = $controller('AppBarController', { $scope: $scope, Handlers: Handlers });
        }));

        it('should call the handler', function () {
            expect(handleAppBar).toHaveBeenCalledWith($scope);
        });
    });
});
//@ sourceMappingURL=controllers.js.map
