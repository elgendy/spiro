// ABOUT THIS FILE:
// spiro.models defines a set of classes that correspond directly to the JSON representations returned by Restful Objects
// resources.  These classes provide convenient methods for navigating the contents of those representations, and for
// following links to other resources.

/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/backbone/backbone.d.ts" />

declare var _: any;

declare var appPath: any;

module Spiro {

    export var sync = function (method: string, model: Backbone.Model, options?: any) {
        Backbone.sync(method, model, options);
    }

    // TODO should we implement an event cascade ? 
    // eg when you 'get' a resource from another resource shoul;d it wire it up so that 
    // events are passed up to parent resources ? 

    // option helpers 
    export interface Options {
        success?: (originalModel, resp, iOptions) => void;
        error?: (originalModel, resp, iOptions) => void;
    }


    function isScalarType(typeName: string) {
        return typeName === "string" || typeName === "number" || typeName === "boolean" || typeName === "integer";
    }

    // interfaces 

    export interface HateoasModel {
        hateoasUrl: string;
        method: string;
        url: any;
    }

    export interface Extensions {
        friendlyName: string;
        description: string;
        returnType: string;
        optional: bool;
        hasParams: bool;
        elementType: string;
        domainType: string;
        pluralName: string;
        format: string;
        memberOrder: number;
        isService: bool;
    }

    export interface OptionalCapabilities {
        blobsClobs: string;
        deleteObjects: string;
        domainModel: string;
        protoPersistentObjects: string;
        validateOnly: string;
    }

    // rel helper class 
    export class Rel {

        ns: string = "";
        uniqueValue: string;
        parms: string[] = [];

        constructor(public asString: string) {
            this.decomposeRel();
        }

        private decomposeRel() {

            var postFix: string;

            if (this.asString.substring(0, 3) === "urn") {
                // namespaced 
                this.ns = this.asString.substring(0, this.asString.indexOf("/") + 1);
                postFix = this.asString.substring(this.asString.indexOf("/") + 1);
            }
            else {
                postFix = this.asString;
            }

            var splitPostFix = postFix.split(";");

            this.uniqueValue = splitPostFix[0];

            if (splitPostFix.length > 1) {
                this.parms = splitPostFix.slice(1);
            }
        }
    }

    // Media type helper class 
    export class MediaType {

        applicationType: string;
        profile: string;
        xRoDomainType: string;
        representationType: string;
        domainType: string;

        constructor(public asString: string) {
            this.decomposeMediaType();
        }

        private decomposeMediaType() {

            var parms = this.asString.split(";");

            if (parms.length > 0) {
                this.applicationType = parms[0];
            }

            for (var i = 1; i < parms.length; i++) {
                if ($.trim(parms[i]).substring(0, 7) === "profile") {
                    this.profile = $.trim(parms[i]);
                    var profileValue = $.trim(this.profile.split("=")[1].replace(/\"/g, ''));
                    this.representationType = $.trim(profileValue.split("/")[1]);
                }
                if ($.trim(parms[i]).substring(0, 16) === "x-ro-domain-type") {
                    this.xRoDomainType = $.trim(parms[i]);
                    this.domainType = $.trim(this.xRoDomainType.split("=")[1].replace(/\"/g, ''));
                }
            }
        }
    }

    // helper class for values 
    export class Value {

        private wrapped: any;

        constructor(raw: any) {
            // can only be Link, number, boolean, string or null    

            if (raw instanceof Link) {
                this.wrapped = raw;
            }
            else if (raw && raw.href) {
                this.wrapped = new Link(raw);
            }
            else {
                this.wrapped = raw;
            }
        }

        isReference(): bool {
            return this.wrapped instanceof Link;
        }

        isNull(): bool {
            return this.wrapped == null;
        }

        link(): Link {
            if (this.isReference()) {
                return <Link>this.wrapped;
            }
            return null;
        }

        scalar(): Object {
            if (this.isReference()) {
                return null;
            }
            return this.wrapped;
        }

        toString(): string {
            if (this.isReference()) {
                return this.link().title();
            }
            return (this.wrapped == null) ? "" : this.wrapped.toString();
        }

        toValueString(): string {
            if (this.isReference()) {
                return this.link().href();
            }
            return (this.wrapped == null) ? "" : this.wrapped.toString();
        }

        set (target: Object, name?: string) {
            if (name) {
                var t = target[name] = {};
                this.set(t);
            }
            else {
                if (this.isReference()) {
                    target["value"] = { "href": this.link().href() };
                }
                else {
                    target["value"] = this.scalar();
                }
            }
        }
    }

    export interface ValueMap {
        [index: string]: Value;
    }

    export interface ErrorValue {
        value: Value;
        invalidReason: string;
    }

    export interface ErrorValueMap {
        [index: string]: ErrorValue;
    }

    // helper class for results 
    export class Result {
        constructor(public wrapped, private resultType: string) { }

        object(): DomainObjectRepresentation {
            if (!this.isNull() && this.resultType == "object") {
                return new DomainObjectRepresentation(this.wrapped);
            }
            return null;
        }

        list(): ListRepresentation {
            if (!this.isNull() && this.resultType == "list") {
                return new ListRepresentation(this.wrapped);
            }
            return null;
        }

        scalar(): ScalarValueRepresentation {
            if (!this.isNull() && this.resultType == "scalar") {
                return new ScalarValueRepresentation(this.wrapped);
            }
            return null;
        }

        isNull(): bool {
            return this.wrapped == null;
        }

        isVoid(): bool {
            return (this.resultType == "void");
        }
    }

    // base class for nested representations 
    export class NestedRepresentation {
        constructor(public wrapped) { }

        links(): Links {
            return Links.WrapLinks(this.wrapped.links);
        }

        extensions(): Extensions {
            return this.wrapped.extensions;
        }
    }

    // base class for all representations that can be directly loaded from the server 
    export class HateoasModelBase extends Backbone.Model implements HateoasModel {
        constructor(object?) {
            super(object);
            this.url = this.getUrl;
            this.once('error', this.error);
        }

        hateoasUrl: string;
        method: string = "GET"; // default to GET 
        private suffix: string = "";

        url: any;

        getUrl(): string {
            return (this.hateoasUrl || super.url()) + this.suffix;
        }

        error(originalModel, resp, iOptions) {
            var rs = resp.responseText ? $.parseJSON(resp.responseText) : {};
            var warnings = resp.getResponseHeader("Warning");
            this.trigger("error", new ErrorMap(rs, resp.status, warnings));
        }

        private appendUrlSuffix() {
            this.suffix = "";
            var asJson = this.toJSON();

            if (_.toArray(asJson).length > 0) {
                var map = JSON.stringify(asJson);
                var encodedMap = encodeURI(map);
                this.suffix = "?" + encodedMap;
            }
        }

        fetch(options?) {
            if (this.method === "GET") {
                this.appendUrlSuffix();
                super.fetch(options);
            }
            else if (this.method === "POST") {
                super.save(null, options);
            }
            else if (this.method === "PUT") {
                // set id so not new ? 
                super.save(null, options);
            }
            else if (this.method === "DELETE") {
                this.appendUrlSuffix();
                super.destroy(options);
            }
        }

        save(options?) {
            super.save(null, options);
        }

        destroy(options?) {
            this.appendUrlSuffix();
            super.destroy(options);
        }

        sync(method, model, options) {
            model.id = model.url();
            sync(method, model, options);
        }
    }

    export class ErrorMap extends HateoasModelBase {

        constructor(map: Object, public statusCode: string, public warningMessage: string) {
            super(map);
        }

        values(): ErrorValueMap {
            var vs: ErrorValueMap = {};

            for (var v in this.attributes) {

                if (this.attributes[v].hasOwnProperty("value")) {
                    var ev: ErrorValue = {
                        value: new Value(this.attributes[v].value),
                        invalidReason: this.attributes[v].invalidReason
                    };
                    vs[v] = ev;
                }
            }

            return vs;
        }

        invalidReason() {
            return this.get("x-ro-invalid-reason");
        }
    }


    export class ArgumentMap extends HateoasModelBase {

        constructor(map: Object, parent: Backbone.Model, public id: string, link: Link) {
            super(map);

            link.copyToHateoasModel(this);

            this.id = id;

            this.on("requestFailed", (args) => {
                parent.trigger("requestFailed", args);
            });

            this.on("requestSucceeded", (args) => {
                parent.trigger("requestSucceeded", args);
            });
        }
    }

    export class UpdateMap extends ArgumentMap {
        constructor(domainObject: DomainObjectRepresentation, map: Object) {
            super(map, domainObject, domainObject.instanceId(), domainObject.updateLink());

            for (var member in this.properties()) {
                var currentValue = domainObject.propertyMembers()[member].value();
                this.setProperty(member, currentValue);
            }

            this.on("change", () => {
                // if the update map changes as a result of server changes (eg title changes) update the 
                // associated domain object
                domainObject.setFromUpdateMap(this);
            });
        }

        properties(): ValueMap {
            var pps = {};

            for (var p in this.attributes) {
                pps[p] = new Value(this.attributes[p].value);
            }

            return pps;
        }

        setProperty(name: string, value: Value) {
            value.set(this.attributes, name);
        }
    }

    export class AddToRemoveFromMap extends ArgumentMap {
        constructor(collectionResource: CollectionRepresentation, map: Object, add: bool) {
            super(map, collectionResource, collectionResource.instanceId(), add ? collectionResource.addToLink() : collectionResource.removeFromLink());

            this.on("change", () => {
                // if the update map changes as a result of server changes (eg title changes) update the 
                // associated property
                collectionResource.setFromMap(this);
            });
        }

        setValue(value: Value) {
            value.set(this.attributes);
        }
    }

    export class ModifyMap extends ArgumentMap {
        constructor(propertyResource: PropertyRepresentation, map: Object) {
            super(map, propertyResource, propertyResource.instanceId(), propertyResource.modifyLink());

            this.setValue(propertyResource.value());

            this.on("change", () => {
                // if the update map changes as a result of server changes (eg title changes) update the 
                // associated property
                propertyResource.setFromModifyMap(this);
            });
        }

        setValue(value: Value) {
            value.set(this.attributes);
        }
    }

    export class ClearMap extends ArgumentMap {
        constructor(propertyResource: PropertyRepresentation) {
            super({}, propertyResource, propertyResource.instanceId(), propertyResource.clearLink());
        }
    }

    // backbone helper - collection of Links 
    export class Links extends Backbone.Collection implements HateoasModel {

        // cannot use constructor to initialise as model property is not yet set and so will 
        // not create members of correct type 
        constructor() {
            super();
            this.url = this.getUrl;
        }

        hateoasUrl: string;
        method: string;
        url: any;

        getUrl(): string {
            return this.hateoasUrl || super.url();
        }

        model = Link;

        models: Link[];

        parse(response) {
            return response.value;
        }

        static WrapLinks(links: any): Links {
            var ll = new Links();
            ll.add(links);
            return ll;
        }

        // returns first link of rel
        private getLinkByRel(rel: Rel): Link {
            return _.find(this.models, (i: Link) => {
                return i.rel().uniqueValue === rel.uniqueValue;
            });
        }

        linkByRel(rel: string) {
            return this.getLinkByRel(new Rel(rel));
        }
    }


    // REPRESENTATIONS

    export class ResourceRepresentation extends HateoasModelBase {
        constructor(object?) {
            super(object);
        }

        private lazyLinks: Links; 

        links(): Links {
            this.lazyLinks = this.lazyLinks || Links.WrapLinks(this.get("links"));
            return this.lazyLinks;
        }

        extensions(): Extensions {
            return this.get("extensions");
        }
    }

    // matches a action invoke resource 19.0 representation 

    export class ActionResultRepresentation extends ResourceRepresentation {

        constructor(object?) {
            super(object);
        }

        // links 
        selfLink(): Link {
            return this.links().linkByRel("self");
        }

        // link representations 
        getSelf(): ActionResultRepresentation {
            return <ActionResultRepresentation> this.selfLink().getTarget();
        }

        // properties 
        resultType(): string {
            return this.get("resultType");
        }

        result(): Result {
            return new Result(this.get("result"), this.resultType());
        }

        // helper
        setParameter(name: string, value: Value) {
            value.set(this.attributes, name);
        }
    }

    // matches an action representation 18.0 

    // matches 18.2.1
    export class Parameter extends NestedRepresentation {
        constructor(wrapped, public parent : ActionRepresentation) {
            super(wrapped);
        }

        // properties 
        choices(): Value[] {
            if (this.wrapped.choices) {
                return _.map(this.wrapped.choices, (item) => new Value(item));
            }
            return null;
        }

        default(): Value {
            return new Value(this.wrapped.default);
        }

        // helper
        isScalar(): bool {
            return isScalarType(this.extensions().returnType);
        }
    }

    export interface ParameterMap {
        [index: string]: Parameter;
    }

    export class ActionRepresentation extends ResourceRepresentation {

        // links 
        selfLink(): Link {
            return this.links().linkByRel("self");
        }

        upLink(): Link {
            return this.links().linkByRel("up");
        }

        invokeLink(): Link {
            return this.links().linkByRel("urn:org.restfulobjects:rels/invoke");
        }

        // linked representations 
        getSelf(): ActionRepresentation {
            return <ActionRepresentation> this.selfLink().getTarget();
        }

        getUp(): DomainObjectRepresentation {
            return <DomainObjectRepresentation> this.upLink().getTarget();
        }

        getInvoke(): ActionResultRepresentation {
            return <ActionResultRepresentation> this.invokeLink().getTarget();
        }

        // properties 

        actionId(): string {
            return this.get("id");
        }

        private parameterMap: ParameterMap;

        private initParameterMap(): void {

            if (!this.parameterMap) {
                this.parameterMap = {};

                var parameters = this.get("parameters");

                for (var m in parameters) {
                    var parameter = new Parameter(parameters[m], this);
                    this.parameterMap[m] = parameter;
                }
            }
        }

        parameters(): ParameterMap {
            this.initParameterMap();
            return this.parameterMap;
        }

        disabledReason(): string {
            return this.get("disabledReason");
        }
    }

    export interface ListOrCollection {
        value(): Links;
    }

    // matches a collection representation 17.0 
    export class CollectionRepresentation extends ResourceRepresentation implements ListOrCollection {

        // links 
        selfLink(): Link {
            return this.links().linkByRel("self");
        }

        upLink(): Link {
            return this.links().linkByRel("up");
        }

        addToLink(): Link {
            return this.links().linkByRel("urn:org.restfulobjects:rels/add-to");
        }

        removeFromLink(): Link {
            return this.links().linkByRel("urn:org.restfulobjects:rels/remove-from");
        }

        // linked representations 
        getSelf(): CollectionRepresentation {
            return <CollectionRepresentation> this.selfLink().getTarget();
        }

        getUp(): DomainObjectRepresentation {
            return <DomainObjectRepresentation> this.upLink().getTarget();
        }

        setFromMap(map: AddToRemoveFromMap) {
            this.set(map.attributes);
        }

        private addToMap() {
            return this.addToLink().arguments();
        }

        getAddToMap(): AddToRemoveFromMap {
            if (this.addToLink()) {
                return new AddToRemoveFromMap(this, this.addToMap(), true);
            }
            return null;
        }

        private removeFromMap() {
            return this.removeFromLink().arguments();
        }

        getRemoveFromMap(): AddToRemoveFromMap {
            if (this.removeFromLink()) {
                return new AddToRemoveFromMap(this, this.removeFromMap(), false);
            }
            return null;
        }

        // properties 

        instanceId(): string {
            return this.get("id");
        }

        value(): Links {
            return Links.WrapLinks(this.get("value"));
        }

        disabledReason(): string {
            return this.get("disabledReason");
        }
    }

    // matches a property representation 16.0 
    export class PropertyRepresentation extends ResourceRepresentation {

        // links 
        modifyLink(): Link {
            return this.links().linkByRel("urn:org.restfulobjects:rels/modify");
        }

        clearLink(): Link {
            return this.links().linkByRel("urn:org.restfulobjects:rels/clear");
        }

        selfLink(): Link {
            return this.links().linkByRel("self");
        }

        upLink(): Link {
            return this.links().linkByRel("up");
        }

        private modifyMap() {
            return this.modifyLink().arguments();
        }

        // linked representations 
        getSelf(): PropertyRepresentation {
            return <PropertyRepresentation> this.selfLink().getTarget();
        }

        getUp(): DomainObjectRepresentation {
            return <DomainObjectRepresentation> this.upLink().getTarget();
        }

        setFromModifyMap(map: ModifyMap) {
            this.set(map.attributes);
        }

        getModifyMap(): ModifyMap {
            if (this.modifyLink()) {
                return new ModifyMap(this, this.modifyMap());
            }
            return null;
        }

        getClearMap(): ClearMap {
            if (this.clearLink()) {
                return new ClearMap(this);
            }
            return null;
        }

        // properties 

        instanceId(): string {
            return this.get("id");
        }

        value(): Value {
            return new Value(this.get("value"));
        }

        choices(): Value[] {
            var ch = this.get("choices");
            if (ch) {
                return _.map(ch, (item) => new Value(item));
            }
            return null;
        }

        disabledReason(): string {
            return this.get("disabledReason");
        }

        // helper 
        isScalar(): bool {
            return isScalarType(this.extensions().returnType);
        }
    }


    // matches a domain object representation 14.0 

    // base class for 14.4.1/2/3
    export class Member extends NestedRepresentation {
        constructor(wrapped, public parent : DomainObjectRepresentation) {
            super(wrapped);
        }

        update(newValue) {
            this.wrapped = newValue;
        }

        memberType(): string {
            return this.wrapped.memberType;
        }

        detailsLink(): Link {
            return this.links().linkByRel("urn:org.restfulobjects:rels/details");
        }

        disabledReason(): string {
            return this.wrapped.disabledReason;
        }

        isScalar(): bool {
            return isScalarType(this.extensions().returnType);
        }

        static WrapMember(toWrap, parent): Member {

            if (toWrap.memberType === "property") {
                return new PropertyMember(toWrap, parent);
            }

            if (toWrap.memberType === "collection") {
                return new CollectionMember(toWrap, parent);
            }

            if (toWrap.memberType === "action") {
                return new ActionMember(toWrap, parent);
            }

            return null;
        }
    }

    // matches 14.4.1
    export class PropertyMember extends Member {
        constructor(wrapped, parent) {
            super(wrapped, parent)
        }

        value(): Value {
            return new Value(this.wrapped.value);
        }

        update(newValue): void {
            super.update(newValue);
        }

        getDetails(): PropertyRepresentation {
            return <PropertyRepresentation> this.detailsLink().getTarget();
        }
    }

    // matches 14.4.2 
    export class CollectionMember extends Member {
        constructor(wrapped, parent) {
            super(wrapped, parent)
        }

        value(): DomainObjectRepresentation[] {

            if (this.wrapped.value && this.wrapped.value.length) {

                var valueArray = [];

                for (var i = 0; i < this.wrapped.value.length; i++) {
                    valueArray[i] = new DomainObjectRepresentation(this.wrapped.value[i]);
                }

                return valueArray;
            }
            return [];
        }

        size(): number {
            return this.wrapped.size;
        }

        getDetails(): CollectionRepresentation {
            return <CollectionRepresentation> this.detailsLink().getTarget();
        }
    }

    // matches 14.4.3 
    export class ActionMember extends Member {
        constructor(wrapped, parent) {
            super(wrapped, parent)
        }

        getDetails(): ActionRepresentation {
            return <ActionRepresentation> this.detailsLink().getTarget();
        }
    }

    export interface MemberMap {
        [index: string]: Member;
    }

    export interface PropertyMemberMap {
        [index: string]: PropertyMember;
    }

    export interface CollectionMemberMap {
        [index: string]: CollectionMember;
    }

    export interface ActionMemberMap {
        [index: string]: ActionMember;
    }


    export class DomainObjectRepresentation extends ResourceRepresentation {

        constructor(object?) {
            super(object);
            this.url = this.getUrl;
        }

        getUrl(): string {
            return this.hateoasUrl || this.selfLink().href() || super.url();
        }

        title(): string {
            return this.get("title");
        }

        domainType(): string {
            return this.get("domainType");
        }

        serviceId(): string {
            return this.get("serviceId");
        }

        links(): Links {
            return Links.WrapLinks(this.get("links"));
        }

        instanceId(): string {
            return this.get("instanceId");
        }

        extensions(): Extensions {
            return this.get("extensions");
        }

        private memberMap: MemberMap;
        private propertyMemberMap: PropertyMemberMap;
        private collectionMemberMap: CollectionMemberMap;
        private actionMemberMap: ActionMemberMap;

        private resetMemberMaps() {
            this.memberMap = {};
            this.propertyMemberMap = {};
            this.collectionMemberMap = {};
            this.actionMemberMap = {};

            var members = this.get("members");

            for (var m in members) {
                var member = Member.WrapMember(members[m], this);
                this.memberMap[m] = member;

                if (member.memberType() === "property") {
                    this.propertyMemberMap[m] = <PropertyMember> member;
                }
                else if (member.memberType() === "collection") {
                    this.collectionMemberMap[m] = <CollectionMember> member;
                }
                else if (member.memberType() === "action") {
                    this.actionMemberMap[m] = <ActionMember> member;
                }
            }
        }

        private initMemberMaps() {
            if (!this.memberMap) {
                this.resetMemberMaps();
            }
        }

        members(): MemberMap {
            this.initMemberMaps();
            return this.memberMap;
        }

        propertyMembers(): PropertyMemberMap {
            this.initMemberMaps();
            return this.propertyMemberMap;
        }

        collectionMembers(): CollectionMemberMap {
            this.initMemberMaps();
            return this.collectionMemberMap;
        }

        actionMembers(): ActionMemberMap {
            this.initMemberMaps();
            return this.actionMemberMap;
        }

        member(id: string): Member {
            return this.members()[id];
        }

        propertyMember(id: string): PropertyMember {
            return this.propertyMembers()[id];
        }

        collectionMember(id: string): CollectionMember {
            return this.collectionMembers()[id];
        }

        actionMember(id: string): ActionMember {
            return this.actionMembers()[id];
        }

        updateLink(): Link {
            return this.links().linkByRel("urn:org.restfulobjects:rels/update");
        }

        persistLink(): Link {
            return this.links().linkByRel("urn:org.restfulobjects:rels/persist");
        }

        selfLink(): Link {
            return this.links().linkByRel("self");
        }

        private updateMap() {
            return this.updateLink().arguments();
        }

        private persistMap() {
            return this.persistLink().arguments();
        }

        // linked representations 
        getSelf(): DomainObjectRepresentation {
            return <DomainObjectRepresentation> this.selfLink().getTarget();
        }

        getPersistMap(): PersistMap {
            return new PersistMap(this, this.persistMap());
        }

        getUpdateMap(): UpdateMap {
            return new UpdateMap(this, this.updateMap());
        }

        setFromUpdateMap(map: UpdateMap) {
            for (var member in this.members()) {
                var m = this.members()[member];
                m.update(map.attributes["members"][member]);
            }

            // to trigger an update on the domainobject
            this.set(map.attributes);
        }

        setFromPersistMap(map: PersistMap) {
            // to trigger an update on the domainobject
            this.set(map.attributes);
            this.resetMemberMaps();
        }

        fetch(options?) {
            this.memberMap = null; // to ensure everything gets reset
            super.fetch(options);
        }
    }

    // matches scalar representation 12.0 
    export class ScalarValueRepresentation extends NestedRepresentation {
        constructor(wrapped) {
            super(wrapped)
        }

        value(): Value {
            return new Value(this.wrapped.value);
        }
    }

    // matches List Representation 11.0
    export class ListRepresentation extends ResourceRepresentation implements ListOrCollection {

        constructor(object?) {
            super(object);
        }

        // links
        selfLink(): Link {
            return this.links().linkByRel("self");
        }

        // linked representations 
        getSelf(): ListRepresentation {
            return <ListRepresentation> this.selfLink().getTarget();
        }

        // list of links to services 
        value(): Links {
            return Links.WrapLinks(this.get("value"));
        }
    }

    // matches the error representation 10.0 
    export class ErrorRepresentation extends ResourceRepresentation {
        constructor(object?) {
            super(object);
        }

        // scalar properties 
        message(): string {
            return this.get("message");
        }

        stacktrace(): string[] {
            return this.get("stacktrace");
        }

        causedBy(): ErrorRepresentation {
            var cb = this.get("causedBy");
            return cb ? new ErrorRepresentation(cb) : null;
        }
    }

    // matches Objects of Type Resource 9.0 
    export class PersistMap extends ArgumentMap {

        constructor(domainObject: DomainObjectRepresentation, map: Object) {
            super(map, domainObject, domainObject.instanceId(), domainObject.persistLink());

            this.on("change", () => {
                // if the update map changes as a result of server changes (eg title changes) update the 
                // associated domain object
                domainObject.setFromPersistMap(this);
            });
        }

        setMember(name: string, value: Value) {
            value.set(this.attributes["members"], name);
        }
    }

    // matches the version representation 8.0 
    export class VersionRepresentation extends ResourceRepresentation {
        constructor() {
            super();
        }

        // links 
        selfLink(): Link {
            return this.links().linkByRel("self");
        }

        upLink(): Link {
            return this.links().linkByRel("up");
        }

        // linked representations 
        getSelf(): VersionRepresentation {
            return <VersionRepresentation> this.selfLink().getTarget();
        }

        getUp(): HomePageRepresentation {
            return <HomePageRepresentation> this.upLink().getTarget();
        }

        // scalar properties 
        specVersion(): string {
            return this.get("specVersion");
        }

        implVersion(): string {
            return this.get("implVersion");
        }

        optionalCapabilities(): OptionalCapabilities {
            return this.get("optionalCapabilities");
        }
    }

    // matches Domain Services Representation 7.0
    export class DomainServicesRepresentation extends ListRepresentation {

        // links
        upLink(): Link {
            return this.links().linkByRel("up");
        }

        // linked representations 
        getSelf(): DomainServicesRepresentation {
            return <DomainServicesRepresentation> this.selfLink().getTarget();
        }

        getUp(): HomePageRepresentation {
            return <HomePageRepresentation> this.upLink().getTarget();
        }
    }

    // matches the user representation 6.0
    export class UserRepresentation extends ResourceRepresentation {

        // links 
        selfLink(): Link {
            return this.links().linkByRel("self");
        }

        upLink(): Link {
            return this.links().linkByRel("up");
        }

        // linked representations 
        getSelf(): UserRepresentation {
            return <UserRepresentation> this.selfLink().getTarget();
        }

        getUp(): HomePageRepresentation {
            return <HomePageRepresentation> this.upLink().getTarget();
        }

        // scalar properties 
        userName(): string {
            return this.get("userName");
        }
        friendlyName(): string {
            return this.get("friendlyName");
        }
        email(): string {
            return this.get("email");
        }
        roles(): string[] {
            return this.get("roles");
        }
    }

    // matches the home page representation  5.0 
    export class HomePageRepresentation extends ResourceRepresentation {

        constructor() {
            super();
            this.hateoasUrl = appPath;
        }

        // links 
        serviceLink(): Link {
            return this.links().linkByRel("urn:org.restfulobjects:rels/services");
        }

        userLink(): Link {
            return this.links().linkByRel("urn:org.restfulobjects:rels/user");
        }

        selfLink(): Link {
            return this.links().linkByRel("self");
        }

        versionLink(): Link {
            return this.links().linkByRel("urn:org.restfulobjects:rels/version");
        }

        // linked representations 
        getSelf(): HomePageRepresentation {
            return <HomePageRepresentation> this.selfLink().getTarget();
        }

        getUser(): UserRepresentation {
            return <UserRepresentation> this.userLink().getTarget();
        }

        getDomainServices(): DomainServicesRepresentation {
            // cannot use getTarget here as that will just return a ListRepresentation 
            var domainServices = new DomainServicesRepresentation();
            this.serviceLink().copyToHateoasModel(domainServices);
            return domainServices;
        }

        getVersion(): VersionRepresentation {
            return <VersionRepresentation> this.versionLink().getTarget();
        }
    }

    // matches the Link representation 2.7
    export class Link extends Backbone.Model {

        constructor(object?) {
            super(object);
        }

        href(): string {
            return this.get("href");
        }

        method(): string {
            return this.get("method");
        }

        rel(): Rel {
            return new Rel(this.get("rel"));
        }

        type(): MediaType {
            return new MediaType(this.get("type"));
        }

        title(): string {
            return this.get("title");
        }

        arguments(): Object {
            return this.get("arguments");
        }

        copyToHateoasModel(hateoasModel: HateoasModel): void {
            hateoasModel.hateoasUrl = this.href();
            hateoasModel.method = this.method();
        }

        private getHateoasTarget(targetType): HateoasModel {
            var matchingType = this.repTypeToModel[targetType];
            var target: HateoasModel = new matchingType();
            return target;
        }

        private repTypeToModel = {
            "homepage": HomePageRepresentation,
            "user": UserRepresentation,
            "version": VersionRepresentation,
            "list": ListRepresentation,
            "object": DomainObjectRepresentation,
            "object-property": PropertyRepresentation,
            "object-collection": CollectionRepresentation,
            "object-action": ActionRepresentation,
            "action-result": ActionResultRepresentation,
            "error": ErrorRepresentation
        }

        // get the object that this link points to 
        getTarget(): HateoasModel {
            var target = this.getHateoasTarget(this.type().representationType);
            this.copyToHateoasModel(target);
            return target;
        }
    }
}