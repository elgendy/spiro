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
// spiro.modern defines the controllers and routing responsible for the interactive behaviour of the Spiro Modern UI.
// It is built on the Backbone.js framework.
// Note that we have named our extensions to Backbone.View  xxxController, as this is what they really are.  We have
// factored out the view rendering responsibilities into spiro.modern.presentations, and the default implementation
// spiro.modern.presentation.handlebars.


/// <reference path="typings/backbone/backbone.d.ts" />
/// <reference path="typings/backbone/backbone.mine.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.models.helpers.ts" />
/// <reference path="spiro.backbone.helpers.ts" />
/// <reference path="spiro.modern.presentations.ts" />

module Spiro.Modern {

    declare var _: any;

    // bind in a caching implementation 
    Spiro.sync = function (method: string, model: Backbone.Model, options?: any) {
        var wrapped = Backbone.cachingSync(Backbone.sync);
        wrapped(method, model, options);
    }

    interface UrlParmMap {
        [parmId: string]: string;
    }

    class FragmentHelper {

        rootUrl: string;
        parmMap: UrlParmMap = {};

        constructor(public initialValue: string) {
            var splitUrl = initialValue.split("?");
            this.rootUrl = splitUrl[0];
            var parms = splitUrl[1];

            if (parms) {
                var splitParms = parms.split("&");

                for (var i = 0; i < splitParms.length ; i++) {
                    var splitParm = splitParms[i].split("=");
                    var pId = splitParm[0];
                    var pVal = splitParm[1];

                    this.parmMap[pId] = pVal;
                }
            }
        }

        hasParms(): bool {
            for (var p in this.parmMap) {
                return true;
            }
            return false;
        }

        private addParm(name: string, fragment: string) {
            this.parmMap[name] = fragment;
        }

        private clearParm(name: string) {
            delete this.parmMap[name];
        }

        private getParm(name: string): string {
            return this.parmMap[name] || "";
        }

        addNested(fragment: string) {
            this.addParm("nested", fragment);
        }

        clearNested() {
            this.clearParm("nested");
        }

        getNested(): string {
            return this.getParm("nested");
        }

        addDialog(fragment: string) {
            this.addParm("dialog", fragment);
        }

        clearDialog() {
            this.clearParm("dialog");
        }

        getDialog(): string {
            return this.getParm("dialog");
        }

        addCollection(fragment: string) {
            this.addParm("collection", fragment);
        }

        clearCollection() {
            this.clearParm("collection");
        }

        getCollection(): string {
            return this.getParm("collection");
        }

        currentValue(): string {
            var url = this.rootUrl;
            if (this.hasParms()) {

                url += "?";
                for (var p in this.parmMap) {
                    url += (p + "=" + this.parmMap[p] + "&");
                }

                url = url.slice(0, -1);
            }
            return url;
        }
    }

    class AppRouter extends Backbone.Router {

        constructor(options?) {
            super(options);
        }

        home() {
            var domainServices = new DomainServicesRepresentation();
            domainServices.hateoasUrl = appPath + "/services";
            ControllerFactory.CreateControllerAndFetch(domainServices, {});
        }

        private redraw(id: string, type: string) {
            var helper = new FragmentHelper(id);

            var obj = new DomainObjectRepresentation();
            obj.hateoasUrl = appPath + type + helper.rootUrl;
            var opt: ModernOptions = { doNotNavigate: true }
            var doc = <DomainObjectController> ControllerFactory.CreateControllerAndFetch(obj, opt);
        }

        service(id: string) {
            this.redraw(id, "/services/");
        }

        object(id: string) {
            this.redraw(id, "/objects/");
        }
    }

    var app = new AppRouter({
        "routes": {
            "": "home",
            "services/*id": "service",
            "objects/*id": "object"
        }
    });

    class PageController extends Backbone.View {

        presentation: Presentation;

        constructor(options?: ModernOptions) {
            super(options);
            _.bindAll(this, 'render');
            this.presentation = presentationFactory.PagePresentation();
            this.presentation.on('home', this.home);
            this.presentation.on('back', this.back);
            this.presentation.on('forward', this.forward);
        }

        changeModel(model: Backbone.Model) {

            if (this.model) {
                this.model.off();
            }

            this.model = model;
            _.each(['change', 'reset', 'draw'], (evt: string) => this.model.on(evt, this.render));

            presentationFactory.PagePresentation(model); // update model
        }

        home(): void {
            app.home();
        }

        back(): void {
            parent.history.back();
        }

        forward(): void {
            parent.history.forward();
        }

        render(): PageController {
            this.presentation.draw();
            return this;
        }
    }

    var pageController = new PageController();

    interface ControllerMapInterface {
        [type: string]: (model: Backbone.Model, options: ModernOptions) => Backbone.View;
    }

    class ControllerFactory {

        private static servicesController(model: DomainServicesRepresentation, options: ModernOptions): Backbone.View {
            pageController.changeModel(model);
            return new ServicesController(model, options);
        }

        private static objectController(model: DomainObjectRepresentation, options: ModernOptions): Backbone.View {
            if (options.nest) {
                return new NestedDomainObjectController(model, options)
            }
            else if (options.row) {
                return new DomainObjectController(model, options)
            }
            pageController.changeModel(model);
            return new DomainObjectController(model, options)
        }

        static ControllerMap: ControllerMapInterface = {
            "HomePageRepresentation": (model: Backbone.Model, options: ModernOptions) => new HomeController(<HomePageRepresentation>model, options),
            "DomainServicesRepresentation": (model: Backbone.Model, options: ModernOptions) => ControllerFactory.servicesController(<DomainServicesRepresentation>model, options),
            "DomainObjectRepresentation": (model: Backbone.Model, options: ModernOptions) => ControllerFactory.objectController(<DomainObjectRepresentation>model, options),
            "ListRepresentation": (model: Backbone.Model, options: ModernOptions) => new ListController(<ListRepresentation>model, options),
            "ActionResultRepresentation": (model: Backbone.Model, options: ModernOptions) => new ResultController(<ActionResultRepresentation>model, options),
            "CollectionRepresentation": (model: Backbone.Model, options: ModernOptions) => new ListController(<CollectionRepresentation>model, options),
            "ActionRepresentation": (model: Backbone.Model, options: ModernOptions) => new ActionController(<ActionRepresentation>model, options),
        }

        static CreateControllerAndFetch(model: Backbone.Model, options: ModernOptions): Backbone.View {
            var controller = ControllerFactory.CreateController(model, options);
            model.fetch();
            return controller;
        }

        static CreateControllerAndDraw(model: Backbone.Model, options: ModernOptions): Backbone.View {
            var controller = ControllerFactory.CreateController(model, options);
            model.trigger("draw");
            return controller;
        }

        static CreateController(model: Backbone.Model, options: ModernOptions): Backbone.View {
            var controller = ControllerFactory.ControllerMap[Helpers.getClassName(model)](model, options);

            if (options.controllerEvent) {
                options.controllerEvent(controller); 
            }

            return controller;
        }
    }

    class ResultController extends Backbone.View {

        constructor(public model: Spiro.ActionResultRepresentation, private options: ModernOptions) {
            super(options);
            _.bindAll(this, 'render');
            _.each(['change', 'reset', 'draw'], (evt: string) => this.model.once(evt, this.render));
            this.model.once('error', (e) => this.trigger("error", e));
        }

        render(): ResultController {
            var result = this.model.result();
            var resultType = this.model.resultType();

            if (resultType === "object") {
                // todo cache more transparently 
                var resultObject = result.object();

                if (resultObject) {
                    this.cache(resultObject);
                    var controller = ControllerFactory.CreateControllerAndDraw(resultObject, this.options);
                }
                else {
                    this.options.actingController.render();
                }
            }

            if (resultType === "list") {
                var resultList = result.list();
                var controller = ControllerFactory.CreateControllerAndDraw(resultList, this.options);
            }

            return this;
        }

        cache(obj: DomainObjectRepresentation) {
            if (obj && obj.selfLink()) {
                obj.id = obj.url();
                sync('cache', obj);
            }
        }
    }

    class ActionController extends Backbone.View {

        presentation: Presentation;

        constructor(public model: Spiro.ActionRepresentation, private options: ModernOptions) {
            super(options);
            this.presentation = presentationFactory.CreatePresentation(this.model, {});

            _.bindAll(this, 'render', 'renderWithError','show', 'go', 'cancel');
            _.each(['change', 'reset', 'draw'], (evt: string) => this.model.on(evt, this.render));

            this.presentation.on("show", this.show);
            this.presentation.on("go", this.go);
            this.presentation.on("cancel", this.cancel);
        }

        getInvoke(values: ValueMap): ActionResultRepresentation {
            var invoke = this.model.getInvoke();

            for (var id in values) {
                invoke.setParameter(id, values[id]);
            }
            return invoke;
        }

        cancel() {
            this.presentation.clear();
            var helper = new FragmentHelper(Backbone.history.getFragment());
            helper.clearDialog();
            app.navigate(helper.currentValue(), { replace: true });
        }

        show(values: ValueMap) {
            var invoke = this.getInvoke(values);
            var ac = ControllerFactory.CreateControllerAndFetch(invoke, { nest: true });
            ac.once("error", this.renderWithError); 
        }

        go(values: ValueMap) {
            var invoke = this.getInvoke(values);
            var ac = ControllerFactory.CreateControllerAndFetch(invoke, { });
            ac.once("error", this.renderWithError);
        }


        navigate() {
            //if (!this.options.doNotNavigate) {
            //    var helper = new FragmentHelper(Backbone.history.getFragment());
            //    helper.addDialog(this.model.actionId());
            //    app.navigate(helper.currentValue());
            //}
        }

        renderWithError(error: ErrorMap): ActionController {
            this.presentation.draw(error);
            return this;
        }

        render(): ActionController {
            this.presentation.draw();
            this.navigate();
            return this;
        }
    }

    class ListController extends Backbone.View {

        private listPresentation: Presentation;
        private tablePresentation: Presentation;
        private presentation: Presentation;
        private rows: DomainObjectRepresentation[];


        listOrCollection: ListOrCollection;

        constructor(model: Spiro.ListRepresentation, options: ModernOptions);
        constructor(model: Spiro.CollectionRepresentation, options: ModernOptions);

        constructor(public model: Backbone.Model, private options: ModernOptions) {
            super(options);

            this.listOrCollection = <ListOrCollection><ListRepresentation>model;
            this.listPresentation = presentationFactory.CreatePresentation(this.model, { list: true });
            this.tablePresentation = presentationFactory.CreatePresentation(this.model, { table: true });

            this.presentation = this.listPresentation; // default to list

            _.bindAll(this, 'render', 'drawHeader', 'table', 'list', 'link', 'cancel');
            _.each(['change', 'reset', 'draw'], (evt: string) => this.model.on(evt, this.render));

            this.listPresentation.on("table", this.table);
            this.tablePresentation.on("list", this.list);
            this.listPresentation.on("link", this.link);
            this.listPresentation.on("cancel", this.cancel);
            this.tablePresentation.on("cancel", this.cancel);
        }

        link(index: number) {
            var target = this.listOrCollection.value().models[index].getTarget();
            ControllerFactory.CreateControllerAndFetch(<DomainObjectRepresentation> target, { nest: true });
        }

        drawHeader(model : DomainObjectRepresentation) {
            this.rows.push(model); 

            if (this.rows.length === this.listOrCollection.value().models.length) {
                // this will draw the header
                this.presentation.draw(this.rows);
            }
        }

        table() {
            this.presentation = this.tablePresentation;
            this.render();
            var links = this.listOrCollection.value();
            this.rows = [];

            for (var i = 0; i < links.models.length; i++) {
                var target = <DomainObjectRepresentation>links.models[i].getTarget();
                var controller = ControllerFactory.CreateControllerAndFetch(target, {
                    row: true,
                    doNotNavigate: true,
                    controllerEvent: (c) => c.on("render", this.drawHeader)
                });
            }
        }

        list() {
            this.presentation = this.listPresentation;
            this.render();
        }

        cancel() {
            this.presentation.clear();
        }

        render(): ListController {
            this.presentation.draw();
            return this;
        }
    }

    class NestedDomainObjectController extends Backbone.View {

        presentation: Presentation;

        constructor(public model: Spiro.DomainObjectRepresentation, private options: ModernOptions) {
            super(options);

            this.presentation = presentationFactory.CreatePresentation(this.model, { nest: true });

            _.bindAll(this, 'render', 'expand', 'link', 'cancel');
            _.each(['change', 'reset', 'draw'], (evt: string) => this.model.on(evt, this.render));

            this.presentation.on("expand", this.expand);
            this.presentation.on("cancel", this.cancel);
            this.presentation.on("link", this.link);
        }

        link(aId: string) {
            var target = <DomainObjectRepresentation>this.model.propertyMember(aId).value().link().getTarget();
            ControllerFactory.CreateControllerAndFetch(target, {});
        }

        expand() {
            var Controller = ControllerFactory.CreateControllerAndDraw(this.model, {});
        }

        cancel() {
            this.presentation.clear();
            var helper = new FragmentHelper(Backbone.history.getFragment());
            helper.clearNested();
            app.navigate(helper.currentValue(), { replace: true });
        }

        objectUrlFragment() {
            return this.model.domainType() + "/" + this.model.instanceId();
        }

        navigate() {
            //if (!this.options.doNotNavigate) {
            //    if (this.model.instanceId()) { // to avoid transients etc 
            //        var helper = new FragmentHelper(Backbone.history.getFragment());
            //        helper.addNested(this.objectUrlFragment());
            //        app.navigate(helper.currentValue());
            //    }
            //}
        }

        render(): NestedDomainObjectController {
            this.presentation.draw();
            this.navigate();
            return this;
        }
    }

    class DomainObjectController extends Backbone.View {

        viewPresentation: Presentation;
        editPresentation: Presentation;
        presentation: Presentation;

        propertyDetails: PropertyRepresentation[];
        propertyDetailsCount: number; 

        constructor(public model: Spiro.DomainObjectRepresentation, private options: ModernOptions) {
            super(options);
            this.viewPresentation = presentationFactory.CreatePresentation(this.model, options);

            _.bindAll(this, 'render', 'renderWithError', 'editSuccess', 'action', 'edit', 'link', 'collection', 'save', 'cancel', 'autocomplete');
            _.each(['change', 'reset', 'draw'], (evt: string) => this.model.on(evt, this.render));

            this.viewPresentation.on("action", this.action);
            this.viewPresentation.on("link", this.link);
            this.viewPresentation.on("collection", this.collection);
            this.viewPresentation.on("edit", this.edit);

            this.editPresentation = presentationFactory.CreatePresentation(this.model, { edit: true });

            this.editPresentation.on("link", this.link);
            this.editPresentation.on("collection", this.collection);
            this.editPresentation.on("save", this.save);
            this.editPresentation.on("cancel", this.cancel);
            this.editPresentation.on("autocomplete", this.autocomplete);

            this.presentation = this.viewPresentation;
        }

        action(aId: string) {
            if (this.model.actionMember(aId).extensions().hasParams) {
                var action = this.model.actionMember(aId).getDetails();
                ControllerFactory.CreateControllerAndFetch(action, { nest: true });
            }
            else {
                var actionResult = Helpers.createActionInvoke(this.model, aId);
                ControllerFactory.CreateControllerAndFetch(actionResult, { nest: true });
            }
        }

        autocomplete(parm) {
            // invoke the matching action 
            var actionResult = Helpers.createActionInvoke(this.model, parm.id + "AutoComplete");
            actionResult.setParameter("name", new Value(parm.val)); 
            actionResult.once("change", parm.callback); 
            actionResult.fetch();
        }

        edit() {
            this.presentation = this.editPresentation;
            this.render();
        }

        save(values: ValueMap) {
            var updateMap = this.model.getUpdateMap();

            _.each(values, (value: Value, name: string) => {
                updateMap.setProperty(name, value);
            });

            updateMap.once("error", this.renderWithError);
            updateMap.once("success", this.editSuccess); 

            var options = {
                success: () => updateMap.trigger("success")
            }

            updateMap.save(options); 
        }

        cancel() {
            this.presentation = this.viewPresentation;
            this.render();
        }

        link(aId: string) {
            var target = <DomainObjectRepresentation>this.model.propertyMember(aId).value().link().getTarget();
            ControllerFactory.CreateControllerAndFetch(target, { nest: true });
        }

        collection(aId: string) {
            var target = <CollectionRepresentation>this.model.collectionMember(aId).getDetails();
            ControllerFactory.CreateControllerAndFetch(target, { nest: true });
        }

        serviceUrlFragment() {
            return "services/" + this.model.serviceId();
        }

        objectUrlFragment() {
            if (this.model.persistLink()) {
                // transient
                return "objects/" + this.model.extensions().domainType;
            }

            return "objects/" + this.model.domainType() + "/" + this.model.instanceId();
        }

        navigate() {
            if (!this.options.doNotNavigate) {
                var fragment = this.model.extensions().isService ? this.serviceUrlFragment() : this.objectUrlFragment();
                app.navigate(fragment);
            }
        }

        editSuccess(): DomainObjectController {
            this.presentation = this.viewPresentation;
            this.render();
            return this; 
        }

        renderWithError(errorMap: ErrorMap): DomainObjectController {
            this.presentation.draw(errorMap);
            this.navigate();
            this.trigger("render", this.model);
            return this;
        }

        render(): DomainObjectController {
            this.presentation.draw();
            this.navigate();
            this.trigger("render", this.model);
            return this;
        }
    }

    class ServicesController extends Backbone.View {

        presentation: Presentation;

        constructor(public model: Spiro.DomainServicesRepresentation, private options: ModernOptions) {
            super(options);
            this.presentation = presentationFactory.CreatePresentation(this.model, {});

            _.bindAll(this, 'render', 'link');
            _.each(['change', 'reset', 'draw'], (evt: string) => this.model.on(evt, this.render));

            this.presentation.on("link", this.link);
        }

        link(aId: number) {
            var service = <DomainObjectRepresentation> this.model.value().models[aId].getTarget();
            ControllerFactory.CreateControllerAndFetch(service, {});
        }

        navigate() {
            if (!this.options.doNotNavigate) {
                app.navigate("");
            }
        }

        render(): ServicesController {
            this.presentation.draw();
            this.navigate();
            return this;
        }
    }

    class HomeController extends Backbone.View {

        constructor(public model: Spiro.HomePageRepresentation, private options: ModernOptions) {
            super(options);
            _.bindAll(this, 'render');
            _.each(['change', 'reset', 'draw'], (evt: string) => this.model.on(evt, this.render));
        }

        navigate() {
            if (!this.options.doNotNavigate) {
                app.navigate("home");
            }
        }

        render(): HomeController {
            this.navigate();
            var domainServices = this.model.getDomainServices()
            ControllerFactory.CreateControllerAndFetch(domainServices, {});
            return this;
        }
    }

    Backbone.history.start();
}