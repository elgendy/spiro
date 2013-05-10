var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Spiro;
(function (Spiro) {
    (function (Classic) {
        var waitCount = 0;
        function cursorWait() {
            waitCount++;
            document.body.style.cursor = 'progress';
        }
        Classic.cursorWait = cursorWait;
        function cursorReset() {
            waitCount = 0;
            cursorClear();
        }
        Classic.cursorReset = cursorReset;
        function cursorClear() {
            if(--waitCount <= 0) {
                document.body.style.cursor = 'auto';
            }
        }
        Classic.cursorClear = cursorClear;
        var home;
        function toISODate(d) {
            function pad(n) {
                return n < 10 ? '0' + n : n.toString();
            }
            if(isNaN(d.getTime())) {
                return "";
            }
            return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + 'Z';
        }
        function toKeyValueArray(map) {
            var fieldsArray = [];
            for(var key in map) {
                if(map.hasOwnProperty(key)) {
                    fieldsArray.push({
                        key: key,
                        value: map[key]
                    });
                }
            }
            return fieldsArray;
        }
        function getFieldInput(property) {
            var input = property.find('.nof-value > :input');
            var newValue = null;
            if(input.length > 0) {
                newValue = input.val();
                if(input.hasClass('date')) {
                    var dt = new Date(newValue);
                    newValue = toISODate(dt);
                }
                newValue = $.trim(newValue);
            } else {
                var link = property.find(".nof-object > a");
                if(link.length > 0 && link.attr("href")) {
                    newValue = new Spiro.Link({
                        "href": link.attr("href")
                    });
                }
            }
            return new Spiro.Value(newValue);
        }
        function displayOnMain() {
            $("#main").html("");
            return $("#main");
        }
                        function friendlyActionName(member) {
            var name = member.extensions().friendlyName;
            if(member.extensions().hasParams === true) {
                name += "...";
            }
            return name;
        }
                        function mandatoryIndicatorIfApplies(member) {
            if(member.extensions().optional === false) {
                var spanTag = Tags.Tag("span", "nof-mandatory-field-indicator");
                spanTag.setInnerText("*");
                return spanTag.toString();
            }
            return "";
        }
        function formattedDateTime(value) {
            var pad = function (toPad) {
                var s = toPad.toString();
                if(s.length == 1) {
                    return "0" + toPad;
                }
                return toPad;
            };
            if(value === null) {
                return "";
            }
            var date = new Date(value);
            return $.datepicker.formatDate('dd/mm/yy', date) + " " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
        }
        function formattedScalar(value) {
            if(value === null) {
                return "";
            }
            return value.toString();
        }
        function shortName(value) {
            return value.substring(value.lastIndexOf(".") + 1, value.length);
        }
        function isFindAction(object, returnType) {
            if(object.extensions().returnType === returnType || object.extensions().elementType === returnType) {
                if(object.extensions().hasParams) {
                    return _.all(_.toArray(object.parameters()), function (i) {
                        return i.extensions().returnType === "integer" || i.extensions().returnType === "string" || i.extensions().returnType === "number" || i.extensions().returnType === "boolean";
                    });
                }
                return true;
            }
            return false;
        }
        var DomainObjectListItemView = (function (_super) {
            __extends(DomainObjectListItemView, _super);
            function DomainObjectListItemView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "tr";
                this.events = {
                    "click .selfLink": "selfLink",
                    "click .refLink": "refLink"
                };
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render', 'selfLink', 'refLink');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            DomainObjectListItemView.prototype.selfLink = function (e) {
                var view = new DomainObjectView(this.model);
                view.$parentEl = displayOnMain();
                view.render();
                return false;
            };
            DomainObjectListItemView.prototype.refLink = function (e) {
                var currentTarget = e.currentTarget;
                var refLink = this.model.propertyMembers()[currentTarget.id].value().link();
                var selectedModel = refLink.getTarget();
                var view = new DomainObjectView(selectedModel);
                view.$parentEl = displayOnMain();
                selectedModel.fetch();
                return false;
            };
            DomainObjectListItemView.prototype.renderRow = function () {
                var selfLinkTag = Tags.Tag("a", "selfLink", this.model.title());
                selfLinkTag.mergeAttribute("id", this.model.instanceId());
                selfLinkTag.mergeAttribute("href", this.model.url());
                var selfDivTag = Tags.Tag("div", "nof-object");
                selfDivTag.innerHtml += Tags.Tag("img").toString("SelfClosing");
                selfDivTag.innerHtml += selfLinkTag;
                var selfTag = Tags.Tag("td", "", selfDivTag);
                var fields = "";
                for(var p in this.model.members()) {
                    var itemTag = Tags.Tag("td");
                    var itemDivTag = Tags.Tag("div");
                    var member = this.model.members()[p];
                    if(member instanceof Spiro.PropertyMember) {
                        var property = member;
                        if(property.isScalar()) {
                            itemDivTag.addCssClass("nof-value");
                            itemDivTag.setInnerText(property.extensions().returnType === "date-time" ? formattedDateTime(property.value()) : formattedScalar(property.value()));
                        } else {
                            itemDivTag.addCssClass("nof-object");
                            if(property.value()) {
                                var imgTag = Tags.Tag("img");
                                imgTag.mergeAttribute("src", "/Content/Default.png").mergeAttribute("alt", "");
                                itemDivTag.innerHtml += imgTag;
                                var linkTag = Tags.Tag("a", "refLink", property.value().toString());
                                linkTag.mergeAttribute("id", p).mergeAttribute("href", property.value().link().href());
                                itemDivTag.innerHtml += linkTag;
                            }
                        }
                        itemTag.innerHtml += itemDivTag;
                        fields += itemTag;
                    }
                    if(member instanceof Spiro.CollectionMember) {
                        var collection = member;
                        itemDivTag.addCssClass("nof-object");
                        var title = (collection.size() == 0 ? "No" : collection.size().toString()) + " " + collection.extensions().pluralName;
                        itemDivTag.setInnerText(title);
                        itemTag.innerHtml += itemDivTag;
                        fields += itemTag;
                    }
                }
                return selfTag.toString() + fields;
            };
            DomainObjectListItemView.prototype.renderHeader = function () {
                var fields = "";
                for(var p in this.model.members()) {
                    var itemTag = Tags.Tag("th");
                    var member = this.model.members()[p];
                    if(member instanceof Spiro.PropertyMember || member instanceof Spiro.CollectionMember) {
                        itemTag.setInnerText(p);
                        fields += itemTag;
                    }
                }
                return Tags.Tag("th").toString("SelfClosing") + fields;
            };
            DomainObjectListItemView.prototype.render = function () {
                this.$el.html(this.renderRow());
                this.$parentEl.find("tr:first").html(this.renderHeader());
                this.$parentEl.append(this.$el);
                return this;
            };
            return DomainObjectListItemView;
        })(Backbone.View);        
        var ListTableView = (function (_super) {
            __extends(ListTableView, _super);
            function ListTableView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.className = "nof-collection-table";
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            ListTableView.prototype.renderInlineTable = function () {
                return Tags.Tag("table", "", Tags.Tag("tbody", "", Tags.Tag("tr"))).toString();
            };
            ListTableView.prototype.render = function () {
                this.$parentEl.find(".nof-collection-table").remove();
                this.$el.html(this.renderInlineTable());
                this.$parentEl.append(this.$el);
                _.each(this.model.models, function (itemLink) {
                    var itemModel = itemLink.getTarget();
                    var itemView = new DomainObjectListItemView(itemModel);
                    itemView.$parentEl = this.$el.find("tbody");
                    itemModel.fetch();
                }, this);
                return this;
            };
            return ListTableView;
        })(Backbone.View);        
        var DomainObjectListView = (function (_super) {
            __extends(DomainObjectListView, _super);
            function DomainObjectListView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.className = "nof-standalonetable";
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            DomainObjectListView.prototype.renderTable = function () {
                var count = this.model.models.length.toString();
                return Tags.Tag("div", "nof-object", "Viewing " + count + " of " + count).toString() + Tags.Tag("form", "nof-action", Tags.Tag("div")).toString();
            };
            DomainObjectListView.prototype.render = function () {
                this.$el.html(this.renderTable());
                displayOnMain().html(this.$el);
                var view = new ListTableView(this.model);
                view.$parentEl = this.$el.find("> form > div");
                view.render();
                return this;
            };
            return DomainObjectListView;
        })(Backbone.View);        
        var DomainObjectLinkView = (function (_super) {
            __extends(DomainObjectLinkView, _super);
            function DomainObjectLinkView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "a";
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            DomainObjectLinkView.prototype.renderImgTag = function () {
                var tag = Tags.Tag("img");
                tag.mergeAttribute("src", "/Content/Default.png").mergeAttribute("alt", "");
                return tag.toString();
            };
            DomainObjectLinkView.prototype.render = function () {
                this.$el.attr("href", this.model.url());
                this.$el.html(this.model.title());
                this.$parentEl.find(" > a").remove();
                this.$parentEl.find(" > img").remove();
                this.$parentEl.find(".nof-collection-list").remove();
                this.$parentEl.find(".field-validation-error").remove();
                this.$parentEl.prepend(this.$el);
                this.$parentEl.prepend(this.renderImgTag());
                return this;
            };
            return DomainObjectLinkView;
        })(Backbone.View);        
        var ListLinkView = (function (_super) {
            __extends(ListLinkView, _super);
            function ListLinkView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.className = "nof-collection-list";
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            ListLinkView.prototype.renderInlineList = function () {
                var bodyTag = Tags.Tag("tbody");
                var tableTag = Tags.Tag("table", "", bodyTag);
                for(var i = 0; i < this.model.models.length; i++) {
                    var item = this.model.models[i];
                    var linkTag = Tags.Tag("a", "", "Details");
                    linkTag.mergeAttribute("href", item.href());
                    var divTag = Tags.Tag("div", "", item.title());
                    divTag.innerHtml += linkTag;
                    divTag.innerHtml += Tags.Tag("button", "", "Select");
                    bodyTag.innerHtml += Tags.Tag("tr", "", Tags.Tag("td", "", divTag));
                }
                return tableTag.toString();
            };
            ListLinkView.prototype.render = function () {
                this.$parentEl.find(".nof-collection-list").remove();
                this.$el.append(this.renderInlineList());
                this.$parentEl.append(this.$el);
                return this;
            };
            return ListLinkView;
        })(Backbone.View);        
        var PropertyView = (function (_super) {
            __extends(PropertyView, _super);
            function PropertyView(options) {
                        _super.call(this, options);
            }
            PropertyView.createView = function createView(model) {
                var view;
                if(model.memberType() === "property" && model.isScalar()) {
                    view = new PropertyValueView(model);
                } else {
                    if(model.memberType() === "property") {
                        view = new PropertyReferenceView(model);
                    } else {
                        if(model.memberType() === "collection") {
                            view = new PropertyCollectionView(model);
                        }
                    }
                }
                return view;
            }
            PropertyView.prototype.render = function () {
                return this;
            };
            return PropertyView;
        })(Backbone.View);        
        var PropertyValueView = (function (_super) {
            __extends(PropertyValueView, _super);
            function PropertyValueView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.className = "nof-property";
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
            }
            PropertyValueView.prototype.renderEditScalarProperty = function () {
                if(this.model.disabledReason()) {
                    return this.renderViewScalarProperty();
                }
                var inputTag = Tags.Tag("input", "");
                if(this.model.extensions().format === "date-time") {
                    inputTag.addCssClass("date");
                    inputTag.mergeAttribute("value", formattedDateTime(this.model.value()));
                } else {
                    inputTag.mergeAttribute("value", formattedScalar(this.model.value()));
                }
                inputTag.innerHtml += mandatoryIndicatorIfApplies(this.model);
                return Tags.Tag("label", "", this.model.extensions().friendlyName).toString() + Tags.Tag("div", "nof-value", inputTag).toString();
            };
            PropertyValueView.prototype.renderViewScalarProperty = function () {
                return Tags.Tag("label", "", this.model.extensions().friendlyName).toString() + Tags.Tag("div", "nof-value", this.model.extensions().format === "date-time" ? formattedDateTime(this.model.value()) : formattedScalar(this.model.value()));
            };
            PropertyValueView.prototype.render = function () {
                if(this.editMode) {
                    this.$el.append(this.renderEditScalarProperty());
                } else {
                    this.$el.append(this.renderViewScalarProperty());
                }
                this.$el.attr("id", this.memberId);
                return this;
            };
            return PropertyValueView;
        })(PropertyView);        
        var PropertyReferenceView = (function (_super) {
            __extends(PropertyReferenceView, _super);
            function PropertyReferenceView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.className = "nof-property";
                this.mode = "minimized";
                this.events = {
                    "click :button": "select",
                    "click .nof-object > a": "link"
                };
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render', "link");
                this.delegateEvents();
            }
            PropertyReferenceView.prototype.link = function (e) {
                var currentTarget = e.currentTarget;
                var refLink = this.model.value().link();
                var selectedModel = refLink.getTarget();
                var view = new DomainObjectView(selectedModel);
                view.$parentEl = displayOnMain();
                selectedModel.fetch();
                return false;
            };
            PropertyReferenceView.prototype.maximize = function () {
                this.mode = "maximized";
                this.render();
            };
            PropertyReferenceView.prototype.minimize = function () {
                this.mode = "minimized";
                this.render();
            };
            PropertyReferenceView.prototype.select = function (e) {
                var currentTarget = e.currentTarget;
                if(currentTarget.className === "nof-maximize") {
                    this.maximize();
                } else {
                    if(currentTarget.className === "nof-minimize") {
                        this.minimize();
                    }
                }
                return false;
            };
            PropertyReferenceView.prototype.renderEditReferenceProperty = function () {
                var objectTag = Tags.Tag("div", "nof-object");
                objectTag.mergeAttribute("data-type", this.model.extensions().returnType);
                if(!(this.model.disabledReason())) {
                    objectTag.mergeAttribute("data-hasFinder", "true");
                }
                if(this.model.value()) {
                    var imgTag = Tags.Tag("img");
                    imgTag.mergeAttribute("src", "/Content/Default.png").mergeAttribute("alt", "");
                    var linkTag = Tags.Tag("a", "", this.model.value().toString());
                    linkTag.mergeAttribute("id", this.memberId).mergeAttribute("href", this.model.value().link().href());
                    objectTag.innerHtml += imgTag;
                    objectTag.innerHtml += linkTag;
                }
                return Tags.Tag("label", "", this.model.extensions().friendlyName).toString() + objectTag;
            };
            PropertyReferenceView.prototype.renderViewReferenceProperty = function () {
                var objectTag = Tags.Tag("div", "nof-object");
                objectTag.mergeAttribute("data-type", this.model.extensions().returnType);
                if(!this.model.value().isNull()) {
                    var imgTag = Tags.Tag("img");
                    imgTag.mergeAttribute("src", "/Content/Default.png").mergeAttribute("alt", "");
                    var linkTag = Tags.Tag("a", "", this.model.value().toString());
                    linkTag.mergeAttribute("id", this.memberId).mergeAttribute("href", this.model.value().link().href());
                    var buttonMinTag = Tags.Tag("button", "nof-minimize", "Collapse");
                    var buttonMaxTag = Tags.Tag("button", "nof-maximize", "Expand");
                    buttonMinTag.mergeAttribute("style", "display: none;");
                    buttonMaxTag.mergeAttribute("style", "display: inline;");
                    var buttonDivTag = Tags.Tag("div");
                    buttonDivTag.innerHtml += buttonMinTag;
                    buttonDivTag.innerHtml += buttonMaxTag;
                    var formTag = Tags.Tag("form", "", buttonDivTag);
                    formTag.mergeAttribute("id", this.memberId);
                    objectTag.innerHtml += imgTag;
                    objectTag.innerHtml += linkTag;
                    objectTag.innerHtml += formTag;
                }
                return Tags.Tag("label", "", this.model.extensions().friendlyName).toString() + objectTag;
            };
            PropertyReferenceView.prototype.render = function () {
                if(this.editMode) {
                    this.$el.html(this.renderEditReferenceProperty());
                } else {
                    this.$el.html(this.renderViewReferenceProperty());
                    if(this.mode === "minimized") {
                        this.$el.find(".nof-maximize").show();
                        this.$el.find(".nof-minimize").hide();
                        this.$el.find(".nof-propertylist").remove();
                    }
                    if(this.mode === "maximized") {
                        this.$el.find(".nof-maximize").hide();
                        this.$el.find(".nof-minimize").show();
                        var refLink = this.model.value().link();
                        var propertyValue = refLink.getTarget();
                        var view = new DomainObjectPropertiesView(propertyValue);
                        view.$parentEl = this.$el.find(".nof-object");
                        propertyValue.fetch();
                    }
                }
                this.$el.attr("id", this.memberId);
                return this;
            };
            return PropertyReferenceView;
        })(PropertyView);        
        var PropertyCollectionView = (function (_super) {
            __extends(PropertyCollectionView, _super);
            function PropertyCollectionView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.className = "nof-property";
                this.mode = "summary";
                this.events = {
                    "click :button": "select"
                };
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
                this.delegateEvents();
            }
            PropertyCollectionView.prototype.summarize = function () {
                this.mode = "summary";
                this.render();
            };
            PropertyCollectionView.prototype.listify = function () {
                this.mode = "list";
                this.render();
            };
            PropertyCollectionView.prototype.tabulate = function () {
                this.mode = "table";
                this.render();
            };
            PropertyCollectionView.prototype.select = function (e) {
                var currentTarget = e.currentTarget;
                if(currentTarget.className === "nof-summary") {
                    this.summarize();
                } else {
                    if(currentTarget.className === "nof-list") {
                        this.listify();
                    } else {
                        if(currentTarget.className === "nof-table") {
                            this.tabulate();
                        }
                    }
                }
                return false;
            };
            PropertyCollectionView.prototype.renderViewCollectionProperty = function () {
                var objectTag = Tags.Tag("div", "nof-collection-summary");
                var buttonSummaryTag = Tags.Tag("button", "nof-summary", "Summary");
                var buttonListTag = Tags.Tag("button", "nof-list", "List");
                var buttonTableTag = Tags.Tag("button", "nof-table", "Table");
                buttonSummaryTag.mergeAttribute("style", "display: none;");
                buttonListTag.mergeAttribute("style", "display: inline;");
                buttonTableTag.mergeAttribute("style", "display: inline;");
                var buttonDivTag = Tags.Tag("div");
                buttonDivTag.innerHtml += buttonSummaryTag;
                buttonDivTag.innerHtml += buttonListTag;
                buttonDivTag.innerHtml += buttonTableTag;
                var formTag = Tags.Tag("form", "", buttonDivTag);
                formTag.mergeAttribute("id", this.memberId);
                var summaryTag = Tags.Tag("div", "nof-object", (this.model.size() == 0 ? "No" : this.model.size().toString()) + " " + this.model.extensions().pluralName);
                objectTag.innerHtml += formTag;
                objectTag.innerHtml += summaryTag;
                return Tags.Tag("label", "", this.model.extensions().friendlyName).toString() + objectTag;
            };
            PropertyCollectionView.prototype.render = function () {
                var view;
                this.$el.html(this.renderViewCollectionProperty());
                var cDiv = this.$el.find(".nof-collection-summary, .nof-collection-list, .nof-collection-table");
                if(this.mode === "summary") {
                    this.$el.find(".nof-summary").hide();
                    this.$el.find(".nof-list").show();
                    this.$el.find(".nof-table").show();
                    cDiv.addClass("nof-collection-summary");
                    cDiv.removeClass("nof-collection-list");
                    cDiv.removeClass("nof-collection-table");
                }
                if(this.mode === "list") {
                    this.$el.find(".nof-summary").show();
                    this.$el.find(".nof-list").hide();
                    this.$el.find(".nof-table").show();
                    cDiv.addClass("nof-collection-list");
                    cDiv.removeClass("nof-collection-summary");
                    cDiv.removeClass("nof-collection-table");
                    this.$el.find(".nof-object").remove();
                    var propertyValue = this.model.getDetails();
                    view = new InlineListCollectionView(propertyValue);
                    view.$parentEl = cDiv;
                    propertyValue.fetch();
                }
                if(this.mode === "table") {
                    this.$el.find(".nof-summary").show();
                    this.$el.find(".nof-list").show();
                    this.$el.find(".nof-table").hide();
                    cDiv.addClass("nof-collection-table");
                    cDiv.removeClass("nof-collection-list");
                    cDiv.removeClass("nof-collection-summary");
                    this.$el.find(".nof-object").remove();
                    var propertyValue = this.model.getDetails();
                    view = new InlineTableCollectionView(propertyValue);
                    view.$parentEl = cDiv;
                    propertyValue.fetch();
                }
                this.$el.attr("id", this.memberId);
                return this;
            };
            return PropertyCollectionView;
        })(PropertyView);        
        var InlineListCollectionView = (function (_super) {
            __extends(InlineListCollectionView, _super);
            function InlineListCollectionView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "table";
                this.events = {
                    "click .nof-object > a": "link"
                };
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            InlineListCollectionView.prototype.link = function (e) {
                var currentTarget = e.currentTarget;
                var selectedLink = _.find(this.model.value().models, function (i) {
                    return i.href() === currentTarget.href;
                });
                var selectedModel = selectedLink.getTarget();
                var view = new DomainObjectView(selectedModel);
                view.$parentEl = displayOnMain();
                selectedModel.fetch();
                return false;
            };
            InlineListCollectionView.prototype.renderInlineCollectionList = function () {
                var bodyTag = Tags.Tag("tbody");
                for(var i = 0; i < this.model.value().models.length; i++) {
                    var item = this.model.value().models[i];
                    var imgTag = Tags.Tag("img");
                    imgTag.mergeAttribute("src", "/Content/Default.png").mergeAttribute("alt", "");
                    var linkTag = Tags.Tag("a", "", item.title());
                    linkTag.mergeAttribute("href", item.href());
                    var divTag = Tags.Tag("div", "nof-object");
                    divTag.innerHtml += imgTag;
                    divTag.innerHtml += linkTag;
                    bodyTag.innerHtml += Tags.Tag("tr", "", Tags.Tag("td", "", divTag));
                }
                return bodyTag.toString();
            };
            InlineListCollectionView.prototype.render = function () {
                this.$el.html(this.renderInlineCollectionList());
                this.$parentEl.append(this.$el);
                return this;
            };
            return InlineListCollectionView;
        })(Backbone.View);        
        var InlineTableCollectionView = (function (_super) {
            __extends(InlineTableCollectionView, _super);
            function InlineTableCollectionView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "table";
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            InlineTableCollectionView.prototype.renderInlineCollectionTable = function () {
                return Tags.Tag("tBody", "", Tags.Tag("tr")).toString();
            };
            InlineTableCollectionView.prototype.render = function () {
                this.$el.html(this.renderInlineCollectionTable());
                this.$parentEl.append(this.$el);
                _.each(this.model.value().models, function (itemLink) {
                    var itemModel = itemLink.getTarget();
                    var item = new DomainObjectListItemView(itemModel);
                    item.$parentEl = this.$el.find("tbody");
                    itemModel.fetch();
                }, this);
                return this;
            };
            return InlineTableCollectionView;
        })(Backbone.View);        
        var DomainObjectPropertiesView = (function (_super) {
            __extends(DomainObjectPropertiesView, _super);
            function DomainObjectPropertiesView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.className = "nof-propertylist";
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            DomainObjectPropertiesView.prototype.render = function () {
                _.each(toKeyValueArray(this.model.members()), function (keyValue) {
                    var view = PropertyView.createView(keyValue.value);
                    if(view) {
                        view.memberId = keyValue.key;
                        view.editMode = this.editMode;
                        this.$el.append(view.render().el);
                    }
                }, this);
                if(this.$parentEl) {
                    this.$parentEl.append(this.$el);
                }
                return this;
            };
            return DomainObjectPropertiesView;
        })(Backbone.View);        
        var DomainObjectView = (function (_super) {
            __extends(DomainObjectView, _super);
            function DomainObjectView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.className = "nof-objectview";
                this.events = {
                    "click :button": "select"
                };
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'renderEdit', 'renderView', 'render', 'requestFailed', 'requestSucceeded');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.renderView);
                this.model.bind('requestFailed', this.requestFailed);
                this.model.bind('requestSucceeded', this.requestSucceeded);
                this.delegateEvents();
            }
            DomainObjectView.prototype.edit = function () {
                this.editMode = true;
                this.render();
                return false;
            };
            DomainObjectView.prototype.view = function () {
                this.editMode = false;
                this.render();
                return false;
            };
            DomainObjectView.prototype.save = function () {
                var map = this.model.getUpdateMap();
                for(var attr in map.attributes) {
                    var property = $(".nof-property#" + attr);
                    map.setProperty(attr, getFieldInput(property));
                }
                map.save();
                return false;
            };
            DomainObjectView.prototype.requestSucceeded = function () {
                this.editMode = false;
                this.render();
            };
            DomainObjectView.prototype.renderError = function (resp) {
                return Tags.Tag("h2", "", resp.message).toString() + Tags.Tag("p", "", resp.stackTrace);
            };
            DomainObjectView.prototype.renderValidationError = function (msg) {
                return Tags.Tag("span", "field-validation-error", msg).toString();
            };
            DomainObjectView.prototype.requestFailed = function (resp) {
                this.editMode = true;
                if(resp.statusCode === 500) {
                    displayOnMain().html(this.renderError(resp.model));
                } else {
                    $(".field-validation-error").remove();
                    for(var parm in resp.model.attributes) {
                        var key = parm;
                        var value = resp.model.attributes[key].value;
                        var msg = resp.model.attributes[key].invalidReason;
                        if(msg) {
                            var nofvalue = $("#" + key).find(".nof-value, .nof-object");
                            nofvalue.append($(this.renderValidationError(msg)));
                        }
                    }
                }
            };
            DomainObjectView.prototype.select = function (e) {
                var currentTarget = e.currentTarget;
                if(currentTarget.className === "nof-edit") {
                    this.edit();
                } else {
                    if(currentTarget.className === "nof-cancel") {
                        this.view();
                    } else {
                        if(currentTarget.className === "nof-save") {
                            this.save();
                        } else {
                            var objectAction = this.model.actionMembers()[currentTarget.form.id].getDetails();
                            var dialogView = new DialogView(objectAction);
                            dialogView.$parentEl = displayOnMain();
                            dialogView.mode = {
                                showAsLink: false,
                                renderDialog: function (dv) {
                                    return dv.renderDialog();
                                },
                                $parentEl: function (o) {
                                    return null;
                                }
                            };
                            objectAction.fetch();
                        }
                    }
                }
                return false;
            };
            DomainObjectView.prototype.renderView = function () {
                this.editMode = false;
            };
            DomainObjectView.prototype.renderEdit = function () {
                this.editMode = true;
            };
            DomainObjectView.prototype.renderObject = function () {
                var imgTag = Tags.Tag("img");
                imgTag.mergeAttribute("src", "/Content/Default.png").mergeAttribute("alt", "");
                var divTag = Tags.Tag("div", "nof-object", imgTag);
                divTag.innerHtml += this.model.title();
                return divTag.toString();
            };
            DomainObjectView.prototype.renderMenu = function () {
                var menuTag = Tags.Tag("div", "nof-menu", Tags.Tag("div", "nof-menuname", "Actions"));
                menuTag.mergeAttribute("id", shortName(this.model.domainType()) + "-Actions");
                var itemsTag = Tags.Tag("div", "nof-menuitems");
                for(var a in this.model.actionMembers()) {
                    var action = this.model.actionMembers()[a];
                    var formTag = Tags.Tag("form", "nof-action", Tags.Tag("div", "", Tags.Tag("button", "", action.extensions().friendlyName)));
                    formTag.mergeAttribute("id", a);
                    itemsTag.innerHtml += formTag;
                }
                menuTag.innerHtml += itemsTag;
                return menuTag.toString();
            };
            DomainObjectView.prototype.render = function () {
                if(Object.keys(this.model.attributes).length === 0) {
                    displayOnMain();
                    return this;
                }
                if(this.editMode) {
                    this.$el.addClass("nof-objectedit");
                    this.$el.removeClass("nof-objectview");
                } else {
                    this.$el.removeClass("nof-objectedit");
                    this.$el.addClass("nof-objectview");
                }
                this.$el.html(this.renderObject());
                if(!this.editMode) {
                    this.$el.append(this.renderMenu());
                }
                var pView = new DomainObjectPropertiesView(this.model);
                pView.editMode = this.editMode;
                this.$el.append(pView.render().el);
                if(this.editMode) {
                    this.$el.append("<form class='nof-action'><div><button class='nof-save'>Save</button></div></form>");
                    this.$el.append("<form class='nof-action'><div><button class='nof-cancel'>Cancel</button></div></form>");
                } else {
                    this.$el.append("<form class='nof-action'><div><button class='nof-edit'>Edit</button></div></form>");
                }
                this.$el.find(".nof-property > .nof-object[data-hasFinder]").each(function () {
                    var serviceLinks = home.getDomainServices();
                    var findMenuView = new FindMenuView(serviceLinks);
                    findMenuView.$parentEl = $(this);
                    serviceLinks.fetch();
                    return null;
                });
                if(this.$parentEl.find(".nof-objectview, .nof-objectedit").length == 0) {
                    this.$parentEl.html(this.$el);
                }
                this.$parentEl.find(".date").datepicker();
                return this;
            };
            return DomainObjectView;
        })(Backbone.View);        
        var ResultView = (function (_super) {
            __extends(ResultView, _super);
            function ResultView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.className = "nof-objectview";
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render', 'error');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.model.bind('error', this.error);
                this.model.bind('requestFailed', this.requestFailed);
                this.delegateEvents();
            }
            ResultView.prototype.render = function () {
                var result = this.model.result();
                var resultType = this.model.resultType();
                if(result == null || resultType === "void") {
                    displayOnMain();
                } else {
                    if(resultType === "object") {
                        if(this.showLink) {
                            var domainObjectLinkView = new DomainObjectLinkView(result.object());
                            domainObjectLinkView.$parentEl = this.$parentEl;
                            domainObjectLinkView.render();
                        } else {
                            var domainObjectView = new DomainObjectView(result.object());
                            domainObjectView.$parentEl = displayOnMain();
                            domainObjectView.render();
                        }
                    } else {
                        if(resultType === "scalar") {
                            alert("unsupported display of scalar");
                        } else {
                            if(resultType === "list") {
                                if(this.showLink) {
                                    var listLinkListView = new ListLinkView(result.list().value());
                                    listLinkListView.$parentEl = this.$parentEl;
                                    listLinkListView.render();
                                } else {
                                    var domainObjectListView = new DomainObjectListView(result.list().value());
                                    domainObjectListView.render();
                                }
                            }
                        }
                    }
                }
                return this;
            };
            ResultView.prototype.renderError = function (resp) {
                return Tags.Tag("h2", "", resp.message).toString() + Tags.Tag("p", "", resp.stackTrace);
            };
            ResultView.prototype.requestFailed = function (resp) {
                if(resp.statusCode === 500) {
                    displayOnMain().html(this.renderError(resp.model));
                } else {
                    $(".field-validation-error").remove();
                    for(var parm in resp.model.attributes) {
                        var key = parm;
                        var value = resp.model.attributes[key].value;
                        var msg = resp.model.attributes[key].invalidReason;
                        if(msg) {
                            var nofvalue = $("#" + key).find(".nof-value, .nof-object");
                            nofvalue.append($("<span class='field-validation-error'>" + msg + "</span>"));
                        }
                    }
                }
            };
            ResultView.prototype.error = function () {
            };
            return ResultView;
        })(Backbone.View);        
        var FindSubMenuItemView = (function (_super) {
            __extends(FindSubMenuItemView, _super);
            function FindSubMenuItemView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            FindSubMenuItemView.prototype.renderSubMenuItem = function () {
                if(isFindAction(this.model, this.dataType)) {
                    var formTag = Tags.Tag("form", "nof-action", Tags.Tag("div", "", Tags.Tag("button", "", friendlyActionName(this.model))));
                    formTag.mergeAttribute("id", this.model.actionId());
                    return formTag.toString();
                }
                return "";
            };
            FindSubMenuItemView.prototype.render = function () {
                var mi = this.renderSubMenuItem();
                if(mi) {
                    this.$parentEl.closest(".nof-submenu").show();
                    this.$parentEl.append(mi);
                }
                return this;
            };
            return FindSubMenuItemView;
        })(Backbone.View);        
        var FindSubMenuView = (function (_super) {
            __extends(FindSubMenuView, _super);
            function FindSubMenuView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.className = "nof-submenu";
                this.events = {
                    "click :button": "select"
                };
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            FindSubMenuView.prototype.select = function (e) {
                var currentTarget = e.currentTarget;
                var objectAction = this.model.actionMembers()[currentTarget.form.id].getDetails();
                var dialogView = new DialogView(objectAction);
                dialogView.$parentEl = this.$parentEl.closest(".nof-object");
                dialogView.mode = {
                    showAsLink: true,
                    renderDialog: function (dv) {
                        return dv.renderFindDialog();
                    },
                    $parentEl: function (o) {
                        return o.$parentEl;
                    }
                };
                objectAction.fetch();
                return false;
            };
            FindSubMenuView.prototype.renderSubMenu = function () {
                return Tags.Tag("div", "nof-menuname", this.model.extensions().friendlyName).toString() + Tags.Tag("div", "nof-submenuitems");
            };
            FindSubMenuView.prototype.render = function () {
                this.$el.html(this.renderSubMenu());
                this.$parentEl.append(this.$el);
                this.$el.hide();
                var objectActions = _.map(_.toArray(this.model.actionMembers()), function (am) {
                    return am.getDetails();
                }, this);
                _.each(objectActions, function (i) {
                    var view = new FindSubMenuItemView(i);
                    view.$parentEl = this.$el.find(".nof-submenuitems");
                    view.dataType = this.dataType;
                    i.fetch();
                }, this);
                return this;
            };
            return FindSubMenuView;
        })(Backbone.View);        
        var FindMenuView = (function (_super) {
            __extends(FindMenuView, _super);
            function FindMenuView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.className = "nof-menu";
                this.events = {
                    "click :button": "clickRemove"
                };
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            FindMenuView.prototype.clickRemove = function (e) {
                this.$parentEl.find(" > img").remove();
                this.$parentEl.find(" > a").remove();
                return false;
            };
            FindMenuView.prototype.renderFindMenu = function () {
                var menuNameTag = Tags.Tag("div", "nof-menuname", "Find");
                var menuItemsTag = Tags.Tag("div", "nof-menuitems", Tags.Tag("button", "nof-remove", "Remove"));
                return menuNameTag.toString() + menuItemsTag;
            };
            FindMenuView.prototype.render = function () {
                this.$el.html(this.renderFindMenu());
                this.$parentEl.append(this.$el);
                _.each(this.model.value().models, function (link) {
                    var service = link.getTarget();
                    var findSubmenuView = new FindSubMenuView(service);
                    findSubmenuView.$parentEl = this.$el.find(".nof-menuitems");
                    findSubmenuView.dataType = this.$parentEl.attr("data-type");
                    service.fetch();
                }, this);
                return this;
            };
            return FindMenuView;
        })(Backbone.View);        
        var DialogView = (function (_super) {
            __extends(DialogView, _super);
            function DialogView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.className = "nof-actiondialog";
                this.events = {
                    "click :button.nof-ok": "ok",
                    "click :button.nof-cancel": "cancel"
                };
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            DialogView.prototype.ok = function () {
                var invoke = this.model.getInvoke();
                $(".nof-parameter").each(function () {
                    invoke.setParameter(this.id, getFieldInput($(this)));
                    return null;
                });
                var resultView = new ResultView(invoke);
                resultView.showLink = this.mode.showAsLink;
                resultView.$parentEl = this.mode.$parentEl(this);
                invoke.fetch();
                return false;
            };
            DialogView.prototype.cancel = function () {
                return false;
            };
            DialogView.prototype.renderDialog = function () {
                var formTag = Tags.Tag("form", "nof-dialog");
                var divListTag = Tags.Tag("div", "nof-parameterlist");
                for(var p in this.model.parameters()) {
                    var value = this.model.parameters()[p];
                    var divParmTag = Tags.Tag("div", "nof-parameter", Tags.Tag("label", "", value.extensions().friendlyName));
                    divParmTag.mergeAttribute("id", p);
                    var divValueTag = Tags.Tag("div");
                    if(value.isScalar()) {
                        divValueTag.addCssClass("nof-value");
                        divValueTag.innerHtml += Tags.Tag("input");
                    } else {
                        divValueTag.addCssClass("nof-object");
                        divValueTag.mergeAttribute("data-type", value.extensions().returnType);
                    }
                    divValueTag.innerHtml += mandatoryIndicatorIfApplies(value);
                    divParmTag.innerHtml += divValueTag;
                    divListTag.innerHtml += divParmTag;
                }
                formTag.innerHtml += divListTag;
                var buttonTag = Tags.Tag("button", "nof-ok");
                buttonTag.setInnerText("OK");
                formTag.innerHtml += buttonTag;
                var divLinkTag = Tags.Tag("div", "nof-object", Tags.Tag("a"));
                var divNameTag = Tags.Tag("div", "nof-actionname", this.model.extensions().friendlyName);
                var cancelFormTag = Tags.Tag("form", "nof-action", Tags.Tag("div", "", Tags.Tag("button", "nof-cancel", "Cancel")));
                return divLinkTag.toString() + divNameTag.toString() + formTag.toString() + cancelFormTag.toString();
            };
            DialogView.prototype.renderFindDialog = function () {
                var divListTag = Tags.Tag("div", "nof-parameterlist");
                for(var p in this.model.parameters()) {
                    var value = this.model.parameters()[p];
                    var divParmTag = Tags.Tag("div", "nof-parameter", Tags.Tag("label", "", value.extensions().friendlyName));
                    divParmTag.mergeAttribute("id", p);
                    var divValueTag = Tags.Tag("div");
                    if(value.isScalar()) {
                        divValueTag.addCssClass("nof-value");
                        divValueTag.innerHtml += Tags.Tag("input");
                    } else {
                        divValueTag.addCssClass("nof-object");
                        divValueTag.mergeAttribute("data-type", value.extensions().returnType);
                    }
                    divValueTag.innerHtml += mandatoryIndicatorIfApplies(value);
                    divParmTag.innerHtml += divValueTag;
                    divListTag.innerHtml += divParmTag;
                }
                return Tags.Tag("div", "nof-actionname", this.model.extensions().friendlyName).toString() + divListTag + Tags.Tag("button", "nof-ok", "OK") + Tags.Tag("form", "nof-action", Tags.Tag("div", "", Tags.Tag("button", "nof-cancel", "Cancel")));
            };
            DialogView.prototype.render = function () {
                if(this.model.extensions().hasParams) {
                    this.$el.html(this.mode.renderDialog(this));
                    this.$el.find(".nof-parameter > .nof-object").each(function () {
                        var serviceLinks = home.getDomainServices();
                        var findMenuView = new FindMenuView(serviceLinks);
                        findMenuView.$parentEl = this;
                        serviceLinks.fetch();
                        return null;
                    });
                    this.$parentEl.append(this.$el);
                } else {
                    var invoke = this.model.getInvoke();
                    var resultView = new ResultView(invoke);
                    resultView.showLink = this.mode.showAsLink;
                    resultView.$parentEl = this.mode.$parentEl(this);
                    invoke.fetch();
                }
                return this;
            };
            return DialogView;
        })(Backbone.View);        
        var ServiceMenuView = (function (_super) {
            __extends(ServiceMenuView, _super);
            function ServiceMenuView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.className = "nof-menu";
                this.events = {
                    "click :button": "select"
                };
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            ServiceMenuView.prototype.select = function (e) {
                var currentTarget = e.currentTarget;
                var objectAction = this.model.actionMembers()[currentTarget.form.id].getDetails();
                var dialogView = new DialogView(objectAction);
                dialogView.$parentEl = displayOnMain();
                dialogView.mode = {
                    showAsLink: false,
                    renderDialog: function (dv) {
                        return dv.renderDialog();
                    },
                    $parentEl: function (o) {
                        return $("");
                    }
                };
                objectAction.fetch();
                return false;
            };
            ServiceMenuView.prototype.renderServiceMenu = function () {
                var itemsTag = Tags.Tag("div", "nof-menuitems");
                for(var m in this.model.actionMembers()) {
                    var value = this.model.actionMembers()[m];
                    if(value.disabledReason()) {
                        var reasonTag = Tags.Tag("div", "nof-action", friendlyActionName(value));
                        reasonTag.mergeAttribute("title", value.disabledReason());
                        itemsTag.innerHtml += reasonTag.toString();
                    } else {
                        var formTag = Tags.Tag("form", "nof-action", Tags.Tag("div", "", Tags.Tag("button", "", friendlyActionName(value))));
                        formTag.mergeAttribute("id", m);
                        itemsTag.innerHtml += formTag.toString();
                    }
                }
                var titleTag = Tags.Tag("div", "nof-menuname", this.model.title());
                return titleTag.toString() + itemsTag.toString();
            };
            ServiceMenuView.prototype.render = function () {
                this.$el.html(this.renderServiceMenu());
                this.$el.attr("id", this.model.serviceId());
                this.$parentEl.append(this.$el);
                return this;
            };
            return ServiceMenuView;
        })(Backbone.View);        
        var MenuBarView = (function (_super) {
            __extends(MenuBarView, _super);
            function MenuBarView(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.tagName = "div";
                this.className = "nof-servicelist";
                this.el = undefined;
                this._ensureElement();
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
            }
            MenuBarView.prototype.render = function () {
                _.each(this.model.value().models, function (link) {
                    var service = link.getTarget();
                    var serviceView = new ServiceMenuView(service);
                    serviceView.$parentEl = this.$el;
                    service.fetch();
                }, this);
                $("#header").append(this.$el);
                return this;
            };
            return MenuBarView;
        })(Backbone.View);        
        var HomeView = (function (_super) {
            __extends(HomeView, _super);
            function HomeView(model, options) {
                        _super.call(this, options);
                this.model = model;
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
            }
            HomeView.prototype.render = function () {
                displayOnMain().html("This demo currently only works IE9+, and is mainly being tested in Firefox 16");
                var serviceLinks = this.model.getDomainServices();
                var menuBarView = new MenuBarView(serviceLinks);
                serviceLinks.fetch();
                return this;
            };
            return HomeView;
        })(Backbone.View);        
        var AppRouter = (function (_super) {
            __extends(AppRouter, _super);
            function AppRouter(options) {
                        _super.call(this, options);
            }
            AppRouter.prototype.home = function () {
                home = new Spiro.HomePageRepresentation();
                var homeView = new HomeView(home);
                home.fetch();
            };
            return AppRouter;
        })(Backbone.Router);        
        var app = new AppRouter({
            "routes": {
                "": "home"
            }
        });
        Backbone.history.start();
        window.onerror = function (msg, url, linenumber) {
            alert('Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber);
            return true;
        };
        var bindAjaxError = function () {
            $("div#main").ajaxError(function (e, xhr, settings) {
                alert('ajax error');
            });
        };
    })(Spiro.Classic || (Spiro.Classic = {}));
    var Classic = Spiro.Classic;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro-classic.js.map
