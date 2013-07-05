//Copyright 2013 Naked Objects Group Ltd
//Licensed under the Apache License, Version 2.0(the "License");
//you may not use this file except in compliance with the License.
//You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
//Unless required by applicable law or agreed to in writing, software
//distributed under the License is distributed on an "AS IS" BASIS,
//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.

/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/backbone/backbone.d.ts" />
/// <reference path="spiro.models.ts" />

//declare var _: any;

// helpers for common tasks with spiro model 

module Spiro.Helpers {

    export function createActionInvoke(domainObject: DomainObjectRepresentation, actionName: string, method?: string) {
        var action = domainObject.actionMembers()[actionName];
        return createUrlInvoke(action.links().linkByRel("urn:org.restfulobjects:rels/details").href() + "/invoke", method);
    }

    export function createUrlInvoke(url: string, method?: string) {
        var result = new Spiro.ActionResultRepresentation();
        result.hateoasUrl = url;
        result.method = method || "POST";
        return result;
    }

    export function persist(domainObject: DomainObjectRepresentation, members, options) {
        var map = domainObject.getPersistMap();
        for (var m in members || {}) {
            map.setMember(m, new Value(members[m]));
        }
        map.save(options);
    }

    export function invokeAction(domainObject: DomainObjectRepresentation, actionName: string, parameters?: Object, options?: Options): void {
        var actionInvoke = createActionInvoke(domainObject, actionName);
        invoke(actionInvoke, parameters, options);
    }

    export function invoke(invoke: ActionResultRepresentation, parameters?: Object, options?: Options): void {

        invoke.attributes = {};

        for (var p in parameters || {}) {
            invoke.setParameter(p, new Value(parameters[p]));
        }

        invoke.fetch(options);
    }

    export function getClassName(obj: any) {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(obj.constructor.toString());
        return (results && results.length > 1) ? results[1] : "";
    }

    export function typeFromUrl(url: string) {
        var typeRegex = /(objects|services)\/([\w|\.]+)/;
        var results = (typeRegex).exec(url);
        return (results && results.length > 2) ? results[2] : "";
    }
}