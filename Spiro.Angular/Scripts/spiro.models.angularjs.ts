//Copyright 2013 Naked Objects Group Ltd
//Licensed under the Apache License, Version 2.0(the "License");
//you may not use this file except in compliance with the License.
//You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
//Unless required by applicable law or agreed to in writing, software
//distributed under the License is distributed on an "AS IS" BASIS,
//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.

// ABOUT THIS FILE:
// spiro.models defines a set of classes that correspond directly to the JSON representations returned by Restful Objects
// resources.  These classes provide convenient methods for navigating the contents of those representations, and for
// following links to other resources.


module Spiro {


    export class SpiroModel {

        constructor(private obj: Object) {
        }

        public get (id: string) {
            return this.obj[id];
        }
    }

    export class HateoasModelBase extends SpiroModel implements HateoasModel {
        constructor(object?) {
            super(object);
           // this.url = this.getUrl;
         
        }

        hateoasUrl: string;
        method: string = "GET"; // default to GET 
        private suffix: string = "";

        public url(): string {
            return (this.hateoasUrl) + this.suffix;
        }

        //getUrl(): string {
        //    return (this.hateoasUrl) + this.suffix;
        //}

        error(originalModel, resp, iOptions) {
            var rs = resp.responseText ? $.parseJSON(resp.responseText) : {};
            var warnings = resp.getResponseHeader("Warning");
           // this.trigger("error", new ErrorMap(rs, resp.status, warnings));
        }
      
    }


    export class ErrorMap extends HateoasModelBase {

        constructor(map: Object, public statusCode: string, public warningMessage: string) {
            super(map);
        }

        values(): ErrorValueMap {
            var vs: ErrorValueMap = {};

            //for (var v in this.attributes) {

            //    if (this.attributes[v].hasOwnProperty("value")) {
            //        var ev: ErrorValue = {
            //            value: new Value(this.attributes[v].value),
            //            invalidReason: this.attributes[v].invalidReason
            //        };
            //        vs[v] = ev;
            //    }
            //}

            return vs;
        }

        invalidReason() {
            return this.get("x-ro-invalid-reason");
        }
    }


    export class ArgumentMap extends HateoasModelBase {

        constructor(map: Object, parent: SpiroModel, public id: string, link: Link) {
            super(map);

            link.copyToHateoasModel(this);

            this.id = id;

            //this.on("requestFailed", (args) => {
            //    parent.trigger("requestFailed", args);
            //});

            //this.on("requestSucceeded", (args) => {
            //    parent.trigger("requestSucceeded", args);
            //});
        }
    }

    export class UpdateMap extends ArgumentMap {
        constructor(domainObject: DomainObjectRepresentation, map: Object) {
            super(map, domainObject, domainObject.instanceId(), domainObject.updateLink());

            for (var member in this.properties()) {
                var currentValue = domainObject.propertyMembers()[member].value();
                this.setProperty(member, currentValue);
            }

            //this.on("change", () => {
            //    // if the update map changes as a result of server changes (eg title changes) update the 
            //    // associated domain object
            //    domainObject.setFromUpdateMap(this);
            //});
        }

        properties(): ValueMap {
            var pps = {};

            //for (var p in this.attributes) {
            //    pps[p] = new Value(this.attributes[p].value);
            //}

            return pps;
        }

        setProperty(name: string, value: Value) {
           // value.set(this.attributes, name);
        }
    }

    export class AddToRemoveFromMap extends ArgumentMap {
        constructor(collectionResource: CollectionRepresentation, map: Object, add: bool) {
            super(map, collectionResource, collectionResource.instanceId(), add ? collectionResource.addToLink() : collectionResource.removeFromLink());

            //this.on("change", () => {
            //    // if the update map changes as a result of server changes (eg title changes) update the 
            //    // associated property
            //    collectionResource.setFromMap(this);
            //});
        }

        setValue(value: Value) {
           // value.set(this.attributes);
        }
    }

    export class ModifyMap extends ArgumentMap {
        constructor(propertyResource: PropertyRepresentation, map: Object) {
            super(map, propertyResource, propertyResource.instanceId(), propertyResource.modifyLink());

            this.setValue(propertyResource.value());

            //this.on("change", () => {
            //    // if the update map changes as a result of server changes (eg title changes) update the 
            //    // associated property
            //    propertyResource.setFromModifyMap(this);
            //});
        }

        setValue(value: Value) {
           // value.set(this.attributes);
        }
    }

    export class ClearMap extends ArgumentMap {
        constructor(propertyResource: PropertyRepresentation) {
            super({}, propertyResource, propertyResource.instanceId(), propertyResource.clearLink());
        }
    }


    export class PersistMap extends ArgumentMap {

        constructor(domainObject: DomainObjectRepresentation, map: Object) {
            super(map, domainObject, domainObject.instanceId(), domainObject.persistLink());

            //this.on("change", () => {
            //    // if the update map changes as a result of server changes (eg title changes) update the 
            //    // associated domain object
            //    domainObject.setFromPersistMap(this);
            //});
        }

        setMember(name: string, value: Value) {
           // value.set(this.attributes["members"], name);
        }
    }


    export class SpiroCollection {

        constructor() {
        }

        add(model) {

            this.models = [];

            for (var i = 0; i < model.length; i++) {
                var mm = new this.model(model[i]);
                this.models.push(mm);
            }

        
        }

        model: any;

        models: any;

        public url(): string {
            return "";
        }
    }
}