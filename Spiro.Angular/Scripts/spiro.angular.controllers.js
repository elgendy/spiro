var Spiro;
(function (Spiro) {
    (function (Angular) {
        Angular.app.controller('ServicesController', function ($scope, RoServer) {
            var services = RoServer.getServices();

            services.success(function (data, status) {
                var services = new Spiro.DomainServicesRepresentation(data);
                var links = services.value().models;

                $scope.services = {};

                $scope.services.title = "Services";
                $scope.services.backGroundColor = "bg-color-darkBlue";
                $scope.services.items = _.map(links, function (link) {
                    return { href: link.href(), title: link.title() };
                });
            }).error(function (data, status) {
                $scope.services = [];
            });
        });

        Angular.app.controller('ServiceController', function ($scope, $routeParams, RoServer) {
            var service = RoServer.getService($routeParams.sid);

            service.success(function (data, status) {
                var service = new Spiro.DomainObjectRepresentation(data);
                var actions = service.actionMembers();

                $scope.service = {};

                $scope.service.serviceId = service.serviceId();
                $scope.service.title = service.title();
                $scope.service.actions = _.map(actions, function (action) {
                    return { href: action.detailsLink().href(), title: action.extensions().friendlyName };
                });
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
                            var result = new Spiro.ActionResultRepresentation(data);
                            var properties = result.result().object().propertyMembers();
                            var collections = result.result().object().collectionMembers();

                            $scope.result = {};

                            $scope.result.domainType = result.result().object().domainType();
                            $scope.result.title = result.result().object().title();
                            $scope.result.href = result.result().object().selfLink().href();

                            $scope.result.properties = _.map(properties, function (property) {
                                return {
                                    title: property.extensions().friendlyName,
                                    value: property.value().toString(),
                                    type: property.isScalar() ? "scalar" : "ref",
                                    returnType: property.extensions().returnType,
                                    href: property.isScalar() ? "" : property.value().link().href()
                                };
                            });

                            $scope.result.collections = _.map(collections, function (collection) {
                                return {
                                    title: collection.extensions().friendlyName,
                                    size: collection.size(),
                                    pluralName: collection.extensions().pluralName
                                };
                            });

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

            $scope.propertyType = function (property) {
                return property.isScalar() ? "scalar" : "ref";
            };
        });

        Angular.app.controller('ObjectController', function ($scope, $routeParams, RoServer) {
            var object = RoServer.getObject($routeParams.dt, $routeParams.id);

            object.success(function (data, status) {
                var object = new Spiro.DomainObjectRepresentation(data);
                var properties = object.propertyMembers();
                var collections = object.collectionMembers();
                var actions = object.actionMembers();

                $scope.object = {};

                $scope.object.domainType = object.domainType();
                $scope.object.title = object.title();

                $scope.object.properties = _.map(properties, function (property) {
                    return {
                        title: property.extensions().friendlyName,
                        value: property.value().toString(),
                        type: property.isScalar() ? "scalar" : "ref",
                        returnType: property.extensions().returnType,
                        href: property.isScalar() ? "" : property.value().link().href()
                    };
                });

                $scope.object.collections = _.map(collections, function (collection) {
                    return {
                        title: collection.extensions().friendlyName,
                        size: collection.size(),
                        pluralName: collection.extensions().pluralName
                    };
                });

                $scope.object.actions = _.map(actions, function (action) {
                    return {
                        title: action.extensions().friendlyName,
                        href: action.detailsLink().href()
                    };
                });
            }).error(function (data, status) {
                $scope.object = {};
            });

            $scope.propertyType = function (property) {
                return property.isScalar() ? "scalar" : "ref";
            };

            $scope.backGroundColor = "bg-color-darkBlue";
        });

        Angular.app.controller('AppBarController', function ($scope) {
            $scope.goHome = "#/";

            $scope.goBack = function () {
                parent.history.back();
            };

            $scope.goForward = function () {
                parent.history.forward();
            };

            $scope.hideEdit = !$scope.object;
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.angular.controllers.js.map
