var Spiro;
(function (Spiro) {
    (function (Angular) {
        Angular.app.controller('ServicesController', function ($scope, RepresentationLoader, Home, Context) {
            Home.then(function (home) {
                var ds = home.getDomainServices();
                return RepresentationLoader.populate(ds);
            }).then(function (services) {
                $scope.services = Angular.ServicesViewModel.create(services);
                Context.setCurrentServices(services);
            }, function (error) {
                $scope.services = [];
            });
        });

        Angular.app.controller('ServiceController', function ($scope, $routeParams, RepresentationLoader, Context) {
            var services = (Context.getCurrentServices());
            var serviceLink = _.find(services.value().models, function (model) {
                return model.rel().parms[0] === 'serviceId="' + $routeParams.sid + '"';
            });
            var service = serviceLink.getTarget();

            RepresentationLoader.populate(service).then(function (service) {
                $scope.service = Angular.ServiceViewModel.create(service);
                Context.setCurrentObject(service);
            }, function (error) {
                $scope.service = {};
            });
        });

        Angular.app.controller('ActionController', function ($scope, $routeParams, RepresentationLoader, Context) {
            var object = (Context.getCurrentObject());

            if (object.extensions().isService) {
                $scope.service = Angular.ServiceViewModel.create(object);
                $scope.backGroundColor = "bg-color-darkBlue";
            }
            ;

            var actions = _.map(object.actionMembers(), function (value, key) {
                return { key: key, value: value };
            });
            var action = _.find(actions, function (kvp) {
                return kvp.key === $routeParams.aid;
            });
            var actionTarget = action.value.getDetails();

            RepresentationLoader.populate(actionTarget).then(function (action) {
                if (action.extensions().hasParams) {
                } else {
                    var result = action.getInvoke();
                    return RepresentationLoader.populate(result);
                }
            }).then(function (result) {
                $scope.result = Angular.DomainObjectViewModel.create(result.result().object());
                $scope.nestedTemplate = "Content/partials/nestedObject.html";
                Context.setCurrentNestedObject(result.result().object());
            }, function (error) {
                $scope.service = {};
            });
        });

        Angular.app.controller('LinkController', function ($scope, $routeParams, RepresentationLoader, Context) {
            var object = (Context.getCurrentNestedObject());

            var properties = _.map(object.propertyMembers(), function (value, key) {
                return { key: key, value: value };
            });
            var property = _.find(properties, function (kvp) {
                return kvp.key === $routeParams.pid;
            });
            var propertyDetails = property.value.getDetails();

            RepresentationLoader.populate(propertyDetails).then(function (details) {
                var target = details.value().link().getTarget();
                return RepresentationLoader.populate(target);
            }).then(function (object) {
                $scope.object = Angular.DomainObjectViewModel.create(object);
                Context.setCurrentObject(object);
            }, function (error) {
                $scope.object = {};
            });
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
