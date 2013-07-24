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

    var HateoasModelBaseShim = (function (_super) {
        __extends(HateoasModelBaseShim, _super);
        function HateoasModelBaseShim(object) {
            var _this = this;
            _super.call(this, object);
            this.method = "GET";
            this.suffix = "";
            this.once('error', this.error);
            this.url = function () {
                return _this.hateoasUrl + _this.suffix;
            };
        }
        HateoasModelBaseShim.prototype.error = function (originalModel, resp, iOptions) {
            var rs = resp.responseText ? $.parseJSON(resp.responseText) : {};
            var warnings = resp.getResponseHeader("Warning");
            this.trigger("error", this.onError(rs, resp.status, warnings));
        };

        HateoasModelBaseShim.prototype.onError = function (map, statusCode, warnings) {
        };

        HateoasModelBaseShim.prototype.appendUrlSuffix = function () {
            this.suffix = "";
            var asJson = this.toJSON();

            if (_.toArray(asJson).length > 0) {
                var map = JSON.stringify(asJson);
                var encodedMap = encodeURI(map);
                this.suffix = "?" + encodedMap;
            }
        };

        HateoasModelBaseShim.prototype.preFetch = function () {
        };

        HateoasModelBaseShim.prototype.fetch = function (options) {
            this.preFetch();
            if (this.method === "GET") {
                this.appendUrlSuffix();
                return _super.prototype.fetch.call(this, options);
            } else if (this.method === "POST") {
                return _super.prototype.save.call(this, null, options);
            } else if (this.method === "PUT") {
                return _super.prototype.save.call(this, null, options);
            } else if (this.method === "DELETE") {
                this.appendUrlSuffix();
                return _super.prototype.destroy.call(this, options);
            }

            return null;
        };

        HateoasModelBaseShim.prototype.save = function (options) {
            _super.prototype.save.call(this, null, options);
        };

        HateoasModelBaseShim.prototype.destroy = function (options) {
            this.appendUrlSuffix();
            _super.prototype.destroy.call(this, options);
        };
        return HateoasModelBaseShim;
    })(ModelShim);
    Spiro.HateoasModelBaseShim = HateoasModelBaseShim;

    var ArgumentMap = (function (_super) {
        __extends(ArgumentMap, _super);
        function ArgumentMap(map, parent, id) {
            var _this = this;
            _super.call(this, map);
            this.id = id;

            this.id = id;

            this.on("requestFailed", function (args) {
                parent.trigger("requestFailed", args);
            });

            this.on("requestSucceeded", function (args) {
                parent.trigger("requestSucceeded", args);
            });

            this.on("change", function () {
                _this.onChange();
            });
        }
        ArgumentMap.prototype.onChange = function () {
        };

        ArgumentMap.prototype.onError = function (map, statusCode, warnings) {
        };
        return ArgumentMap;
    })(HateoasModelBaseShim);
    Spiro.ArgumentMap = ArgumentMap;

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
