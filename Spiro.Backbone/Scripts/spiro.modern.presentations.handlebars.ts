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
// spiro.modern.presentations.handlebars creates the various view elements using Handlebars templates
// defined in spiro.modern.presentations.handlebars.templates.  The purpose

/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/backbone/backbone.d.ts" />
/// <reference path="typings/backbone/backbone.mine.d.ts" />
/// <reference path="typings/handlebars/handlebars.d.ts" />
/// <reference path="typings/modernizr/modernizr.d.ts" />
/// <reference path="typings/underscore/underscore.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.models.helpers.ts" />
/// <reference path="spiro.modern.presentations.ts" />

/// <reference path="spiro.modern.presentations.handlebars.templates.ts" />

interface ColourMapItemInterface {
    [index: string]: string;
}

interface ColourMapInterface {
    [index: string]: ColourMapItemInterface;
}

declare var colourMap: ColourMapInterface;
declare var defaultColourArray: ColourMapItemInterface[];
declare var defaultColour: ColourMapItemInterface;

module Spiro.Modern.HandlebarsTemplating {

    var dateFormat = 'dd/mm/yy';

    function hashCode(toHash: string): number {
        var hash = 0, i, char;
        if (toHash.length == 0) return hash;
        for (i = 0; i < toHash.length; i++) {
            char = toHash.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    function getColourMapValues(dt: string): ColourMapItemInterface {
        var map = dt ? colourMap[dt] : defaultColour;
        if (!map) {
            var hash = Math.abs(hashCode(dt));
            var index = hash % 18;
            map = defaultColourArray[index];
            colourMap[dt] = map;
        }
        return map;
    }

    function setColourMapValues(dt: string, context: Object) {
        var map = getColourMapValues(dt);
        _.each(map, (element: string, index: string) => context[index] = element);
        return context;
    }

    function toISODate(d: Date): string {

        function pad(n: number) {
            return n < 10 ? '0' + n : n.toString();
        }

        if (isNaN(d.getTime())) {
            return "";
        }

        return d.getUTCFullYear() + '-'
            + pad(d.getUTCMonth() + 1) + '-'
                + pad(d.getUTCDate()) + 'T'
                    + pad(d.getUTCHours()) + ':'
                        + pad(d.getUTCMinutes()) + ':'
                            + pad(d.getUTCSeconds()) + 'Z';
    }

    function formatDate(value: string): string {
        if (value) {
            var date = new Date(value);
            return (<any>$).datepicker.formatDate(dateFormat, date);
        }
        return "";
    }

    function getTitle(pm: PropertyMember);
    function getTitle(pm: PropertyRepresentation);
    function getTitle(pm: any) {
        var title = pm.value().toString();
        return (pm.extensions().format === "date-time") ? title = formatDate(title) : title;
    }

    function getFieldInput(element: JQuery, isScalar: bool): Value {
        var input = element.find(':input');
        var hiddenInput = element.find(':input[type=hidden]');
        var inputAsCheckbox = element.find(':input[type=checkbox]');
        var input = hiddenInput.length > 0 ? hiddenInput : input; 

        var newValue: any = null;

        if (inputAsCheckbox.length > 0 || input.length > 0) {
            newValue = inputAsCheckbox.length > 0 ? inputAsCheckbox.prop("checked") : input.val();

            if (input.attr('type') == 'date') {
                var dt = new Date(newValue);
                newValue = toISODate(dt);
            }
            newValue = $.trim(newValue);

            if (!isScalar && newValue) {
                newValue = new Link({ "href": newValue });
            }
        } 

        return new Value(newValue);
    }

    interface PresentationMapInterface {
        [type: string]: (model: Backbone.Model, options: ModernOptions) => Presentation;
    }

    class HandlebarsPresentationFactory implements PresentationFactory {

        private pagePresentation: PagePresentation = new PagePresentation();

        private static domainObjectPresentation(model: DomainObjectRepresentation, options: ModernOptions): Presentation {
            if (options.nest) {
                return new NestedObjectPresentation(model);
            }
            else if (options.row) {
                return new TableRowPresentation(model);
            }
            else if (options.edit) {
                return new DomainObjectEditPresentation(model);
            }
            return new DomainObjectPresentation(model);
        }

        private static collectionPresentation(model: ListRepresentation, options: ModernOptions): Presentation {
            return options.table ? <Presentation>new TablePresentation(model) : new ListPresentation(model);
        }

        PresentationMap: PresentationMapInterface = {
            "DomainObjectRepresentation": (model: Backbone.Model, options: ModernOptions) => HandlebarsPresentationFactory.domainObjectPresentation(<DomainObjectRepresentation>model, options),
            "CollectionRepresentation": (model: Backbone.Model, options: ModernOptions) => HandlebarsPresentationFactory.collectionPresentation(<ListRepresentation>model, options),
            "ListRepresentation": (model: Backbone.Model, options: ModernOptions) => HandlebarsPresentationFactory.collectionPresentation(<ListRepresentation>model, options),
            "DomainServicesRepresentation": (model: Backbone.Model, options: ModernOptions) => new ServicesPresentation(<DomainServicesRepresentation>model),
            "ActionRepresentation": (model: Backbone.Model, options: ModernOptions) => new ActionDialogPresentation(<ActionRepresentation>model),
        }

        CreatePresentation(model: Backbone.Model, options: ModernOptions): Presentation {
            return this.PresentationMap[Helpers.getClassName(model)](model, options);
        }

        PagePresentation(model?: Backbone.Model): Presentation {
            if (model) {
                this.pagePresentation.model = model;
            }
            return this.pagePresentation;
        }
    }

    export class EventsMixin implements Backbone.HasEvents {

        constructor() {             
            _.extend(this, Backbone.Events);
        }

        on(event: string, callback, context?) {
        }
        once(event: string, callback, context?) {
        }
        off(event: string, callback, context?) {
        }
        trigger(event: string, args?) {
        }
        stopListening(obj: Object, name: string, callback) {
        }
    }

    class ActionPresentation extends EventsMixin implements Presentation {

        element: JQuery;

        constructor(public model: Spiro.ActionMember, private actionId: string, private parentElement: JQuery) {
            super();
        }

        setupEvents() {
            this.element.find(".action").on("click", (event: JQueryEventObject) => {
                this.trigger("action", this.actionId);
                event.preventDefault();
            });
        }

        clear(): void { }

        draw(): void {
            var context = { "actionName": this.model.extensions().friendlyName, "actionId": this.actionId };
            this.element = $($.parseHTML(templates.actionTemplate(context)));
            this.setupEvents();
            this.parentElement.append(this.element);
        }
    }

    class PropertyEditPresentation extends EventsMixin implements Presentation {

        element: JQuery;

        propertyId: string; 

        constructor(public model: Spiro.PropertyRepresentation, private parentElement: JQuery, private error?: ErrorValue) {
            super();
            this.propertyId = model.id;
        }

        setupEvents() {
            this.element.find("a").on("click", (event: JQueryEventObject) => {
                this.trigger("link", this.model.id);
                event.preventDefault();
            });
        }

        getFieldInput(): Value {
            return getFieldInput(this.element, !this.model.value().isReference());
        }

        clear(): void { }

        appendOptions() {
            var choices = this.model.choices();
            var selectElement = this.element.find("select");
            var currentValue = this.model.value().toValueString();

            _.each(choices, (choice: Value) => {
                var context = {
                    "ChoiceValue": choice.toValueString(),
                    "ChoiceName": choice.toString(),
                };
                var choiceElement = $($.parseHTML(templates.choiceParameterTemplate(context)));

                if (context.ChoiceValue === currentValue) {
                    choiceElement.attr("selected", "selected");
                }

                selectElement.append(choiceElement);
            });
        }

        selectHandler(event, ui ) {
            var hiddenInput = $(this).siblings(":input[type=hidden]"); 
            $(hiddenInput).attr("value", ui.item.link);
            return true;
        }

       clearHandler () {
            var value = $(this).val();

            if (value.length == 0) {
                var hiddenInput = $(this).siblings(":input[type=hidden]")
                $(hiddenInput).attr("value", "");
            }
        }

        commonDraw(isRef: bool, template: any) {
            var title = getTitle(this.model);

            var context = {
                "propertyName": this.model.extensions().friendlyName,
                "propertyValue": title,
                "propertyError": this.error ? this.error.invalidReason : ""
            };

            var url = isRef ? this.model.value().toValueString() : null;

            if (url) {
                context["propertyUrl"] = url;
                var dt = Helpers.typeFromUrl(url);
                setColourMapValues(dt, context);
            }

            this.element = $($.parseHTML(template(context)));

            if (!Modernizr.inputtypes.date) {
                (<any>this.element.find(":input[type=date]").not(".hasDatepicker")).datepicker({ dateFormat: dateFormat });
            }

            var textInput = this.element.find(":input[type=text]");

            if (isRef && !this.model.choices() && textInput.length > 0) {
                (<any>textInput).autocomplete({
                    autoFocus: true,
                    minLength: 2,
                    source: (request, response) => {
                        this.trigger("autocomplete", {
                            id: this.propertyId,
                            val: request.term,
                            callback: (result: ActionResultRepresentation) => {
                                var acData = [];
                                if (result.resultType() == "list") {
                                    var list = result.result().list();
                                    acData = _.map(list.value().models, (link: Link) => { return { label: link.title(), value: link.title(), link: link.href() } });
                                }
                                response(acData);
                            }
                        })
                    },
                    select: this.selectHandler
                });
                textInput.change(this.clearHandler);
            }

            this.setupEvents();
            this.parentElement.append(this.element);
        }

        getScalarEditTemplate() {
            if (this.model.extensions().returnType === "boolean") {
                return templates.boolPropertyTemplate
            }
            else if (this.model.extensions().returnType === "string" && this.model.extensions().format === "date-time") {
                return templates.datePropertyTemplate
            }
            else if (this.model.choices()) {
                return templates.choicesPropertyTemplate;
            }

            return templates.scalarPropertyEditTemplate;
        }

        getReferenceEditTemplate() {
            if (this.model.choices()) {
                return templates.choicesPropertyTemplate;
            }

            return templates.referencePropertyEditTemplate;
        }

        draw(): void {
            var isRef = this.model.value().isReference();
            var template = isRef ? this.getReferenceEditTemplate() : this.getScalarEditTemplate();
            this.commonDraw(isRef, template);
            this.appendOptions();
        }
    }


    class PropertyPresentation extends EventsMixin implements Presentation {

        element: JQuery;

        constructor(public model: Spiro.PropertyMember, public propertyId: string, private parentElement: JQuery) {
            super();
        }

        setupEvents() {
            this.element.find("a").on("click", (event: JQueryEventObject) => {
                this.trigger("link", this.propertyId);
                event.preventDefault();
            });
        }

        clear(): void { }

        draw(): void {
            var isRef = this.model.value().isReference();
            var template = isRef ? templates.referencePropertyTemplate : templates.scalarPropertyTemplate;
            var title = getTitle(this.model);

            var context = {
                "propertyName": this.model.extensions().friendlyName,
                "propertyValue": title,
                "propertyError": ""
            };

            var url = isRef ? this.model.value().toValueString() : null;

            if (url) {
                context["propertyUrl"] = url;
                var dt = Helpers.typeFromUrl(url);
                setColourMapValues(dt, context);
            }

            this.element = $($.parseHTML(template(context)));

            if (!Modernizr.inputtypes.date) {
                (<any>this.element.find(":input[type=date]").not(".hasDatepicker")).datepicker({ dateFormat: dateFormat });
            }

            if (url) {
                this.setupEvents();
            }

            this.parentElement.append(this.element);
        }
    }

    class CollectionMemberPresentation extends EventsMixin implements Presentation {

        element: JQuery;

        constructor(public model: Spiro.CollectionMember, private collectionId: string, private parentElement: JQuery) {
            super();
        }

        setupEvents() {
            this.element.find("a").on("click", (event: JQueryEventObject) => {
                this.trigger("collection", this.collectionId);
                event.preventDefault();
            });
        }

        clear(): void { }

        draw(): void {
            var context = {
                "collectionName": this.model.extensions().friendlyName,
                "collectionSize": this.model.size(),
                "collectionPlural": this.model.extensions().pluralName,
                "collectionUrl": this.model.detailsLink() ? this.model.detailsLink().href() : "" // no link on collections on transients
            };

            setColourMapValues(this.model.extensions().elementType, context);
            this.element = $($.parseHTML(templates.collectionPropertyTemplate(context)));
            this.setupEvents();
            this.parentElement.append(this.element);
        }
    }

    class ParameterPresentation extends EventsMixin implements Presentation {

        element: JQuery;

        constructor(public model: Spiro.Parameter, public parameterId: string, private parentElement: JQuery, private error?: ErrorValue) {
            super();
        }

        getFieldInput(): Value {
            return getFieldInput(this.element, this.model.isScalar());
        }

        setupEvents() {
            this.element.find("a").on("click", (event: JQueryEventObject) => {
                this.trigger("link", this.parameterId);
                event.preventDefault();
            });
        }

        clear(): void { }

        getScalarTemplate() {
            if (this.model.extensions().returnType === "boolean") {
                return templates.boolParameterTemplate
            }
            else if (this.model.extensions().returnType === "string" && this.model.extensions().format === "date-time") {
                return templates.dateParameterTemplate
            }
            else if (this.model.choices()) {
                return templates.choicesParameterTemplate;
            }

            return templates.scalarParameterTemplate;
        }

        getReferenceTemplate() {
            if (this.model.choices()) {
                return templates.choicesParameterTemplate;
            }
            return templates.referenceParameterTemplate;
        }

        appendOptions() {
            var choices = this.model.choices();
            var selectElement = this.element.find("select");

            _.each(choices, (choice: Value) => {
                var context = {
                    "ChoiceValue": choice.isReference() ? choice.link().href() : choice.scalar(),
                    "ChoiceName": choice.toString(),
                };
                var choiceElement = $($.parseHTML(templates.choiceParameterTemplate(context)));
                selectElement.append(choiceElement);
            });
        }

        draw(): void {

            var parameterTemplate = this.model.isScalar() ? this.getScalarTemplate() : this.getReferenceTemplate();
            var dflt = this.model.default();

            var context = {
                "parameterName": this.model.extensions().friendlyName,
                "parameterValue": dflt.toString(),
                "parameterError": this.error ? this.error.invalidReason : ""
            };

            var url = this.model.isScalar() || dflt.isNull() ? null : dflt.link().href();

            if (url) {
                context["parameterUrl"] = url;
                var dt = Helpers.typeFromUrl(url);
                setColourMapValues(dt, context);
            }

            this.element = $($.parseHTML(parameterTemplate(context)));

            this.appendOptions();


            if (!Modernizr.inputtypes.date) {
                (<any>this.element.find("[type=date]").not(".hasDatepicker")).datepicker({ dateFormat: dateFormat });
            }

            if (url) {
                this.setupEvents();
            }

            this.parentElement.append(this.element);
        }
    }

    class ActionDialogPresentation extends EventsMixin implements Presentation {

        element: JQuery;

        parameters: ParameterPresentation[];

        constructor(public model: Spiro.ActionRepresentation) {
            super();
        }

        getParameterValues(): ValueMap {
            var valueMap: ValueMap = {};
            _.each(this.parameters, (parm: ParameterPresentation) => {
                valueMap[parm.parameterId] = parm.getFieldInput();
            });
            return valueMap;
        }

        setupEvents() {
            this.element.find(".cancel").on("click", (event: JQueryEventObject) => {
                this.trigger("cancel");
                event.preventDefault();
            });
            this.element.find(".go").on("click", (event: JQueryEventObject) => {
                this.clearErrors();
                this.trigger("go", this.getParameterValues());
                event.preventDefault();
            });
            this.element.find(".show").on("click", (event: JQueryEventObject) => {
                this.clearErrors();
                this.trigger("show", this.getParameterValues());
                event.preventDefault();
            });
            this.element.on("keyup", (event: JQueryEventObject) => {
                if ((<any>event).keyCode === 13) {
                    this.trigger("show", this.getParameterValues());
                    event.preventDefault();
                }
            });
        }

        clearErrors(): void {
            this.element.find(".error").html("");
        }

        clear(): void {
            this.element.remove();
        }

        draw(errorMap?: ErrorMap): void {
            var parentElement = $(".dialog-pane");
            errorMap = errorMap || new ErrorMap({}, "", "");
            var errors = errorMap.values();
            parentElement.html("");
            this.parameters = [];

            var context = setColourMapValues(this.model.extensions().returnType, {
                "title": this.model.extensions().friendlyName,
                "error": errorMap.invalidReason()
            });

            this.element = this.model.invokeLink().method() === "GET" ? $($.parseHTML(templates.actionDialogQueryTemplate(context))) :
                                                                        $($.parseHTML(templates.actionDialogOtherTemplate(context)));

            var parameters = this.model.parameters();
            var parametersElement = this.element.find(".parameters");

            _.each(parameters, (parameter: Parameter, pId: string) => {
                var error = errors[pId];
                var pp = new ParameterPresentation(parameter, pId, parametersElement, error);
                this.parameters.push(pp);
                pp.draw();
            });

            this.setupEvents();
            parentElement.append(this.element);

            PagePresentation.setMessages(errorMap);
        }
    }

    class ListPresentation extends EventsMixin implements Presentation {

        element: JQuery;

        constructor(public model: Spiro.ListRepresentation) {
            super();
        }

        setupEvents() {
            this.element.find(".table").on("click", (event: JQueryEventObject) => {
                this.trigger("table");
                event.preventDefault();
            });
            this.element.find(".cancel").on("click", (event: JQueryEventObject) => {
                this.trigger("cancel");
                event.preventDefault();
            });
        }

        clear(): void {
            this.element.remove();
        }

        draw(): void {

            var parentElement = $(".collection-pane");
            parentElement.html("");

            var context = setColourMapValues(this.model.extensions().elementType, {
                "collectionSize": this.model.value().models.length,
                "collectionPlural": this.model.extensions().pluralName || "Objects"
            });

            this.element = $($.parseHTML(templates.listTemplate(context)));
            var items = this.model.value().models;
            var itemsElement = this.element.find(".items");

            _.each(items, (link: Link, i: number) => {
                var cip = new ListItemPresentation(link, i, itemsElement);
                cip.on("link", (id) => this.trigger("link", id));
                cip.draw();
            });

            this.setupEvents();
            parentElement.append(this.element);
        }
    }

    class ListItemPresentation extends EventsMixin implements Presentation {

        element: JQuery;

        constructor(public model: Spiro.Link, private index: number, private parentElement: JQuery) {
            super();
        }

        setupEvents() {
            this.element.find("a").on("click", (event: JQueryEventObject) => {
                this.trigger("link", this.index);
                event.preventDefault();
            });
        }

        clear(): void { }

        draw(): void {

            var context = {
                "collectionItemTitle": this.model.title()
            };

            var url = this.model.href();

            if (url) {
                context["collectionItemUrl"] = url;
                var dt = Helpers.typeFromUrl(url);
                setColourMapValues(dt, context);
            }

            this.element = $($.parseHTML(templates.listItemTemplate(context)));

            if (url) {
                this.setupEvents();
            }

            this.parentElement.append(this.element);
        }
    }

    interface HeaderItem {
        id: string;
        name: string;
    }

    class TablePresentation extends EventsMixin implements Presentation {

        element: JQuery;

        constructor(public model: Spiro.ListRepresentation) {
            super();
        }

        setupEvents() {
            this.element.find(".list").on("click", (event: JQueryEventObject) => {
                this.trigger("list");
                event.preventDefault();
            });
            this.element.find(".cancel").on("click", (event: JQueryEventObject) => {
                this.trigger("cancel");
                event.preventDefault();
            });
        }

        clear(): void {
            this.element.remove();
        }

        buildHeader(models: DomainObjectRepresentation[]) {
            var header: HeaderItem[] = [];

            function insertColumns(header: HeaderItem[], model: DomainObjectRepresentation) {

                var members = _.map(model.propertyMembers(), (pm: PropertyMember, id: string) => {
                    return { id: id, name: pm.extensions().friendlyName };
                });

                var headerIndex = 0;
                for (var i = 0; i < members.length; i++) {
                    var curMember = members[i];

                    if (header[headerIndex]) {
                        if (!_.some(header, (item: HeaderItem) => item.id === curMember.id)) {
                            header.splice(headerIndex, 0, curMember);
                            headerIndex++;
                        }
                    }
                    else {
                        header[headerIndex] = curMember
                    }
                    headerIndex++;
                }
            }

            _.each(models, (model: DomainObjectRepresentation) => {
                insertColumns(header, model);
            });

            return header;
        }

        drawHeader(models: DomainObjectRepresentation[]): void {

            var header = this.buildHeader(models);

            var itemsElement = $(".collection-pane .items");

            var headerTemplate = templates.tableRowTemplate;
            itemsElement.prepend(headerTemplate);
            var parentElement = itemsElement.children().first();

            _.each(header, (item: HeaderItem) => {

                var template = templates.tableCellTemplate;

                var context = {
                    "propertyId": item.id,
                    "propertyValue": item.name
                };

                var headerElement = $($.parseHTML(template(context)));
                parentElement.append(headerElement);
            });

            this.alignTableColumns();
        }

        alignTableColumns() {
            var headerCells = $(".collection-pane .items .properties").first().children();
            var rows = $(".collection-pane .items .properties").slice(1);

            function getEmptyCell(id) {
                var template = templates.tableCellTemplate;
                var context = { "propertyId": id, "propertyValue": "" };
                return $($.parseHTML(template(context)));
            }


            function padCells(row: Element) {
                var rowCells = $(row).children();
                var padded = false;

                headerCells.each((index, cell) => {

                    var headerCellId = $(cell).attr('data-id');
                    var curRowCell = $(rowCells[index]);

                    if (curRowCell.length > 0 && curRowCell.attr('data-id') !== headerCellId) {
                        getEmptyCell(headerCellId).insertBefore(curRowCell);
                        padded = true;
                        return false;
                    }
                    else if (curRowCell.length == 0) {
                        var prevRowCell = $(rowCells[index - 1]);
                        getEmptyCell(headerCellId).insertAfter(prevRowCell);
                        padded = true;
                        return false;
                    }
                });
                return padded;
            }

            rows.each((index, row) => {
                // keep calling padCells until it stops padding (returns false)  
                while (padCells(row)) { }
            });
        }


        draw(models?: DomainObjectRepresentation[]): void {
            if (models) {
                this.drawHeader(models);
            }
            else {
                var parentElement = $(".collection-pane");
                parentElement.html("");

                var context = {
                    "collectionSize": this.model.value().models.length,
                    "collectionPlural": this.model.extensions().pluralName || "Objects"
                };

                setColourMapValues(this.model.extensions().elementType, context);
                this.element = $($.parseHTML(templates.tableTemplate(context)));
                this.setupEvents();
                parentElement.append(this.element);
            }
        }
    }


    class TableRowPresentation extends EventsMixin implements Presentation {

        element: JQuery;

        constructor(public model: Spiro.DomainObjectRepresentation) {
            super();
        }

        setupEvents() { }

        clear(): void { }

        draw(): void {
            var parentElement = $(".table-view > .items");
            var context = setColourMapValues(this.model.domainType(), { "title": this.model.title() });

            this.element = $($.parseHTML(templates.tableRowTemplate(context)));


            var properties = this.model.propertyMembers();
            _.each(properties, (property: PropertyMember, pId: string) => {
                var pp = new TableCellPresentation(property, pId, true, this.element);
                pp.on("link", (id) => this.trigger("link", id));
                pp.draw();
            });

            this.setupEvents();
            parentElement.append(this.element);
        }
    }

    class TableCellPresentation extends EventsMixin implements Presentation {

        element: JQuery;

        constructor(public model: Spiro.PropertyMember, public propertyId: string, private isRow: bool, private parentElement: JQuery) {
            super();
        }

        setupEvents() {
            this.element.find("a").on("click", (event: JQueryEventObject) => {
                this.trigger("link", this.propertyId);
                event.preventDefault();
            });
        }

        clear(): void { }

        draw(): void {
            var isRef = this.model.value().isReference();
            var template = templates.tableCellTemplate;

            var title = getTitle(this.model);

            var context = {
                "propertyId": this.propertyId,
                "propertyValue": title
            };

            this.element = $($.parseHTML(template(context)));
            this.parentElement.append(this.element);
        }
    }

    class ObjectPresentation extends EventsMixin {

        element: JQuery;
        editProperties: PropertyEditPresentation[];

        constructor(public model: Spiro.DomainObjectRepresentation) {
            super();
        }

        appendEditProperty(model : PropertyRepresentation, propertiesElement : JQuery) {
            var pp = new PropertyEditPresentation(model, propertiesElement);
            pp.on("link", (id) => this.trigger("link", id));
            pp.on("autocomplete", (id) => this.trigger("autocomplete", id));
            pp.draw();
       
            this.editProperties.push(pp);            
        }

        appendProperties(parentElement: JQuery, errors?: ErrorValueMap, isEdit?: bool) {
            var propertiesElement = parentElement.find(".properties");
            var hasProperties = false;
            this.editProperties = [];

            var properties = this.model.propertyMembers();
            _.each(properties, (property: PropertyMember, pId: string) => {
                var error = (errors || <ErrorValueMap>{})[pId];

                if (isEdit && !property.disabledReason()) {
                    // append edit property
                    var details = property.getDetails();
                    details.once('sync', (details) => this.appendEditProperty(details, propertiesElement));
                    details.fetch();
                }
                else {
                    var pp = new PropertyPresentation(property, pId, propertiesElement);
                    pp.on("link", (id) => this.trigger("link", id));
                    pp.draw();
                }
                hasProperties = true;
            });

            var collections = this.model.collectionMembers();
            _.each(collections, (collection: CollectionMember, cId: string) => {
                var cp = new CollectionMemberPresentation(collection, cId, propertiesElement);
                cp.on("collection", (id) => this.trigger("collection", id));
                cp.draw();
                hasProperties = true;
            });

            return hasProperties;
        }
    }

    class NestedObjectPresentation extends ObjectPresentation implements Presentation {

        constructor(model: Spiro.DomainObjectRepresentation) {
            super(model);
        }

        setupEvents() {
            this.element.find(".expand").on("click", (event: JQueryEventObject) => {
                this.trigger("expand");
                event.preventDefault();
            });
            this.element.find(".cancel").on("click", (event: JQueryEventObject) => {
                this.trigger("cancel");
                event.preventDefault();
            });
        }

        clear(): void {
            this.element.remove();
        }

        drawProperties() {
            this.appendProperties(this.element);
        }

        draw(): void {
            var parentElement = $(".object-pane");
            parentElement.html("");
            var context = setColourMapValues(this.model.domainType(), { "title": this.model.title() });

            this.element = $($.parseHTML(templates.nestedObjectTemplate(context)));
            this.drawProperties();
            this.setupEvents();

            parentElement.append(this.element);
        }
    }

    class DomainObjectEditPresentation extends ObjectPresentation implements Presentation {

        constructor(model: Spiro.DomainObjectRepresentation) {
            super(model);
        }

        clear(): void { }

        getPropertyValues(): ValueMap {
            var valueMap: ValueMap = {};
            _.each(this.editProperties, (prop: PropertyEditPresentation) => {
                valueMap[prop.propertyId] = prop.getFieldInput();
            });
            return valueMap;
        }

        setupEvents() {
            $(".properties-pane").find(".save").on("click", (event: JQueryEventObject) => {
                this.trigger("save", this.getPropertyValues());
                event.preventDefault();
            });

            $(".properties-pane").find(".cancel").on("click", (event: JQueryEventObject) => {
                this.trigger("cancel");
                event.preventDefault();
            });
        }

        drawActions() {
            $(".actions-pane").html("");
        }

        drawProperties(errors: ErrorValueMap) {
            var allProperties = $($.parseHTML(templates.propertiesEditTemplate({})));
            var hasProperties = this.appendProperties(allProperties, errors, true);

            if (hasProperties) {
                $(".properties-pane").html("");
                $(".properties-pane").append(allProperties);
                this.setupEvents();
            }
        }

        draw(errorMap?: ErrorMap): void {
            errorMap = errorMap || new ErrorMap({}, "", "");
            var errors = errorMap.values();
            this.drawActions();
            this.drawProperties(errors);
        }
    }


    class DomainObjectPresentation extends ObjectPresentation implements Presentation {

        constructor(model: Spiro.DomainObjectRepresentation) {
            super(model);
        }

        clear(): void { }

        setupEvents() {
            $(".properties-pane").find(".edit").on("click", (event: JQueryEventObject) => {
                this.trigger("edit");
                event.preventDefault();
            });
            $(".app-bar .edit").on("click", (event: JQueryEventObject) => {
                this.trigger("edit");
                event.preventDefault();
            });
            $(".app-bar .edit").removeClass("disabled");
        }

        drawActions() {
            var allActions = $($.parseHTML(templates.actionsTemplate({})));
            var actionsElement = allActions.find(".actions");
            var actions = this.model.actionMembers();

            _.each(actions, (action: ActionMember, aId: string) => {
                var ap = new ActionPresentation(action, aId, actionsElement);
                ap.on("action", (id) => this.trigger("action", id));
                ap.draw();
            });

            $(".actions-pane").append(allActions);
        }

        drawProperties() {
            var allProperties = $($.parseHTML(templates.propertiesTemplate({})));
            var hasProperties = this.appendProperties(allProperties);

            if (hasProperties) {
                $(".properties-pane").html("");
                $(".properties-pane").append(allProperties);
                this.setupEvents();
            }
        }

        draw(): void {
            this.drawActions();
            this.drawProperties();
        }
    }

    class ServiceLinkPresentation extends EventsMixin implements Presentation {

        element: JQuery;

        constructor(public model: Spiro.Link, private index: number, private parentElement: JQuery) {
            super();
        }

        setupEvents() {
            this.element.find("a").on("click", (event: JQueryEventObject) => {
                this.trigger("link", this.index);
                event.preventDefault();
            });
        }

        clear(): void { }

        draw(): void {
            var url = this.model.href();
            var dt = Helpers.typeFromUrl(url);
            var context = setColourMapValues(dt, { "serviceName": this.model.title(), "serviceUrl": url });

            this.element = $($.parseHTML(templates.serviceLinkTemplate(context)));
            this.setupEvents();
            this.parentElement.append(this.element);
        }
    }

    class PagePresentation extends EventsMixin implements Presentation {

        element: JQuery;
        model: Backbone.Model;

        constructor() {
            super();
            this.setupEvents();
        }

        setupEvents() {
            $(".home").on("click", (event: JQueryEventObject) => {
                this.trigger("home");
                event.preventDefault();
            });
            $(".back").on("click", (event: JQueryEventObject) => {
                this.trigger("back");
                event.preventDefault();
            });
            $(".forward").on("click", (event: JQueryEventObject) => {
                this.trigger("forward");
                event.preventDefault();
            });
        }

        static setMessages(errorMap: ErrorMap) {
            $(".messages").html("");
            if (errorMap && errorMap.warningMessage) {
                $(".messages").append(errorMap.warningMessage);
            }
        }

        clearColour(cls: string[]) {
            _.each(cls, (c: string) => {
                var el = $("." + c);
                el.removeClass();
                el.addClass(c);
            });
        }

        clearColourClasses(): void {
            this.clearColour(["properties-pane", "object-view", "actions-pane"]);
        }

        clearHtml(cls: string[]) {
            _.each(cls, (c: string) => $("." + c).html(""));
        }

        clear(): void {
            this.clearHtml(["properties-pane", "actions-pane", "dialog-pane", "collection-pane", "object-pane", "type"]);
            this.clearColourClasses();
            $(".messages").html("");
            $(".app-bar .edit").off();
            $(".app-bar .edit").addClass("disabled");
        }

        addColourClass(cls: string[], colourMap: ColourMapItemInterface) {
            _.each(cls, (c: string) => {
                $("." + c).addClass("bg-color-" + colourMap["backgroundColor"]);
            });
        }

        draw(): void {
            var title: string;
            var colourMap: ColourMapItemInterface;
            var type: string;

            if (this.model instanceof DomainObjectRepresentation) {
                var dor = <DomainObjectRepresentation>this.model;
                title = dor.title();
                colourMap = getColourMapValues(dor.domainType() || dor.serviceId());
                type = dor.extensions().friendlyName;
            }
            else {
                title = "Services";
                colourMap = getColourMapValues("");
                type = "Domain Services";
            }

            this.clear();
            this.addColourClass(["object-view", "properties-pane", "actions-pane"], colourMap);

            $(".type").text(type);
            $(".title").text(title);
        }
    }

    class ServicesPresentation extends EventsMixin implements Presentation {

        element: JQuery;

        constructor(public model: Spiro.DomainServicesRepresentation) {
            super();
        }

        clear(): void { }

        draw(): void {
            this.element = $(".properties-pane");
            _.each(this.model.value().models, (link: Link, i: number) => {
                var sp = new ServiceLinkPresentation(link, i, this.element);
                sp.on("link", (id) => this.trigger("link", id));
                sp.draw();
            });
        }
    }

    function handleKey(event) {
        if (event.keyCode == 36) { // home 
            $(".home").click();
            return false;
        }

        if (event.keyCode == 39) { // forward -> 
            $(".forward").click();
            return false;
        }
        if (event.keyCode == 37) { // backward <-
            $(".back").click();
            return false;
        }

        return true;
    }

    $(document).bind("keydown", handleKey);

    presentationFactory = new HandlebarsPresentationFactory();
}