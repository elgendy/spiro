var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Spiro;
(function (Spiro) {
    Spiro.sync = function (method, model, options) {
        Backbone.sync(method, model, options);
    };

    var ModelShim = (function (_super) {
        __extends(ModelShim, _super);
        function ModelShim() {
            _super.apply(this, arguments);
        }
        return ModelShim;
    })(Backbone.Model);
    Spiro.ModelShim = ModelShim;

    var CollectionShim = (function (_super) {
        __extends(CollectionShim, _super);
        function CollectionShim() {
            _super.apply(this, arguments);
        }
        return CollectionShim;
    })(Backbone.Collection);
    Spiro.CollectionShim = CollectionShim;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.models.shims.js.map
