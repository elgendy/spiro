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

describe('Handlers Service', function () {
    var $scope;

    beforeEach(module('app'));

    function spyOnPromise(tgt, func, mock) {
        var mp = {};

        mp.then = function (f) {
            return f(mock);
        };

        return spyOn(tgt, func).andReturn(mp);
    }

    function spyOnPromiseFail(tgt, func, mock) {
        var mp = {};

        mp.then = function (fok, fnok) {
            return fnok(mock);
        };

        return spyOn(tgt, func).andReturn(mp);
    }

    function spyOnPromiseNestedFail(tgt, func, mock) {
        var mp = {};

        mp.then = function (fok) {
            var mmp = {};

            mmp.then = function (f1ok, f1nok) {
                return f1nok(mock);
            };

            return mmp;
        };

        return spyOn(tgt, func).andReturn(mp);
    }

    describe('handleCollectionResult', function () {
        var getCollection;

        describe('if it finds collection', function () {
            var testObject = new Spiro.ListRepresentation();
            var testViewModel = { test: testObject };

            var collectionViewModel;

            beforeEach(inject(function ($rootScope, Handlers, Context, ViewModelFactory) {
                $scope = $rootScope.$new();

                getCollection = spyOnPromise(Context, 'getCollection', testObject);
                collectionViewModel = spyOn(ViewModelFactory, 'collectionViewModel').andReturn(testViewModel);

                Handlers.handleCollectionResult($scope);
            }));

            it('should update the scope', function () {
                expect(getCollection).toHaveBeenCalled();
                expect(collectionViewModel).toHaveBeenCalledWith(testObject);

                expect($scope.collection).toEqual(testViewModel);
                expect($scope.collectionTemplate).toEqual("Content/partials/nestedCollection.html");
            });
        });

        describe('if it has an error', function () {
            var testObject = new Spiro.ErrorRepresentation();
            var setError;

            beforeEach(inject(function ($rootScope, Handlers, Context) {
                $scope = $rootScope.$new();

                getCollection = spyOnPromiseFail(Context, 'getCollection', testObject);
                setError = spyOn(Context, 'setError');

                Handlers.handleCollectionResult($scope);
            }));

            it('should update the context', function () {
                expect(getCollection).toHaveBeenCalled();
                expect(setError).toHaveBeenCalledWith(testObject);

                expect($scope.collection).toBeUndefined();
                expect($scope.collectionTemplate).toBeUndefined();
            });
        });
    });

    describe('handleCollection', function () {
        var getObject;

        describe('if it finds object', function () {
            var testObject = new Spiro.DomainObjectRepresentation();
            var testMember = new Spiro.CollectionMember({}, testObject);
            var testDetails = new Spiro.CollectionRepresentation();
            var testViewModel = { test: testObject };

            var collectionMember;
            var collectionDetails;
            var populate;
            var collectionViewModel;

            beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context, ViewModelFactory, RepresentationLoader) {
                $scope = $rootScope.$new();

                getObject = spyOnPromise(Context, 'getObject', testObject);

                collectionMember = spyOn(testObject, "collectionMember").andReturn(testMember);
                collectionDetails = spyOn(testMember, "getDetails").andReturn(testDetails);
                populate = spyOnPromise(RepresentationLoader, "populate", testDetails);
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
        });

        describe('if it has an error', function () {
            var testObject = new Spiro.ErrorRepresentation();
            var setError;

            beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context) {
                $scope = $rootScope.$new();

                getObject = spyOnPromiseNestedFail(Context, 'getObject', testObject);
                setError = spyOn(Context, 'setError');

                $routeParams.dt = "test";
                $routeParams.id = "1";

                Handlers.handleCollection($scope);
            }));

            it('should update the context', function () {
                expect(getObject).toHaveBeenCalledWith("test", "1");
                expect(setError).toHaveBeenCalledWith(testObject);

                expect($scope.collection).toBeUndefined();
                expect($scope.collectionTemplate).toBeUndefined();
            });
        });
    });

    describe('handleActionDialog', function () {
        var getObject;

        describe('if it finds object', function () {
            var testObject = new Spiro.DomainObjectRepresentation();
            var testMember = new Spiro.ActionMember({}, testObject);
            var testDetails = new Spiro.ActionRepresentation();
            var testViewModel = { test: testObject };

            var actionMember;
            var actionDetails;
            var populate;
            var dialogViewModel;

            beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context, ViewModelFactory, RepresentationLoader) {
                $scope = $rootScope.$new();

                getObject = spyOnPromise(Context, 'getObject', testObject);

                actionMember = spyOn(testObject, "actionMember").andReturn(testMember);
                actionDetails = spyOn(testMember, "getDetails").andReturn(testDetails);
                populate = spyOnPromise(RepresentationLoader, "populate", testDetails);
                dialogViewModel = spyOn(ViewModelFactory, 'dialogViewModel').andReturn(testViewModel);
            }));

            describe('if it is a service', function () {
                beforeEach(inject(function ($rootScope, $routeParams, Handlers) {
                    spyOn(testDetails, "extensions").andReturn({ hasParams: true });

                    $routeParams.sid = "testService";
                    $routeParams.action = "anAction";

                    Handlers.handleActionDialog($scope);
                }));

                it('should update the scope', function () {
                    expect(getObject).toHaveBeenCalledWith("testService", undefined);
                    expect(actionMember).toHaveBeenCalledWith("anAction");
                    expect(actionDetails).toHaveBeenCalled();
                    expect(populate).toHaveBeenCalledWith(testDetails);
                    expect(dialogViewModel).toHaveBeenCalledWith(testDetails, jasmine.any(Function));

                    expect($scope.dialog).toEqual(testViewModel);
                    expect($scope.dialogTemplate).toEqual("Content/partials/dialog.html");
                });
            });

            describe('if it has params', function () {
                beforeEach(inject(function ($rootScope, $routeParams, Handlers) {
                    spyOn(testDetails, "extensions").andReturn({ hasParams: true });
                    $routeParams.dt = "test";
                    $routeParams.id = "1";
                    $routeParams.action = "anAction";

                    Handlers.handleActionDialog($scope);
                }));

                it('should update the scope', function () {
                    expect(getObject).toHaveBeenCalledWith("test", "1");
                    expect(actionMember).toHaveBeenCalledWith("anAction");
                    expect(actionDetails).toHaveBeenCalled();
                    expect(populate).toHaveBeenCalledWith(testDetails);
                    expect(dialogViewModel).toHaveBeenCalledWith(testDetails, jasmine.any(Function));

                    expect($scope.dialog).toEqual(testViewModel);
                    expect($scope.dialogTemplate).toEqual("Content/partials/dialog.html");
                });
            });

            describe('if it has no params', function () {
                beforeEach(inject(function ($rootScope, $routeParams, Handlers) {
                    spyOn(testDetails, "extensions").andReturn({ hasParams: false });
                    $routeParams.dt = "test";
                    $routeParams.id = "1";
                    $routeParams.action = "anAction";

                    Handlers.handleActionDialog($scope);
                }));

                it('should update the scope', function () {
                    expect(getObject).toHaveBeenCalledWith("test", "1");
                    expect(actionMember).toHaveBeenCalledWith("anAction");
                    expect(actionDetails).toHaveBeenCalled();
                    expect(populate).toHaveBeenCalledWith(testDetails);
                    expect(dialogViewModel).wasNotCalled();

                    expect($scope.dialog).toBeUndefined();
                    expect($scope.dialogTemplate).toBeUndefined();
                });
            });
        });

        describe('if it has an error', function () {
            var testObject = new Spiro.ErrorRepresentation();
            var setError;

            beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context) {
                $scope = $rootScope.$new();

                getObject = spyOnPromiseNestedFail(Context, 'getObject', testObject);
                setError = spyOn(Context, 'setError');

                $routeParams.dt = "test";
                $routeParams.id = "1";

                Handlers.handleActionDialog($scope);
            }));

            it('should update the context', function () {
                expect(getObject).toHaveBeenCalledWith("test", "1");
                expect(setError).toHaveBeenCalledWith(testObject);

                expect($scope.dialog).toBeUndefined();
                expect($scope.dialogTemplate).toBeUndefined();
            });
        });
    });

    describe('handleResult', function () {
        var getNestedObject;

        describe('if it finds object', function () {
            var testObject = new Spiro.DomainObjectRepresentation();
            var testViewModel = { test: testObject };

            var objectViewModel;
            var setNestedObject;

            beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context, ViewModelFactory) {
                $scope = $rootScope.$new();

                getNestedObject = spyOnPromise(Context, 'getNestedObject', testObject);

                objectViewModel = spyOn(ViewModelFactory, 'domainObjectViewModel').andReturn(testViewModel);
                setNestedObject = spyOn(Context, 'setNestedObject');

                $routeParams.resultObject = "test-1";

                Handlers.handleResult($scope);
            }));

            it('should update the scope', function () {
                expect(getNestedObject).toHaveBeenCalledWith("test", "1");
                expect(objectViewModel).toHaveBeenCalledWith(testObject);
                expect(setNestedObject).toHaveBeenCalledWith(testObject);

                expect($scope.result).toEqual(testViewModel);
                expect($scope.nestedTemplate).toEqual("Content/partials/nestedObject.html");
            });
        });

        describe('if it has an error', function () {
            var testObject = new Spiro.ErrorRepresentation();
            var setError;

            beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context) {
                $scope = $rootScope.$new();

                getNestedObject = spyOnPromiseFail(Context, 'getNestedObject', testObject);
                setError = spyOn(Context, 'setError');

                $routeParams.resultObject = "test-1";

                Handlers.handleResult($scope);
            }));

            it('should update the context', function () {
                expect(getNestedObject).toHaveBeenCalledWith("test", "1");
                expect(setError).toHaveBeenCalledWith(testObject);

                expect($scope.result).toBeUndefined();
                expect($scope.nestedTemplate).toBeUndefined();
            });
        });
    });

    describe('handleCollectionItem', function () {
        var getNestedObject;

        describe('if it finds object', function () {
            var testObject = new Spiro.DomainObjectRepresentation();
            var testViewModel = { test: testObject };

            var objectViewModel;
            var setNestedObject;

            beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context, ViewModelFactory) {
                $scope = $rootScope.$new();

                getNestedObject = spyOnPromise(Context, 'getNestedObject', testObject);

                objectViewModel = spyOn(ViewModelFactory, 'domainObjectViewModel').andReturn(testViewModel);
                setNestedObject = spyOn(Context, 'setNestedObject');

                $routeParams.collectionItem = "test/1";

                Handlers.handleCollectionItem($scope);
            }));

            it('should update the scope', function () {
                expect(getNestedObject).toHaveBeenCalledWith("test", "1");
                expect(objectViewModel).toHaveBeenCalledWith(testObject);
                expect(setNestedObject).toHaveBeenCalledWith(testObject);

                expect($scope.result).toEqual(testViewModel);
                expect($scope.nestedTemplate).toEqual("Content/partials/nestedObject.html");
            });
        });

        describe('if it has an error', function () {
            var testObject = new Spiro.ErrorRepresentation();
            var setError;

            beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context) {
                $scope = $rootScope.$new();

                getNestedObject = spyOnPromiseFail(Context, 'getNestedObject', testObject);
                setError = spyOn(Context, 'setError');

                $routeParams.collectionItem = "test/1";

                Handlers.handleCollectionItem($scope);
            }));

            it('should update the context', function () {
                expect(getNestedObject).toHaveBeenCalledWith("test", "1");
                expect(setError).toHaveBeenCalledWith(testObject);

                expect($scope.result).toBeUndefined();
                expect($scope.nestedTemplate).toBeUndefined();
            });
        });
    });

    describe('handleServices', function () {
        var getServices;

        describe('if it finds services', function () {
            var testObject = new Spiro.DomainServicesRepresentation();
            var testViewModel = { test: testObject };

            var servicesViewModel;
            var setObject;
            var setNestedObject;

            beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context, ViewModelFactory) {
                $scope = $rootScope.$new();

                getServices = spyOnPromise(Context, 'getServices', testObject);

                servicesViewModel = spyOn(ViewModelFactory, 'servicesViewModel').andReturn(testViewModel);
                setNestedObject = spyOn(Context, 'setNestedObject');
                setObject = spyOn(Context, 'setObject');

                Handlers.handleServices($scope);
            }));

            it('should update the scope', function () {
                expect(getServices).toHaveBeenCalled();
                expect(servicesViewModel).toHaveBeenCalledWith(testObject);
                expect(setObject).toHaveBeenCalledWith(null);
                expect(setNestedObject).toHaveBeenCalledWith(null);

                expect($scope.services).toEqual(testViewModel);
            });
        });

        describe('if it has an error', function () {
            var testObject = new Spiro.ErrorRepresentation();
            var setError;

            beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context) {
                $scope = $rootScope.$new();

                getServices = spyOnPromiseFail(Context, 'getServices', testObject);
                setError = spyOn(Context, 'setError');

                Handlers.handleServices($scope);
            }));

            it('should update the context', function () {
                expect(getServices).toHaveBeenCalled();
                expect(setError).toHaveBeenCalledWith(testObject);

                expect($scope.services).toBeUndefined();
            });
        });
    });

    describe('handleService', function () {
        var getObject;

        describe('if it finds service', function () {
            var testObject = new Spiro.DomainObjectRepresentation();
            var testViewModel = { test: testObject };

            var serviceViewModel;

            beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context, ViewModelFactory) {
                $scope = $rootScope.$new();

                getObject = spyOnPromise(Context, 'getObject', testObject);

                serviceViewModel = spyOn(ViewModelFactory, 'serviceViewModel').andReturn(testViewModel);

                $routeParams.sid = "test";

                Handlers.handleService($scope);
            }));

            it('should update the scope', function () {
                expect(getObject).toHaveBeenCalledWith("test");
                expect(serviceViewModel).toHaveBeenCalledWith(testObject);

                expect($scope.object).toEqual(testViewModel);
            });
        });

        describe('if it has an error', function () {
            var testObject = new Spiro.ErrorRepresentation();
            var setError;

            beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context) {
                $scope = $rootScope.$new();

                getObject = spyOnPromiseFail(Context, 'getObject', testObject);
                setError = spyOn(Context, 'setError');

                $routeParams.sid = "test";

                Handlers.handleService($scope);
            }));

            it('should update the context', function () {
                expect(getObject).toHaveBeenCalledWith("test");
                expect(setError).toHaveBeenCalledWith(testObject);

                expect($scope.object).toBeUndefined();
            });
        });
    });

    describe('handleObject', function () {
        var getObject;

        describe('if it finds object', function () {
            var testObject = new Spiro.DomainObjectRepresentation();
            var testViewModel = { test: testObject };

            var objectViewModel;
            var setNestedObject;

            beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context, ViewModelFactory) {
                $scope = $rootScope.$new();

                getObject = spyOnPromise(Context, 'getObject', testObject);

                objectViewModel = spyOn(ViewModelFactory, 'domainObjectViewModel').andReturn(testViewModel);
                setNestedObject = spyOn(Context, 'setNestedObject');

                $routeParams.dt = "test";
                $routeParams.id = "1";

                Handlers.handleObject($scope);
            }));

            describe('not in edit mode', function () {
                beforeEach(inject(function ($rootScope, $routeParams, Handlers) {
                    Handlers.handleObject($scope);
                }));

                it('should update the scope', function () {
                    expect(getObject).toHaveBeenCalledWith("test", "1");
                    expect(objectViewModel).toHaveBeenCalledWith(testObject, jasmine.any(Function));
                    expect(setNestedObject).toHaveBeenCalledWith(null);

                    expect($scope.object).toEqual(testViewModel);
                    expect($scope.actionTemplate).toEqual("Content/partials/actions.html");
                    expect($scope.propertiesTemplate).toEqual("Content/partials/viewProperties.html");
                });
            });

            describe('in edit mode', function () {
                beforeEach(inject(function ($rootScope, $routeParams, Handlers) {
                    $routeParams.editMode = "test";
                    Handlers.handleObject($scope);
                }));

                it('should update the scope', function () {
                    expect(getObject).toHaveBeenCalledWith("test", "1");
                    expect(objectViewModel).toHaveBeenCalledWith(testObject, jasmine.any(Function));
                    expect(setNestedObject).toHaveBeenCalledWith(null);

                    expect($scope.object).toEqual(testViewModel);
                    expect($scope.actionTemplate).toEqual("");
                    expect($scope.propertiesTemplate).toEqual("Content/partials/editProperties.html");
                });
            });
        });

        describe('if it has an error', function () {
            var testObject = new Spiro.ErrorRepresentation();
            var setError;

            beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context) {
                $scope = $rootScope.$new();

                getObject = spyOnPromiseFail(Context, 'getObject', testObject);
                setError = spyOn(Context, 'setError');

                $routeParams.dt = "test";
                $routeParams.id = "1";

                Handlers.handleObject($scope);
            }));

            it('should update the context', function () {
                expect(getObject).toHaveBeenCalledWith("test", "1");
                expect(setError).toHaveBeenCalledWith(testObject);

                expect($scope.object).toBeUndefined();
                expect($scope.actionTemplate).toBeUndefined();
                expect($scope.propertiesTemplate).toBeUndefined();
            });
        });
    });

    describe('handleError', function () {
        beforeEach(inject(function ($rootScope, Handlers, Context) {
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
            beforeEach(inject(function ($rootScope, Handlers) {
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
            beforeEach(inject(function ($rootScope, $location, $routeParams, Handlers, Context) {
                $scope = $rootScope.$new();

                $routeParams.dt = "test";
                $routeParams.id = "1";

                spyOnPromise(Context, 'getObject', new Spiro.DomainObjectRepresentation());

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
//@ sourceMappingURL=controllers.js.map
