describe('Services', function () {
    function spyOnPromise(tgt, func, mock) {
        var mp = {};

        mp.then = function (f) {
            return f(mock);
        };

        return spyOn(tgt, func).andReturn(mp);
    }

    function spyOnPromiseConditional(tgt, func, mock1, mock2) {
        var mp = {};
        var first = true;

        mp.then = function (f) {
            var result = first ? f(mock1) : f(mock2);
            first = false;
            return result;
        };

        return spyOn(tgt, func).andReturn(mp);
    }

    function mockPromiseFail(mock) {
        var mp = {};

        mp.then = function (fok, fnok) {
            return fnok(mock);
        };

        return mp;
    }

    function spyOnPromiseFail(tgt, func, mock) {
        var mp = {};

        mp.then = function (fok, fnok) {
            return fnok ? fnok(mock) : fok(mock);
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

    function spyOnPromise2NestedFail(tgt, func, mock) {
        var mp = {};

        mp.then = function (fok) {
            var mmp = {};

            mmp.then = function (f1ok) {
                var mmmp = {};

                mmmp.then = function (f2ok, f2nok) {
                    return f2nok(mock);
                };

                return mmmp;
            };

            return mmp;
        };

        return spyOn(tgt, func).andReturn(mp);
    }

    var $scope;

    beforeEach(module('app'));

    describe('Handlers Service', function () {
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

        describe('handleActionResult', function () {
            var getObject;

            describe('if it finds object', function () {
                var testObject = new Spiro.DomainObjectRepresentation();
                var testMember = new Spiro.ActionMember({}, testObject);
                var testDetails = new Spiro.ActionRepresentation();
                var testResult = new Spiro.ActionResultRepresentation();

                var actionMember;
                var actionDetails;
                var actionResult;
                var populate;
                var setResult;

                beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context, ViewModelFactory, RepresentationLoader) {
                    $scope = $rootScope.$new();

                    getObject = spyOnPromise(Context, 'getObject', testObject);

                    actionMember = spyOn(testObject, "actionMember").andReturn(testMember);
                    actionDetails = spyOn(testMember, "getDetails").andReturn(testDetails);
                    actionResult = spyOn(testDetails, "getInvoke").andReturn(testResult);
                    populate = spyOnPromiseConditional(RepresentationLoader, "populate", testDetails, testResult);

                    setResult = spyOn(Handlers, "setResult");
                }));

                describe('if it is a service', function () {
                    beforeEach(inject(function ($rootScope, $routeParams, Handlers) {
                        spyOn(testMember, "extensions").andReturn({ hasParams: false });

                        $routeParams.sid = "testService";
                        $routeParams.action = "anAction";

                        Handlers.handleActionResult($scope);
                    }));

                    it('should update the scope', function () {
                        expect(getObject).toHaveBeenCalledWith("testService", undefined);
                        expect(actionMember).toHaveBeenCalledWith("anAction");
                        expect(actionDetails).toHaveBeenCalled();
                        expect(actionResult).toHaveBeenCalled();

                        expect(populate).toHaveBeenCalled();
                        expect(setResult).toHaveBeenCalled();
                    });
                });

                describe('if it has no params', function () {
                    beforeEach(inject(function ($rootScope, $routeParams, Handlers) {
                        spyOn(testMember, "extensions").andReturn({ hasParams: false });
                        $routeParams.dt = "test";
                        $routeParams.id = "1";
                        $routeParams.action = "anAction";

                        Handlers.handleActionResult($scope);
                    }));

                    it('should update the scope', function () {
                        expect(getObject).toHaveBeenCalledWith("test", "1");
                        expect(actionMember).toHaveBeenCalledWith("anAction");
                        expect(actionDetails).toHaveBeenCalled();
                        expect(actionResult).toHaveBeenCalled();

                        expect(populate).toHaveBeenCalled();
                        expect(setResult).toHaveBeenCalled();
                    });
                });

                describe('if it has params', function () {
                    beforeEach(inject(function ($rootScope, $routeParams, Handlers) {
                        spyOn(testMember, "extensions").andReturn({ hasParams: true });
                        $routeParams.dt = "test";
                        $routeParams.id = "1";
                        $routeParams.action = "anAction";

                        Handlers.handleActionResult($scope);
                    }));

                    it('should not update the scope', function () {
                        expect(getObject).toHaveBeenCalledWith("test", "1");
                        expect(actionMember).toHaveBeenCalledWith("anAction");
                        expect(actionDetails).wasNotCalled();
                        expect(actionResult).wasNotCalled();

                        expect(setResult).wasNotCalled();
                    });
                });
            });

            describe('if it has an error', function () {
                var testObject = new Spiro.ErrorRepresentation();
                var setError;

                beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context) {
                    $scope = $rootScope.$new();

                    getObject = spyOnPromise2NestedFail(Context, 'getObject', testObject);
                    setError = spyOn(Context, 'setError');

                    $routeParams.dt = "test";
                    $routeParams.id = "1";

                    Handlers.handleActionResult($scope);
                }));

                it('should update the context', function () {
                    expect(getObject).toHaveBeenCalledWith("test", "1");
                    expect(setError).toHaveBeenCalledWith(testObject);

                    expect($scope.dialog).toBeUndefined();
                    expect($scope.dialogTemplate).toBeUndefined();
                });
            });
        });

        describe('handleProperty', function () {
            var getObject;

            describe('if it finds object', function () {
                var testObject = new Spiro.DomainObjectRepresentation();
                var testMember = new Spiro.PropertyMember({}, testObject);
                var testDetails = new Spiro.PropertyRepresentation();
                var testValue = new Spiro.Value({});
                var testLink = new Spiro.Link();
                var testTarget = new Spiro.DomainObjectRepresentation();
                var testViewModel = { test: testTarget };

                var propertyMember;
                var propertyDetails;
                var setNestedObject;
                var objectViewModel;

                var populate;

                beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context, ViewModelFactory, RepresentationLoader) {
                    $scope = $rootScope.$new();

                    getObject = spyOnPromise(Context, 'getObject', testObject);

                    propertyMember = spyOn(testObject, "propertyMember").andReturn(testMember);
                    propertyDetails = spyOn(testMember, "getDetails").andReturn(testDetails);

                    spyOn(testDetails, "value").andReturn(testValue);
                    spyOn(testValue, "link").andReturn(testLink);
                    spyOn(testLink, "getTarget").andReturn(testTarget);

                    populate = spyOnPromiseConditional(RepresentationLoader, "populate", testDetails, testTarget);

                    objectViewModel = spyOn(ViewModelFactory, 'domainObjectViewModel').andReturn(testViewModel);
                    setNestedObject = spyOn(Context, 'setNestedObject');

                    $routeParams.dt = "test";
                    $routeParams.id = "1";
                    $routeParams.property = "aProperty";

                    Handlers.handleProperty($scope);
                }));

                it('should update the scope', function () {
                    expect(getObject).toHaveBeenCalledWith("test", "1");
                    expect(propertyMember).toHaveBeenCalledWith("aProperty");
                    expect(propertyDetails).toHaveBeenCalled();

                    expect(populate).toHaveBeenCalled();

                    expect(setNestedObject).toHaveBeenCalledWith(testTarget);

                    expect($scope.result).toEqual(testViewModel);
                    expect($scope.nestedTemplate).toEqual("Content/partials/nestedObject.html");
                });
            });

            describe('if it has an error', function () {
                var testObject = new Spiro.ErrorRepresentation();
                var setError;

                beforeEach(inject(function ($rootScope, $routeParams, Handlers, Context) {
                    $scope = $rootScope.$new();

                    getObject = spyOnPromise2NestedFail(Context, 'getObject', testObject);
                    setError = spyOn(Context, 'setError');

                    $routeParams.dt = "test";
                    $routeParams.id = "1";

                    Handlers.handleProperty($scope);
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

        describe('setResult helper', function () {
            var testActionResult = new Spiro.ActionResultRepresentation();
            var testViewModel = new Spiro.Angular.DialogViewModel();
            var location;

            beforeEach(inject(function ($location) {
                location = $location;
            }));

            describe('result is null', function () {
                var testResult = new Spiro.Result(null, 'object');

                beforeEach(inject(function (Handlers) {
                    spyOn(testActionResult, 'result').andReturn(testResult);
                    (Handlers).setResult(testActionResult, testViewModel);
                }));

                it('should set view model error', function () {
                    expect(testViewModel.message).toBe("no result found");
                    expect(location.search()).toEqual({});
                });
            });

            describe('result is object', function () {
                var testObject = new Spiro.DomainObjectRepresentation();
                var testResult = new Spiro.Result({}, 'object');
                var setNestedObject;

                beforeEach(inject(function ($routeParams, Context) {
                    spyOn(testActionResult, 'result').andReturn(testResult);
                    spyOn(testActionResult, 'resultType').andReturn('object');
                    spyOn(testResult, 'object').andReturn(testObject);
                    setNestedObject = spyOn(Context, 'setNestedObject');

                    spyOn(testObject, 'domainType').andReturn("test");
                    spyOn(testObject, 'instanceId').andReturn("1");

                    $routeParams.action = "anAction";
                }));

                describe('with show flag', function () {
                    beforeEach(inject(function (Handlers) {
                        (Handlers).setResult(testActionResult, testViewModel, true);
                    }));

                    it('should set nested object and search', function () {
                        expect(setNestedObject).toHaveBeenCalledWith(testObject);
                        expect(location.search()).toEqual({ resultObject: 'test-1', action: 'anAction' });
                    });
                });

                describe('without show flag', function () {
                    beforeEach(inject(function (Handlers) {
                        (Handlers).setResult(testActionResult);
                    }));

                    it('should set nested object and search', function () {
                        expect(setNestedObject).toHaveBeenCalledWith(testObject);
                        expect(location.search()).toEqual({ resultObject: 'test-1' });
                    });
                });
            });

            describe('result is list', function () {
                var testList = new Spiro.ListRepresentation();
                var testResult = new Spiro.Result([], 'list');
                var setCollection;

                beforeEach(inject(function ($routeParams, Context) {
                    spyOn(testActionResult, 'result').andReturn(testResult);
                    spyOn(testActionResult, 'resultType').andReturn('list');
                    spyOn(testResult, 'list').andReturn(testList);
                    setCollection = spyOn(Context, 'setCollection');

                    $routeParams.action = "anAction";
                }));

                describe('with show flag', function () {
                    var testParameters = [new Spiro.Angular.ParameterViewModel(), new Spiro.Angular.ParameterViewModel()];
                    testParameters[0].value = "1";
                    testParameters[1].value = "2";

                    beforeEach(inject(function (Handlers) {
                        testViewModel.parameters = testParameters;

                        (Handlers).setResult(testActionResult, testViewModel, true);
                    }));

                    it('should set collection and search', function () {
                        expect(setCollection).toHaveBeenCalledWith(testList);
                        expect(location.search()).toEqual({ resultCollection: 'anAction1-2-', action: 'anAction' });
                    });
                });

                describe('without show flag', function () {
                    beforeEach(inject(function (Handlers) {
                        (Handlers).setResult(testActionResult);
                    }));

                    it('should set collection and search', function () {
                        expect(setCollection).toHaveBeenCalledWith(testList);
                        expect(location.search()).toEqual({ resultCollection: 'anAction' });
                    });
                });
            });
        });

        describe('invokeAction helper', function () {
            var testAction = new Spiro.ActionRepresentation();
            var testActionResult = new Spiro.ActionResultRepresentation();
            var testViewModel = new Spiro.Angular.DialogViewModel();

            var testParameters = [new Spiro.Angular.ParameterViewModel(), new Spiro.Angular.ParameterViewModel()];
            testParameters[0].value = "1";
            testParameters[1].value = "2";
            testParameters[0].id = "one";
            testParameters[1].id = "two";

            var populate;
            var clearMessages;
            var setParameter;

            beforeEach(inject(function ($rootScope) {
                spyOn(testAction, 'getInvoke').andReturn(testActionResult);

                clearMessages = spyOn(testViewModel, 'clearMessages');
                setParameter = spyOn(testActionResult, 'setParameter');
                $scope = $rootScope.$new();
            }));

            describe('invoke is successful', function () {
                var setResult;

                beforeEach(inject(function (Handlers, RepresentationLoader) {
                    populate = spyOnPromise(RepresentationLoader, 'populate', testActionResult);
                    setResult = spyOn(Handlers, 'setResult');
                    testViewModel.parameters = testParameters;

                    (Handlers).invokeAction($scope, testAction, testViewModel, false);
                }));

                it('should set result', function () {
                    expect(setParameter.callCount == 2).toBeTruthy();

                    expect(setParameter.calls[0].args[0]).toBe("one");
                    expect(setParameter.calls[0].args[1].scalar()).toBe("1");

                    expect(setParameter.calls[1].args[0]).toBe("two");
                    expect(setParameter.calls[1].args[1].scalar()).toBe("2");

                    expect(clearMessages).toHaveBeenCalled();
                    expect(populate).toHaveBeenCalledWith(testActionResult, true);

                    expect(setResult).toHaveBeenCalledWith(testActionResult, testViewModel, false);
                });
            });

            describe('if invoke has an error', function () {
                var testObject = new Spiro.ErrorRepresentation();
                var setInvokeUpdateError;

                beforeEach(inject(function ($rootScope, $routeParams, Handlers, RepresentationLoader, Context) {
                    populate = spyOnPromiseFail(RepresentationLoader, 'populate', testObject);
                    setInvokeUpdateError = spyOn(Handlers, 'setInvokeUpdateError');
                    (Handlers).invokeAction($scope, testAction, testViewModel, false);
                }));

                it('should set the error', function () {
                    expect(setInvokeUpdateError).toHaveBeenCalledWith($scope, testObject, testParameters, testViewModel);
                });
            });
        });

        describe('updateObject helper', function () {
            var testObject = new Spiro.DomainObjectRepresentation();
            var testUpdatedObject = new Spiro.DomainObjectRepresentation();
            var testUpdate = {};
            var testViewModel = new Spiro.Angular.DomainObjectViewModel();
            var testRawLinks = { testLinks: "" };

            var testProperties = [new Spiro.Angular.PropertyViewModel(), new Spiro.Angular.PropertyViewModel(), new Spiro.Angular.PropertyViewModel()];

            testProperties[0].id = "one";
            testProperties[0].value = "1";
            testProperties[0].isEditable = true;
            testProperties[0].type = 'scalar';

            testProperties[1].id = "two";
            testProperties[1].value = "2";
            testProperties[1].isEditable = true;
            testProperties[1].type = 'scalar';

            testProperties[2].id = "three";
            testProperties[2].value = "3";
            testProperties[2].isEditable = false;
            testProperties[2].type = 'scalar';

            var populate;
            var setProperty;
            var set;

            beforeEach(inject(function ($rootScope, RepresentationLoader) {
                (testUpdate).setProperty = function () {
                };

                spyOn(testObject, 'getUpdateMap').andReturn(testUpdate);
                setProperty = spyOn(testUpdate, 'setProperty');
                testViewModel.properties = testProperties;

                spyOn(testObject, 'get').andReturn(testRawLinks);
                set = spyOn(testUpdatedObject, 'set');

                $scope = $rootScope.$new();
            }));

            describe('update is successful', function () {
                var setObject;

                var location;
                var cacheFactory;
                var testCache = {};
                var remove;

                beforeEach(inject(function ($location, $cacheFactory, Handlers, RepresentationLoader, Context) {
                    setObject = spyOn(Context, 'setObject');

                    location = $location;
                    cacheFactory = $cacheFactory;
                    (testCache).remove = function (url) {
                    };

                    populate = spyOnPromise(RepresentationLoader, 'populate', testUpdatedObject);

                    spyOn(cacheFactory, 'get').andReturn(testCache);
                    remove = spyOn(testCache, 'remove');

                    testUpdatedObject.hateoasUrl = "testUrl";

                    (Handlers).updateObject($scope, testObject, testViewModel);
                }));

                it('should set result', function () {
                    expect(setProperty.callCount == 2).toBeTruthy();

                    expect(setProperty.calls[0].args[0]).toBe("one");
                    expect(setProperty.calls[0].args[1].scalar()).toBe("1");

                    expect(setProperty.calls[1].args[0]).toBe("two");
                    expect(setProperty.calls[1].args[1].scalar()).toBe("2");

                    expect(remove).toHaveBeenCalledWith("testUrl");
                    expect(location.search()).toEqual({});
                    expect(set).toHaveBeenCalledWith('links', testRawLinks);
                    expect(populate).toHaveBeenCalledWith(testUpdate, true, new Spiro.DomainObjectRepresentation());
                    expect(setObject).toHaveBeenCalledWith(testUpdatedObject);
                });
            });

            describe('if update has an error', function () {
                var testError = new Spiro.ErrorRepresentation();
                var setInvokeUpdateError;
                var editableProperties = _.filter(testProperties, function (tp) {
                    return tp.isEditable;
                });

                beforeEach(inject(function ($rootScope, $routeParams, Handlers, RepresentationLoader) {
                    populate = spyOnPromiseFail(RepresentationLoader, 'populate', testError);
                    setInvokeUpdateError = spyOn(Handlers, 'setInvokeUpdateError');
                    (Handlers).updateObject($scope, testObject, testViewModel);
                }));

                it('should set the error', function () {
                    expect(setInvokeUpdateError).toHaveBeenCalledWith($scope, testError, editableProperties, testViewModel);
                });
            });
        });

        describe('setInvokeUpdateError helper', function () {
            var testViewModel = { message: "" };

            beforeEach(inject(function ($rootScope) {
                $scope = $rootScope.$new();
            }));

            describe('if error is errorMap', function () {
                var error = { "one": { "value": "1", "invalidReason": "a reason" }, "two": { "value": "2" }, "x-ro-invalid-reason": "another reason" };

                var errorMap = new Spiro.ErrorMap(error, "status", "a warning message");
                var vms = [{ id: "one", value: null, message: null }, { id: "two", value: null, message: null }];

                beforeEach(inject(function (Handlers) {
                    (Handlers).setInvokeUpdateError($scope, errorMap, vms, testViewModel);
                }));

                it('should set the parameters and error', function () {
                    expect(vms[0].value).toBe("1");
                    expect(vms[0].message).toBe("a reason");
                    expect(vms[1].value).toBe("2");
                    expect(vms[1].message).toBeUndefined();

                    expect(testViewModel.message).toBe("another reason");
                });
            });

            describe('if error is errorRep', function () {
                var testError = new Spiro.ErrorRepresentation();
                var testErrorViewModel = new Spiro.Angular.ErrorViewModel();
                var errorViewModel;

                beforeEach(inject(function (Handlers, ViewModelFactory) {
                    errorViewModel = spyOn(ViewModelFactory, 'errorViewModel').andReturn(testErrorViewModel);
                    (Handlers).setInvokeUpdateError($scope, testError, [], testViewModel);
                }));

                it('should set the scope ', function () {
                    expect(errorViewModel).toHaveBeenCalledWith(testError);
                    expect($scope.error).toBe(testErrorViewModel);
                    expect($scope.dialogTemplate).toBe("Content/partials/error.html");
                });
            });

            describe('if error is string', function () {
                var errorMessage = 'an error message';

                beforeEach(inject(function ($rootScope, $routeParams, Handlers) {
                    (Handlers).setInvokeUpdateError($scope, errorMessage, [], testViewModel);
                }));

                it('should set the scope ', function () {
                    expect(testViewModel.message).toBe(errorMessage);
                });
            });
        });
    });

    describe('Context Service', function () {
        describe('getHome', function () {
            var testHome = new Spiro.HomePageRepresentation();
            var context;

            var result;

            beforeEach(inject(function ($rootScope, $routeParams, Context, RepresentationLoader) {
                spyOnPromise(RepresentationLoader, 'populate', testHome);
                context = Context;

                runs(function () {
                    context.getHome().then(function (home) {
                        result = home;
                    });
                    $rootScope.$apply();
                });

                waitsFor(function () {
                    return !!result;
                }, "result not set", 1000);
            }));

            describe('when currentHome is set', function () {
                beforeEach(inject(function ($rootScope) {
                    result = null;

                    runs(function () {
                        context.getHome().then(function (home) {
                            result = home;
                        });
                        $rootScope.$apply();
                    });

                    waitsFor(function () {
                        return !!result;
                    }, "result not set", 1000);
                }));

                it('returns home page representation', function () {
                    expect(result).toBe(testHome);
                });
            });

            describe('when currentHome is not set', function () {
                it('returns home page representation', function () {
                    expect(result).toBe(testHome);
                });
            });
        });

        describe('getServices', function () {
            var testServices = new Spiro.DomainServicesRepresentation();
            var testHome = new Spiro.HomePageRepresentation();
            var context;

            var result;

            beforeEach(inject(function ($rootScope, $routeParams, Context, RepresentationLoader) {
                spyOnPromise(RepresentationLoader, 'populate', testServices);
                spyOnPromise(Context, 'getHome', testHome);

                spyOn(testHome, 'getDomainServices').andReturn(testServices);

                context = Context;

                runs(function () {
                    context.getServices().then(function (services) {
                        result = services;
                    });
                    $rootScope.$apply();
                });

                waitsFor(function () {
                    return !!result;
                }, "result not set", 1000);
            }));

            describe('when currentServices is set', function () {
                beforeEach(inject(function ($rootScope) {
                    result = null;

                    runs(function () {
                        context.getServices().then(function (services) {
                            result = services;
                        });
                        $rootScope.$apply();
                    });

                    waitsFor(function () {
                        return !!result;
                    }, "result not set", 1000);
                }));

                it('returns home page representation', function () {
                    expect(result).toBe(testServices);
                });
            });

            describe('when currentServices is not set', function () {
                it('returns services representation', function () {
                    expect(result).toBe(testServices);
                });
            });
        });
    });
});
//@ sourceMappingURL=services.js.map
