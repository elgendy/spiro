var Spiro;
(function (Spiro) {
    (function (Angular) {
        Angular.app.controller('ServicesController', function ($scope, Handlers) {
            Handlers.handleServices($scope);
        });

        Angular.app.controller('ServiceController', function ($scope, Handlers) {
            Handlers.handleService($scope);
        });

        Angular.app.controller('DialogController', function ($routeParams, $scope, Handlers) {
            if ($routeParams.action) {
                Handlers.handleActionDialog($scope);
            }
        });

        Angular.app.controller('NestedObjectController', function ($scope, $routeParams, Handlers) {
            if ($routeParams.action) {
                Handlers.handleActionResult($scope);
            }
            if ($routeParams.property) {
                Handlers.handleProperty($scope);
            } else if ($routeParams.collectionItem) {
                Handlers.handleCollectionItem($scope);
            } else if ($routeParams.resultObject) {
                Handlers.handleResult($scope);
            }
        });

        Angular.app.controller('CollectionController', function ($scope, $routeParams, Handlers) {
            if ($routeParams.resultCollection) {
                Handlers.handleCollectionResult($scope);
            } else if ($routeParams.collection) {
                Handlers.handleCollection($scope);
            }
        });

        Angular.app.controller('ObjectController', function ($scope, Handlers) {
            Handlers.handleObject($scope);
        });

        Angular.app.controller('ErrorController', function ($scope, Handlers) {
            Handlers.handleError($scope);
        });

        Angular.app.controller('AppBarController', function ($scope, Handlers) {
            Handlers.handleAppBar($scope);
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.angular.controllers.js.map
