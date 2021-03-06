﻿var Spiro;
(function (Spiro) {
    (function (Helpers) {
        function createActionInvoke(domainObject, actionName, method) {
            var action = domainObject.actionMembers()[actionName];
            return createUrlInvoke(action.links().linkByRel("urn:org.restfulobjects:rels/details").href() + "/invoke", method);
        }
        Helpers.createActionInvoke = createActionInvoke;

        function createUrlInvoke(url, method) {
            var result = new Spiro.ActionResultRepresentation();
            result.hateoasUrl = url;
            result.method = method || "POST";
            return result;
        }
        Helpers.createUrlInvoke = createUrlInvoke;

        function persist(domainObject, members, options) {
            var map = domainObject.getPersistMap();
            for (var m in members || {}) {
                map.setMember(m, new Spiro.Value(members[m]));
            }
            map.save(options);
        }
        Helpers.persist = persist;

        function invokeAction(domainObject, actionName, parameters, options) {
            var actionInvoke = createActionInvoke(domainObject, actionName);
            invoke(actionInvoke, parameters, options);
        }
        Helpers.invokeAction = invokeAction;

        function invoke(invoke, parameters, options) {
            invoke.attributes = {};

            for (var p in parameters || {}) {
                invoke.setParameter(p, new Spiro.Value(parameters[p]));
            }

            invoke.fetch(options);
        }
        Helpers.invoke = invoke;
    })(Spiro.Helpers || (Spiro.Helpers = {}));
    var Helpers = Spiro.Helpers;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.backbone.helpers.js.map
