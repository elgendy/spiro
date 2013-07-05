var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Spiro;
(function (Spiro) {
    var SpiroModel = (function () {
        function SpiroModel(obj) {
            this.obj = obj;
        }
        SpiroModel.prototype.get = function (id) {
            return this.obj[id];
        };
        return SpiroModel;
    })();
    Spiro.SpiroModel = SpiroModel;

    var HateoasModelBase = (function (_super) {
        __extends(HateoasModelBase, _super);
        function HateoasModelBase(object) {
            _super.call(this, object);
            this.method = "GET";
            this.suffix = "";
        }
        HateoasModelBase.prototype.url = function () {
            return (this.hateoasUrl) + this.suffix;
        };

        HateoasModelBase.prototype.error = function (originalModel, resp, iOptions) {
            var rs = resp.responseText ? $.parseJSON(resp.responseText) : {};
            var warnings = resp.getResponseHeader("Warning");
        };
        return HateoasModelBase;
    })(SpiroModel);
    Spiro.HateoasModelBase = HateoasModelBase;

    var ErrorMap = (function (_super) {
        __extends(ErrorMap, _super);
        function ErrorMap(map, statusCode, warningMessage) {
            _super.call(this, map);
            this.statusCode = statusCode;
            this.warningMessage = warningMessage;
        }
        ErrorMap.prototype.values = function () {
            var vs = {};

            return vs;
        };

        ErrorMap.prototype.invalidReason = function () {
            return this.get("x-ro-invalid-reason");
        };
        return ErrorMap;
    })(HateoasModelBase);
    Spiro.ErrorMap = ErrorMap;

    var ArgumentMap = (function (_super) {
        __extends(ArgumentMap, _super);
        function ArgumentMap(map, parent, id, link) {
            _super.call(this, map);
            this.id = id;

            link.copyToHateoasModel(this);

            this.id = id;
        }
        return ArgumentMap;
    })(HateoasModelBase);
    Spiro.ArgumentMap = ArgumentMap;

    var UpdateMap = (function (_super) {
        __extends(UpdateMap, _super);
        function UpdateMap(domainObject, map) {
            _super.call(this, map, domainObject, domainObject.instanceId(), domainObject.updateLink());

            for (var member in this.properties()) {
                var currentValue = domainObject.propertyMembers()[member].value();
                this.setProperty(member, currentValue);
            }
        }
        UpdateMap.prototype.properties = function () {
            var pps = {};

            return pps;
        };

        UpdateMap.prototype.setProperty = function (name, value) {
        };
        return UpdateMap;
    })(ArgumentMap);
    Spiro.UpdateMap = UpdateMap;

    var AddToRemoveFromMap = (function (_super) {
        __extends(AddToRemoveFromMap, _super);
        function AddToRemoveFromMap(collectionResource, map, add) {
            _super.call(this, map, collectionResource, collectionResource.instanceId(), add ? collectionResource.addToLink() : collectionResource.removeFromLink());
        }
        AddToRemoveFromMap.prototype.setValue = function (value) {
        };
        return AddToRemoveFromMap;
    })(ArgumentMap);
    Spiro.AddToRemoveFromMap = AddToRemoveFromMap;

    var ModifyMap = (function (_super) {
        __extends(ModifyMap, _super);
        function ModifyMap(propertyResource, map) {
            _super.call(this, map, propertyResource, propertyResource.instanceId(), propertyResource.modifyLink());

            this.setValue(propertyResource.value());
        }
        ModifyMap.prototype.setValue = function (value) {
        };
        return ModifyMap;
    })(ArgumentMap);
    Spiro.ModifyMap = ModifyMap;

    var ClearMap = (function (_super) {
        __extends(ClearMap, _super);
        function ClearMap(propertyResource) {
            _super.call(this, {}, propertyResource, propertyResource.instanceId(), propertyResource.clearLink());
        }
        return ClearMap;
    })(ArgumentMap);
    Spiro.ClearMap = ClearMap;

    var PersistMap = (function (_super) {
        __extends(PersistMap, _super);
        function PersistMap(domainObject, map) {
            _super.call(this, map, domainObject, domainObject.instanceId(), domainObject.persistLink());
        }
        PersistMap.prototype.setMember = function (name, value) {
        };
        return PersistMap;
    })(ArgumentMap);
    Spiro.PersistMap = PersistMap;

    var SpiroCollection = (function () {
        function SpiroCollection() {
        }
        SpiroCollection.prototype.add = function (model) {
            this.models = [];

            for (var i = 0; i < model.length; i++) {
                var mm = new this.model(model[i]);
                this.models.push(mm);
            }
        };

        SpiroCollection.prototype.url = function () {
            return "";
        };
        return SpiroCollection;
    })();
    Spiro.SpiroCollection = SpiroCollection;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.models.angularjs.js.map
