var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Spiro;
(function (Spiro) {
    (function (Modern) {
        (function (HandlebarsTemplating) {
            var dateFormat = 'dd/mm/yy';

            function hashCode(toHash) {
                var hash = 0, i, char;
                if (toHash.length == 0)
                    return hash;
                for (i = 0; i < toHash.length; i++) {
                    char = toHash.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                return hash;
            }
            ;

            function getColourMapValues(dt) {
                var map = dt ? colourMap[dt] : defaultColour;
                if (!map) {
                    var hash = Math.abs(hashCode(dt));
                    var index = hash % 18;
                    map = defaultColourArray[index];
                    colourMap[dt] = map;
                }
                return map;
            }

            function setColourMapValues(dt, context) {
                var map = getColourMapValues(dt);
                _.each(map, function (element, index) {
                    return context[index] = element;
                });
                return context;
            }

            function toISODate(d) {
                function pad(n) {
                    return n < 10 ? '0' + n : n.toString();
                }

                if (isNaN(d.getTime())) {
                    return "";
                }

                return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + 'Z';
            }

            function formatDate(value) {
                if (value) {
                    var date = new Date(value);
                    return ($).datepicker.formatDate(dateFormat, date);
                }
                return "";
            }

            function getTitle(pm) {
                var title = pm.value().toString();
                return (pm.extensions().format === "date-time") ? title = formatDate(title) : title;
            }

            function getFieldInput(element, isScalar) {
                var input = element.find(':input');
                var hiddenInput = element.find(':input[type=hidden]');
                var inputAsCheckbox = element.find(':input[type=checkbox]');
                var input = hiddenInput.length > 0 ? hiddenInput : input;

                var newValue = null;

                if (inputAsCheckbox.length > 0 || input.length > 0) {
                    newValue = inputAsCheckbox.length > 0 ? inputAsCheckbox.prop("checked") : input.val();

                    if (input.attr('type') == 'date') {
                        var dt = new Date(newValue);
                        newValue = toISODate(dt);
                    }
                    newValue = $.trim(newValue);

                    if (!isScalar && newValue) {
                        newValue = new Spiro.Link({ "href": newValue });
                    }
                }

                return new Spiro.Value(newValue);
            }

            var HandlebarsPresentationFactory = (function () {
                function HandlebarsPresentationFactory() {
                    this.pagePresentation = new PagePresentation();
                    this.PresentationMap = {
                        "DomainObjectRepresentation": function (model, options) {
                            return HandlebarsPresentationFactory.domainObjectPresentation(model, options);
                        },
                        "CollectionRepresentation": function (model, options) {
                            return HandlebarsPresentationFactory.collectionPresentation(model, options);
                        },
                        "ListRepresentation": function (model, options) {
                            return HandlebarsPresentationFactory.collectionPresentation(model, options);
                        },
                        "DomainServicesRepresentation": function (model, options) {
                            return new ServicesPresentation(model);
                        },
                        "ActionRepresentation": function (model, options) {
                            return new ActionDialogPresentation(model);
                        }
                    };
                }
                HandlebarsPresentationFactory.domainObjectPresentation = function (model, options) {
                    if (options.nest) {
                        return new NestedObjectPresentation(model);
                    } else if (options.row) {
                        return new TableRowPresentation(model);
                    } else if (options.edit) {
                        return new DomainObjectEditPresentation(model);
                    }
                    return new DomainObjectPresentation(model);
                };

                HandlebarsPresentationFactory.collectionPresentation = function (model, options) {
                    return options.table ? new TablePresentation(model) : new ListPresentation(model);
                };

                HandlebarsPresentationFactory.prototype.CreatePresentation = function (model, options) {
                    return this.PresentationMap[Spiro.Helpers.getClassName(model)](model, options);
                };

                HandlebarsPresentationFactory.prototype.PagePresentation = function (model) {
                    if (model) {
                        this.pagePresentation.model = model;
                    }
                    return this.pagePresentation;
                };
                return HandlebarsPresentationFactory;
            })();

            var EventsMixin = (function () {
                function EventsMixin() {
                    _.extend(this, Backbone.Events);
                }
                EventsMixin.prototype.on = function (event, callback, context) {
                };
                EventsMixin.prototype.once = function (event, callback, context) {
                };
                EventsMixin.prototype.off = function (event, callback, context) {
                };
                EventsMixin.prototype.trigger = function (event, args) {
                };
                EventsMixin.prototype.stopListening = function (obj, name, callback) {
                };
                return EventsMixin;
            })();
            HandlebarsTemplating.EventsMixin = EventsMixin;

            var ActionPresentation = (function (_super) {
                __extends(ActionPresentation, _super);
                function ActionPresentation(model, actionId, parentElement) {
                    _super.call(this);
                    this.model = model;
                    this.actionId = actionId;
                    this.parentElement = parentElement;
                }
                ActionPresentation.prototype.setupEvents = function () {
                    var _this = this;
                    this.element.find(".action").on("click", function (event) {
                        _this.trigger("action", _this.actionId);
                        event.preventDefault();
                    });
                };

                ActionPresentation.prototype.clear = function () {
                };

                ActionPresentation.prototype.draw = function () {
                    var context = { "actionName": this.model.extensions().friendlyName, "actionId": this.actionId };
                    this.element = $($.parseHTML(HandlebarsTemplating.templates.actionTemplate(context)));
                    this.setupEvents();
                    this.parentElement.append(this.element);
                };
                return ActionPresentation;
            })(EventsMixin);

            var PropertyEditPresentation = (function (_super) {
                __extends(PropertyEditPresentation, _super);
                function PropertyEditPresentation(model, parentElement, error) {
                    _super.call(this);
                    this.model = model;
                    this.parentElement = parentElement;
                    this.error = error;
                    this.propertyId = model.id;
                }
                PropertyEditPresentation.prototype.setupEvents = function () {
                    var _this = this;
                    this.element.find("a").on("click", function (event) {
                        _this.trigger("link", _this.model.id);
                        event.preventDefault();
                    });
                };

                PropertyEditPresentation.prototype.getFieldInput = function () {
                    return getFieldInput(this.element, !this.model.value().isReference());
                };

                PropertyEditPresentation.prototype.clear = function () {
                };

                PropertyEditPresentation.prototype.appendOptions = function () {
                    var choices = this.model.choices();
                    var selectElement = this.element.find("select");
                    var currentValue = this.model.value().toValueString();

                    _.each(choices, function (choice) {
                        var context = {
                            "ChoiceValue": choice.toValueString(),
                            "ChoiceName": choice.toString()
                        };
                        var choiceElement = $($.parseHTML(HandlebarsTemplating.templates.choiceParameterTemplate(context)));

                        if (context.ChoiceValue === currentValue) {
                            choiceElement.attr("selected", "selected");
                        }

                        selectElement.append(choiceElement);
                    });
                };

                PropertyEditPresentation.prototype.selectHandler = function (event, ui) {
                    var hiddenInput = $(this).siblings(":input[type=hidden]");
                    $(hiddenInput).attr("value", ui.item.link);
                    return true;
                };

                PropertyEditPresentation.prototype.clearHandler = function () {
                    var value = $(this).val();

                    if (value.length == 0) {
                        var hiddenInput = $(this).siblings(":input[type=hidden]");
                        $(hiddenInput).attr("value", "");
                    }
                };

                PropertyEditPresentation.prototype.commonDraw = function (isRef, template) {
                    var _this = this;
                    var title = getTitle(this.model);

                    var context = {
                        "propertyName": this.model.extensions().friendlyName,
                        "propertyValue": title,
                        "propertyError": this.error ? this.error.invalidReason : ""
                    };

                    var url = isRef ? this.model.value().toValueString() : null;

                    if (url) {
                        context["propertyUrl"] = url;
                        var dt = Spiro.Helpers.typeFromUrl(url);
                        setColourMapValues(dt, context);
                    }

                    this.element = $($.parseHTML(template(context)));

                    if (!Modernizr.inputtypes.date) {
                        (this.element.find(":input[type=date]").not(".hasDatepicker")).datepicker({ dateFormat: dateFormat });
                    }

                    var textInput = this.element.find(":input[type=text]");

                    if (isRef && !this.model.choices() && textInput.length > 0) {
                        (textInput).autocomplete({
                            autoFocus: true,
                            minLength: 2,
                            source: function (request, response) {
                                _this.trigger("autocomplete", {
                                    id: _this.propertyId,
                                    val: request.term,
                                    callback: function (result) {
                                        var acData = [];
                                        if (result.resultType() == "list") {
                                            var list = result.result().list();
                                            acData = _.map(list.value().models, function (link) {
                                                return { label: link.title(), value: link.title(), link: link.href() };
                                            });
                                        }
                                        response(acData);
                                    }
                                });
                            },
                            select: this.selectHandler
                        });
                        textInput.change(this.clearHandler);
                    }

                    this.setupEvents();
                    this.parentElement.append(this.element);
                };

                PropertyEditPresentation.prototype.getScalarEditTemplate = function () {
                    if (this.model.extensions().returnType === "boolean") {
                        return HandlebarsTemplating.templates.boolPropertyTemplate;
                    } else if (this.model.extensions().returnType === "string" && this.model.extensions().format === "date-time") {
                        return HandlebarsTemplating.templates.datePropertyTemplate;
                    } else if (this.model.choices()) {
                        return HandlebarsTemplating.templates.choicesPropertyTemplate;
                    }

                    return HandlebarsTemplating.templates.scalarPropertyEditTemplate;
                };

                PropertyEditPresentation.prototype.getReferenceEditTemplate = function () {
                    if (this.model.choices()) {
                        return HandlebarsTemplating.templates.choicesPropertyTemplate;
                    }

                    return HandlebarsTemplating.templates.referencePropertyEditTemplate;
                };

                PropertyEditPresentation.prototype.draw = function () {
                    var isRef = this.model.value().isReference();
                    var template = isRef ? this.getReferenceEditTemplate() : this.getScalarEditTemplate();
                    this.commonDraw(isRef, template);
                    this.appendOptions();
                };
                return PropertyEditPresentation;
            })(EventsMixin);

            var PropertyPresentation = (function (_super) {
                __extends(PropertyPresentation, _super);
                function PropertyPresentation(model, propertyId, parentElement) {
                    _super.call(this);
                    this.model = model;
                    this.propertyId = propertyId;
                    this.parentElement = parentElement;
                }
                PropertyPresentation.prototype.setupEvents = function () {
                    var _this = this;
                    this.element.find("a").on("click", function (event) {
                        _this.trigger("link", _this.propertyId);
                        event.preventDefault();
                    });
                };

                PropertyPresentation.prototype.clear = function () {
                };

                PropertyPresentation.prototype.draw = function () {
                    var isRef = this.model.value().isReference();
                    var template = isRef ? HandlebarsTemplating.templates.referencePropertyTemplate : HandlebarsTemplating.templates.scalarPropertyTemplate;
                    var title = getTitle(this.model);

                    var context = {
                        "propertyName": this.model.extensions().friendlyName,
                        "propertyValue": title,
                        "propertyError": ""
                    };

                    var url = isRef ? this.model.value().toValueString() : null;

                    if (url) {
                        context["propertyUrl"] = url;
                        var dt = Spiro.Helpers.typeFromUrl(url);
                        setColourMapValues(dt, context);
                    }

                    this.element = $($.parseHTML(template(context)));

                    if (!Modernizr.inputtypes.date) {
                        (this.element.find(":input[type=date]").not(".hasDatepicker")).datepicker({ dateFormat: dateFormat });
                    }

                    if (url) {
                        this.setupEvents();
                    }

                    this.parentElement.append(this.element);
                };
                return PropertyPresentation;
            })(EventsMixin);

            var CollectionMemberPresentation = (function (_super) {
                __extends(CollectionMemberPresentation, _super);
                function CollectionMemberPresentation(model, collectionId, parentElement) {
                    _super.call(this);
                    this.model = model;
                    this.collectionId = collectionId;
                    this.parentElement = parentElement;
                }
                CollectionMemberPresentation.prototype.setupEvents = function () {
                    var _this = this;
                    this.element.find("a").on("click", function (event) {
                        _this.trigger("collection", _this.collectionId);
                        event.preventDefault();
                    });
                };

                CollectionMemberPresentation.prototype.clear = function () {
                };

                CollectionMemberPresentation.prototype.draw = function () {
                    var context = {
                        "collectionName": this.model.extensions().friendlyName,
                        "collectionSize": this.model.size(),
                        "collectionPlural": this.model.extensions().pluralName,
                        "collectionUrl": this.model.detailsLink() ? this.model.detailsLink().href() : ""
                    };

                    setColourMapValues(this.model.extensions().elementType, context);
                    this.element = $($.parseHTML(HandlebarsTemplating.templates.collectionPropertyTemplate(context)));
                    this.setupEvents();
                    this.parentElement.append(this.element);
                };
                return CollectionMemberPresentation;
            })(EventsMixin);

            var ParameterPresentation = (function (_super) {
                __extends(ParameterPresentation, _super);
                function ParameterPresentation(model, parameterId, parentElement, error) {
                    _super.call(this);
                    this.model = model;
                    this.parameterId = parameterId;
                    this.parentElement = parentElement;
                    this.error = error;
                }
                ParameterPresentation.prototype.getFieldInput = function () {
                    return getFieldInput(this.element, this.model.isScalar());
                };

                ParameterPresentation.prototype.setupEvents = function () {
                    var _this = this;
                    this.element.find("a").on("click", function (event) {
                        _this.trigger("link", _this.parameterId);
                        event.preventDefault();
                    });
                };

                ParameterPresentation.prototype.clear = function () {
                };

                ParameterPresentation.prototype.getScalarTemplate = function () {
                    if (this.model.extensions().returnType === "boolean") {
                        return HandlebarsTemplating.templates.boolParameterTemplate;
                    } else if (this.model.extensions().returnType === "string" && this.model.extensions().format === "date-time") {
                        return HandlebarsTemplating.templates.dateParameterTemplate;
                    } else if (this.model.choices()) {
                        return HandlebarsTemplating.templates.choicesParameterTemplate;
                    }

                    return HandlebarsTemplating.templates.scalarParameterTemplate;
                };

                ParameterPresentation.prototype.getReferenceTemplate = function () {
                    if (this.model.choices()) {
                        return HandlebarsTemplating.templates.choicesParameterTemplate;
                    }
                    return HandlebarsTemplating.templates.referenceParameterTemplate;
                };

                ParameterPresentation.prototype.appendOptions = function () {
                    var choices = this.model.choices();
                    var selectElement = this.element.find("select");

                    _.each(choices, function (choice) {
                        var context = {
                            "ChoiceValue": choice.isReference() ? choice.link().href() : choice.scalar(),
                            "ChoiceName": choice.toString()
                        };
                        var choiceElement = $($.parseHTML(HandlebarsTemplating.templates.choiceParameterTemplate(context)));
                        selectElement.append(choiceElement);
                    });
                };

                ParameterPresentation.prototype.draw = function () {
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
                        var dt = Spiro.Helpers.typeFromUrl(url);
                        setColourMapValues(dt, context);
                    }

                    this.element = $($.parseHTML(parameterTemplate(context)));

                    this.appendOptions();

                    if (!Modernizr.inputtypes.date) {
                        (this.element.find("[type=date]").not(".hasDatepicker")).datepicker({ dateFormat: dateFormat });
                    }

                    if (url) {
                        this.setupEvents();
                    }

                    this.parentElement.append(this.element);
                };
                return ParameterPresentation;
            })(EventsMixin);

            var ActionDialogPresentation = (function (_super) {
                __extends(ActionDialogPresentation, _super);
                function ActionDialogPresentation(model) {
                    _super.call(this);
                    this.model = model;
                }
                ActionDialogPresentation.prototype.getParameterValues = function () {
                    var valueMap = {};
                    _.each(this.parameters, function (parm) {
                        valueMap[parm.parameterId] = parm.getFieldInput();
                    });
                    return valueMap;
                };

                ActionDialogPresentation.prototype.setupEvents = function () {
                    var _this = this;
                    this.element.find(".cancel").on("click", function (event) {
                        _this.trigger("cancel");
                        event.preventDefault();
                    });
                    this.element.find(".go").on("click", function (event) {
                        _this.clearErrors();
                        _this.trigger("go", _this.getParameterValues());
                        event.preventDefault();
                    });
                    this.element.find(".show").on("click", function (event) {
                        _this.clearErrors();
                        _this.trigger("show", _this.getParameterValues());
                        event.preventDefault();
                    });
                    this.element.on("keyup", function (event) {
                        if ((event).keyCode === 13) {
                            _this.trigger("show", _this.getParameterValues());
                            event.preventDefault();
                        }
                    });
                };

                ActionDialogPresentation.prototype.clearErrors = function () {
                    this.element.find(".error").html("");
                };

                ActionDialogPresentation.prototype.clear = function () {
                    this.element.remove();
                };

                ActionDialogPresentation.prototype.draw = function (errorMap) {
                    var _this = this;
                    var parentElement = $(".dialog-pane");
                    errorMap = errorMap || new Spiro.ErrorMap({}, "", "");
                    var errors = errorMap.values();
                    parentElement.html("");
                    this.parameters = [];

                    var context = setColourMapValues(this.model.extensions().returnType, {
                        "title": this.model.extensions().friendlyName,
                        "error": errorMap.invalidReason()
                    });

                    this.element = this.model.invokeLink().method() === "GET" ? $($.parseHTML(HandlebarsTemplating.templates.actionDialogQueryTemplate(context))) : $($.parseHTML(HandlebarsTemplating.templates.actionDialogOtherTemplate(context)));

                    var parameters = this.model.parameters();
                    var parametersElement = this.element.find(".parameters");

                    _.each(parameters, function (parameter, pId) {
                        var error = errors[pId];
                        var pp = new ParameterPresentation(parameter, pId, parametersElement, error);
                        _this.parameters.push(pp);
                        pp.draw();
                    });

                    this.setupEvents();
                    parentElement.append(this.element);

                    PagePresentation.setMessages(errorMap);
                };
                return ActionDialogPresentation;
            })(EventsMixin);

            var ListPresentation = (function (_super) {
                __extends(ListPresentation, _super);
                function ListPresentation(model) {
                    _super.call(this);
                    this.model = model;
                }
                ListPresentation.prototype.setupEvents = function () {
                    var _this = this;
                    this.element.find(".table").on("click", function (event) {
                        _this.trigger("table");
                        event.preventDefault();
                    });
                    this.element.find(".cancel").on("click", function (event) {
                        _this.trigger("cancel");
                        event.preventDefault();
                    });
                };

                ListPresentation.prototype.clear = function () {
                    this.element.remove();
                };

                ListPresentation.prototype.draw = function () {
                    var _this = this;
                    var parentElement = $(".collection-pane");
                    parentElement.html("");

                    var context = setColourMapValues(this.model.extensions().elementType, {
                        "collectionSize": this.model.value().models.length,
                        "collectionPlural": this.model.extensions().pluralName || "Objects"
                    });

                    this.element = $($.parseHTML(HandlebarsTemplating.templates.listTemplate(context)));
                    var items = this.model.value().models;
                    var itemsElement = this.element.find(".items");

                    _.each(items, function (link, i) {
                        var cip = new ListItemPresentation(link, i, itemsElement);
                        cip.on("link", function (id) {
                            return _this.trigger("link", id);
                        });
                        cip.draw();
                    });

                    this.setupEvents();
                    parentElement.append(this.element);
                };
                return ListPresentation;
            })(EventsMixin);

            var ListItemPresentation = (function (_super) {
                __extends(ListItemPresentation, _super);
                function ListItemPresentation(model, index, parentElement) {
                    _super.call(this);
                    this.model = model;
                    this.index = index;
                    this.parentElement = parentElement;
                }
                ListItemPresentation.prototype.setupEvents = function () {
                    var _this = this;
                    this.element.find("a").on("click", function (event) {
                        _this.trigger("link", _this.index);
                        event.preventDefault();
                    });
                };

                ListItemPresentation.prototype.clear = function () {
                };

                ListItemPresentation.prototype.draw = function () {
                    var context = {
                        "collectionItemTitle": this.model.title()
                    };

                    var url = this.model.href();

                    if (url) {
                        context["collectionItemUrl"] = url;
                        var dt = Spiro.Helpers.typeFromUrl(url);
                        setColourMapValues(dt, context);
                    }

                    this.element = $($.parseHTML(HandlebarsTemplating.templates.listItemTemplate(context)));

                    if (url) {
                        this.setupEvents();
                    }

                    this.parentElement.append(this.element);
                };
                return ListItemPresentation;
            })(EventsMixin);

            var TablePresentation = (function (_super) {
                __extends(TablePresentation, _super);
                function TablePresentation(model) {
                    _super.call(this);
                    this.model = model;
                }
                TablePresentation.prototype.setupEvents = function () {
                    var _this = this;
                    this.element.find(".list").on("click", function (event) {
                        _this.trigger("list");
                        event.preventDefault();
                    });
                    this.element.find(".cancel").on("click", function (event) {
                        _this.trigger("cancel");
                        event.preventDefault();
                    });
                };

                TablePresentation.prototype.clear = function () {
                    this.element.remove();
                };

                TablePresentation.prototype.buildHeader = function (models) {
                    var header = [];

                    function insertColumns(header, model) {
                        var members = _.map(model.propertyMembers(), function (pm, id) {
                            return { id: id, name: pm.extensions().friendlyName };
                        });

                        var headerIndex = 0;
                        for (var i = 0; i < members.length; i++) {
                            var curMember = members[i];

                            if (header[headerIndex]) {
                                if (!_.some(header, function (item) {
                                    return item.id === curMember.id;
                                })) {
                                    header.splice(headerIndex, 0, curMember);
                                    headerIndex++;
                                }
                            } else {
                                header[headerIndex] = curMember;
                            }
                            headerIndex++;
                        }
                    }

                    _.each(models, function (model) {
                        insertColumns(header, model);
                    });

                    return header;
                };

                TablePresentation.prototype.drawHeader = function (models) {
                    var header = this.buildHeader(models);

                    var itemsElement = $(".collection-pane .items");

                    var headerTemplate = HandlebarsTemplating.templates.tableRowTemplate;
                    itemsElement.prepend(headerTemplate);
                    var parentElement = itemsElement.children().first();

                    _.each(header, function (item) {
                        var template = HandlebarsTemplating.templates.tableCellTemplate;

                        var context = {
                            "propertyId": item.id,
                            "propertyValue": item.name
                        };

                        var headerElement = $($.parseHTML(template(context)));
                        parentElement.append(headerElement);
                    });

                    this.alignTableColumns();
                };

                TablePresentation.prototype.alignTableColumns = function () {
                    var headerCells = $(".collection-pane .items .properties").first().children();
                    var rows = $(".collection-pane .items .properties").slice(1);

                    function getEmptyCell(id) {
                        var template = HandlebarsTemplating.templates.tableCellTemplate;
                        var context = { "propertyId": id, "propertyValue": "" };
                        return $($.parseHTML(template(context)));
                    }

                    function padCells(row) {
                        var rowCells = $(row).children();
                        var padded = false;

                        headerCells.each(function (index, cell) {
                            var headerCellId = $(cell).attr('data-id');
                            var curRowCell = $(rowCells[index]);

                            if (curRowCell.length > 0 && curRowCell.attr('data-id') !== headerCellId) {
                                getEmptyCell(headerCellId).insertBefore(curRowCell);
                                padded = true;
                                return false;
                            } else if (curRowCell.length == 0) {
                                var prevRowCell = $(rowCells[index - 1]);
                                getEmptyCell(headerCellId).insertAfter(prevRowCell);
                                padded = true;
                                return false;
                            }
                        });
                        return padded;
                    }

                    rows.each(function (index, row) {
                        while (padCells(row)) {
                        }
                    });
                };

                TablePresentation.prototype.draw = function (models) {
                    if (models) {
                        this.drawHeader(models);
                    } else {
                        var parentElement = $(".collection-pane");
                        parentElement.html("");

                        var context = {
                            "collectionSize": this.model.value().models.length,
                            "collectionPlural": this.model.extensions().pluralName || "Objects"
                        };

                        setColourMapValues(this.model.extensions().elementType, context);
                        this.element = $($.parseHTML(HandlebarsTemplating.templates.tableTemplate(context)));
                        this.setupEvents();
                        parentElement.append(this.element);
                    }
                };
                return TablePresentation;
            })(EventsMixin);

            var TableRowPresentation = (function (_super) {
                __extends(TableRowPresentation, _super);
                function TableRowPresentation(model) {
                    _super.call(this);
                    this.model = model;
                }
                TableRowPresentation.prototype.setupEvents = function () {
                };

                TableRowPresentation.prototype.clear = function () {
                };

                TableRowPresentation.prototype.draw = function () {
                    var _this = this;
                    var parentElement = $(".table-view > .items");
                    var context = setColourMapValues(this.model.domainType(), { "title": this.model.title() });

                    this.element = $($.parseHTML(HandlebarsTemplating.templates.tableRowTemplate(context)));

                    var properties = this.model.propertyMembers();
                    _.each(properties, function (property, pId) {
                        var pp = new TableCellPresentation(property, pId, true, _this.element);
                        pp.on("link", function (id) {
                            return _this.trigger("link", id);
                        });
                        pp.draw();
                    });

                    this.setupEvents();
                    parentElement.append(this.element);
                };
                return TableRowPresentation;
            })(EventsMixin);

            var TableCellPresentation = (function (_super) {
                __extends(TableCellPresentation, _super);
                function TableCellPresentation(model, propertyId, isRow, parentElement) {
                    _super.call(this);
                    this.model = model;
                    this.propertyId = propertyId;
                    this.isRow = isRow;
                    this.parentElement = parentElement;
                }
                TableCellPresentation.prototype.setupEvents = function () {
                    var _this = this;
                    this.element.find("a").on("click", function (event) {
                        _this.trigger("link", _this.propertyId);
                        event.preventDefault();
                    });
                };

                TableCellPresentation.prototype.clear = function () {
                };

                TableCellPresentation.prototype.draw = function () {
                    var isRef = this.model.value().isReference();
                    var template = HandlebarsTemplating.templates.tableCellTemplate;

                    var title = getTitle(this.model);

                    var context = {
                        "propertyId": this.propertyId,
                        "propertyValue": title
                    };

                    this.element = $($.parseHTML(template(context)));
                    this.parentElement.append(this.element);
                };
                return TableCellPresentation;
            })(EventsMixin);

            var ObjectPresentation = (function (_super) {
                __extends(ObjectPresentation, _super);
                function ObjectPresentation(model) {
                    _super.call(this);
                    this.model = model;
                }
                ObjectPresentation.prototype.appendEditProperty = function (model, propertiesElement) {
                    var _this = this;
                    var pp = new PropertyEditPresentation(model, propertiesElement);
                    pp.on("link", function (id) {
                        return _this.trigger("link", id);
                    });
                    pp.on("autocomplete", function (id) {
                        return _this.trigger("autocomplete", id);
                    });
                    pp.draw();

                    this.editProperties.push(pp);
                };

                ObjectPresentation.prototype.appendProperties = function (parentElement, errors, isEdit) {
                    var _this = this;
                    var propertiesElement = parentElement.find(".properties");
                    var hasProperties = false;
                    this.editProperties = [];

                    var properties = this.model.propertyMembers();
                    _.each(properties, function (property, pId) {
                        var error = (errors || {})[pId];

                        if (isEdit && !property.disabledReason()) {
                            var details = property.getDetails();
                            details.once('sync', function (details) {
                                return _this.appendEditProperty(details, propertiesElement);
                            });
                            details.fetch();
                        } else {
                            var pp = new PropertyPresentation(property, pId, propertiesElement);
                            pp.on("link", function (id) {
                                return _this.trigger("link", id);
                            });
                            pp.draw();
                        }
                        hasProperties = true;
                    });

                    var collections = this.model.collectionMembers();
                    _.each(collections, function (collection, cId) {
                        var cp = new CollectionMemberPresentation(collection, cId, propertiesElement);
                        cp.on("collection", function (id) {
                            return _this.trigger("collection", id);
                        });
                        cp.draw();
                        hasProperties = true;
                    });

                    return hasProperties;
                };
                return ObjectPresentation;
            })(EventsMixin);

            var NestedObjectPresentation = (function (_super) {
                __extends(NestedObjectPresentation, _super);
                function NestedObjectPresentation(model) {
                    _super.call(this, model);
                }
                NestedObjectPresentation.prototype.setupEvents = function () {
                    var _this = this;
                    this.element.find(".expand").on("click", function (event) {
                        _this.trigger("expand");
                        event.preventDefault();
                    });
                    this.element.find(".cancel").on("click", function (event) {
                        _this.trigger("cancel");
                        event.preventDefault();
                    });
                };

                NestedObjectPresentation.prototype.clear = function () {
                    this.element.remove();
                };

                NestedObjectPresentation.prototype.drawProperties = function () {
                    this.appendProperties(this.element);
                };

                NestedObjectPresentation.prototype.draw = function () {
                    var parentElement = $(".object-pane");
                    parentElement.html("");
                    var context = setColourMapValues(this.model.domainType(), { "title": this.model.title() });

                    this.element = $($.parseHTML(HandlebarsTemplating.templates.nestedObjectTemplate(context)));
                    this.drawProperties();
                    this.setupEvents();

                    parentElement.append(this.element);
                };
                return NestedObjectPresentation;
            })(ObjectPresentation);

            var DomainObjectEditPresentation = (function (_super) {
                __extends(DomainObjectEditPresentation, _super);
                function DomainObjectEditPresentation(model) {
                    _super.call(this, model);
                }
                DomainObjectEditPresentation.prototype.clear = function () {
                };

                DomainObjectEditPresentation.prototype.getPropertyValues = function () {
                    var valueMap = {};
                    _.each(this.editProperties, function (prop) {
                        valueMap[prop.propertyId] = prop.getFieldInput();
                    });
                    return valueMap;
                };

                DomainObjectEditPresentation.prototype.setupEvents = function () {
                    var _this = this;
                    $(".properties-pane").find(".save").on("click", function (event) {
                        _this.trigger("save", _this.getPropertyValues());
                        event.preventDefault();
                    });

                    $(".properties-pane").find(".cancel").on("click", function (event) {
                        _this.trigger("cancel");
                        event.preventDefault();
                    });
                };

                DomainObjectEditPresentation.prototype.drawActions = function () {
                    $(".actions-pane").html("");
                };

                DomainObjectEditPresentation.prototype.drawProperties = function (errors) {
                    var allProperties = $($.parseHTML(HandlebarsTemplating.templates.propertiesEditTemplate({})));
                    var hasProperties = this.appendProperties(allProperties, errors, true);

                    if (hasProperties) {
                        $(".properties-pane").html("");
                        $(".properties-pane").append(allProperties);
                        this.setupEvents();
                    }
                };

                DomainObjectEditPresentation.prototype.draw = function (errorMap) {
                    errorMap = errorMap || new Spiro.ErrorMap({}, "", "");
                    var errors = errorMap.values();
                    this.drawActions();
                    this.drawProperties(errors);
                };
                return DomainObjectEditPresentation;
            })(ObjectPresentation);

            var DomainObjectPresentation = (function (_super) {
                __extends(DomainObjectPresentation, _super);
                function DomainObjectPresentation(model) {
                    _super.call(this, model);
                }
                DomainObjectPresentation.prototype.clear = function () {
                };

                DomainObjectPresentation.prototype.setupEvents = function () {
                    var _this = this;
                    $(".properties-pane").find(".edit").on("click", function (event) {
                        _this.trigger("edit");
                        event.preventDefault();
                    });
                    $(".app-bar .edit").on("click", function (event) {
                        _this.trigger("edit");
                        event.preventDefault();
                    });
                    $(".app-bar .edit").removeClass("disabled");
                };

                DomainObjectPresentation.prototype.drawActions = function () {
                    var _this = this;
                    var allActions = $($.parseHTML(HandlebarsTemplating.templates.actionsTemplate({})));
                    var actionsElement = allActions.find(".actions");
                    var actions = this.model.actionMembers();

                    _.each(actions, function (action, aId) {
                        var ap = new ActionPresentation(action, aId, actionsElement);
                        ap.on("action", function (id) {
                            return _this.trigger("action", id);
                        });
                        ap.draw();
                    });

                    $(".actions-pane").append(allActions);
                };

                DomainObjectPresentation.prototype.drawProperties = function () {
                    var allProperties = $($.parseHTML(HandlebarsTemplating.templates.propertiesTemplate({})));
                    var hasProperties = this.appendProperties(allProperties);

                    if (hasProperties) {
                        $(".properties-pane").html("");
                        $(".properties-pane").append(allProperties);
                        this.setupEvents();
                    }
                };

                DomainObjectPresentation.prototype.draw = function () {
                    this.drawActions();
                    this.drawProperties();
                };
                return DomainObjectPresentation;
            })(ObjectPresentation);

            var ServiceLinkPresentation = (function (_super) {
                __extends(ServiceLinkPresentation, _super);
                function ServiceLinkPresentation(model, index, parentElement) {
                    _super.call(this);
                    this.model = model;
                    this.index = index;
                    this.parentElement = parentElement;
                }
                ServiceLinkPresentation.prototype.setupEvents = function () {
                    var _this = this;
                    this.element.find("a").on("click", function (event) {
                        _this.trigger("link", _this.index);
                        event.preventDefault();
                    });
                };

                ServiceLinkPresentation.prototype.clear = function () {
                };

                ServiceLinkPresentation.prototype.draw = function () {
                    var url = this.model.href();
                    var dt = Spiro.Helpers.typeFromUrl(url);
                    var context = setColourMapValues(dt, { "serviceName": this.model.title(), "serviceUrl": url });

                    this.element = $($.parseHTML(HandlebarsTemplating.templates.serviceLinkTemplate(context)));
                    this.setupEvents();
                    this.parentElement.append(this.element);
                };
                return ServiceLinkPresentation;
            })(EventsMixin);

            var PagePresentation = (function (_super) {
                __extends(PagePresentation, _super);
                function PagePresentation() {
                    _super.call(this);
                    this.setupEvents();
                }
                PagePresentation.prototype.setupEvents = function () {
                    var _this = this;
                    $(".home").on("click", function (event) {
                        _this.trigger("home");
                        event.preventDefault();
                    });
                    $(".back").on("click", function (event) {
                        _this.trigger("back");
                        event.preventDefault();
                    });
                    $(".forward").on("click", function (event) {
                        _this.trigger("forward");
                        event.preventDefault();
                    });
                };

                PagePresentation.setMessages = function (errorMap) {
                    $(".messages").html("");
                    if (errorMap && errorMap.warningMessage) {
                        $(".messages").append(errorMap.warningMessage);
                    }
                };

                PagePresentation.prototype.clearColour = function (cls) {
                    _.each(cls, function (c) {
                        var el = $("." + c);
                        el.removeClass();
                        el.addClass(c);
                    });
                };

                PagePresentation.prototype.clearColourClasses = function () {
                    this.clearColour(["properties-pane", "object-view", "actions-pane"]);
                };

                PagePresentation.prototype.clearHtml = function (cls) {
                    _.each(cls, function (c) {
                        return $("." + c).html("");
                    });
                };

                PagePresentation.prototype.clear = function () {
                    this.clearHtml(["properties-pane", "actions-pane", "dialog-pane", "collection-pane", "object-pane", "type"]);
                    this.clearColourClasses();
                    $(".messages").html("");
                    $(".app-bar .edit").off();
                    $(".app-bar .edit").addClass("disabled");
                };

                PagePresentation.prototype.addColourClass = function (cls, colourMap) {
                    _.each(cls, function (c) {
                        $("." + c).addClass("bg-color-" + colourMap["backgroundColor"]);
                    });
                };

                PagePresentation.prototype.draw = function () {
                    var title;
                    var colourMap;
                    var type;

                    if (this.model instanceof Spiro.DomainObjectRepresentation) {
                        var dor = this.model;
                        title = dor.title();
                        colourMap = getColourMapValues(dor.domainType() || dor.serviceId());
                        type = dor.extensions().friendlyName;
                    } else {
                        title = "Services";
                        colourMap = getColourMapValues("");
                        type = "Domain Services";
                    }

                    this.clear();
                    this.addColourClass(["object-view", "properties-pane", "actions-pane"], colourMap);

                    $(".type").text(type);
                    $(".title").text(title);
                };
                return PagePresentation;
            })(EventsMixin);

            var ServicesPresentation = (function (_super) {
                __extends(ServicesPresentation, _super);
                function ServicesPresentation(model) {
                    _super.call(this);
                    this.model = model;
                }
                ServicesPresentation.prototype.clear = function () {
                };

                ServicesPresentation.prototype.draw = function () {
                    var _this = this;
                    this.element = $(".properties-pane");
                    _.each(this.model.value().models, function (link, i) {
                        var sp = new ServiceLinkPresentation(link, i, _this.element);
                        sp.on("link", function (id) {
                            return _this.trigger("link", id);
                        });
                        sp.draw();
                    });
                };
                return ServicesPresentation;
            })(EventsMixin);

            function handleKey(event) {
                if (event.keyCode == 36) {
                    $(".home").click();
                    return false;
                }

                if (event.keyCode == 39) {
                    $(".forward").click();
                    return false;
                }
                if (event.keyCode == 37) {
                    $(".back").click();
                    return false;
                }

                return true;
            }

            $(document).bind("keydown", handleKey);

            Modern.presentationFactory = new HandlebarsPresentationFactory();
        })(Modern.HandlebarsTemplating || (Modern.HandlebarsTemplating = {}));
        var HandlebarsTemplating = Modern.HandlebarsTemplating;
    })(Spiro.Modern || (Spiro.Modern = {}));
    var Modern = Spiro.Modern;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.modern.presentations.handlebars.js.map
