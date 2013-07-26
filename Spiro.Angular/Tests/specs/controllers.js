describe('Controllers', function () {
    var $scope, ctrl;

    beforeEach(module('app'));

    describe('AppBarController', function () {
        var context;

        beforeEach(inject(function ($rootScope, $controller, $routeParams, $location) {
            $scope = $rootScope.$new();
            context = null;
            ctrl = $controller('AppBarController', { $scope: $scope, $routeParams: $routeParams, $location: $location, Context: context });
        }));

        it('should have appBar data', function () {
            expect($scope.appBar).toBeDefined();
        });

        it('should set home path', function () {
            expect($scope.appBar.goHome).toEqual("#/");
        });
    });
});
//@ sourceMappingURL=controllers.js.map
