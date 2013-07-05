var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Spiro;
(function (Spiro) {
    (function (Modern) {
        Spiro.sync = function (method, model, options) {
            var wrapped = Backbone.cachingSync(Backbone.sync);
            wrapped(method, model, options);
        };

        var FragmentHelper = (function () {
            function FragmentHelper(initialValue) {
                this.initialValue = initialValue;
                this.parmMap = {};
                var splitUrl = initialValue.split("?");
                this.rootUrl = splitUrl[0];
                var parms = splitUrl[1];

                if (parms) {
                    var splitParms = parms.split("&");

                    for (var i = 0; i < splitParms.length; i++) {
                        var splitParm = splitParms[i].split("=");
                        var pId = splitParm[0];
                        var pVal = splitParm[1];

                        this.parmMap[pId] = pVal;
                    }
                }
            }
            FragmentHelper.prototype.hasParms = function () {
                for (var p in this.parmMap) {
                    return true;
                }
                return false;
            };

            FragmentHelper.prototype.addParm = function (name, fragment) {
                this.parmMap[name] = fragment;
            };

            FragmentHelper.prototype.clearParm = function (name) {
                delete this.parmMap[name];
            };

            FragmentHelper.prototype.getParm = function (name) {
                return this.parmMap[name] || "";
            };

            FragmentHelper.prototype.addNested = function (fragment) {
                this.addParm("nested", fragment);
            };

            FragmentHelper.prototype.clearNested = function () {
                this.clearParm("nested");
            };

            FragmentHelper.prototype.getNested = function () {
                return this.getParm("nested");
            };

            FragmentHelper.prototype.addDialog = function (fragment) {
                this.addParm("dialog", fragment);
            };

            FragmentHelper.prototype.clearDialog = function () {
                this.clearParm("dialog");
            };

            FragmentHelper.prototype.getDialog = function () {
                return this.getParm("dialog");
            };

            FragmentHelper.prototype.addCollection = function (fragment) {
                this.addParm("collection", fragment);
            };

            FragmentHelper.prototype.clearCollection = function () {
                this.clearParm("collection");
            };

            FragmentHelper.prototype.getCollection = function () {
                return this.getParm("collection");
            };

            FragmentHelper.prototype.currentValue = function () {
                var url = this.rootUrl;
                if (this.hasParms()) {
                    url += "?";
                    for (var p in this.parmMap) {
                        url += (p + "=" + this.parmMap[p] + "&");
                    }

                    url = url.slice(0, -1);
                }
                return url;
            };
            return FragmentHelper;
        })();

        var AppRouter = (function (_super) {
            __extends(AppRouter, _super);
            function AppRouter(options) {
                _super.call(this, options);
            }
            AppRouter.prototype.home = function () {
                var domainServices = new Spiro.DomainServicesRepresentation();
                domainServices.hateoasUrl = appPath + "/services";
                ControllerFactory.CreateControllerAndFetch(domainServices, {});
            };

            AppRouter.prototype.redraw = function (id, type) {
                var helper = new FragmentHelper(id);

                var obj = new Spiro.DomainObjectRepresentation();
                obj.hateoasUrl = appPath + type + helper.rootUrl;
                var opt = { doNotNavigate: true };
                var doc = ControllerFactory.CreateControllerAndFetch(obj, opt);
            };

            AppRouter.prototype.service = function (id) {
                this.redraw(id, "/services/");
            };

            AppRouter.prototype.object = function (id) {
                this.redraw(id, "/objects/");
            };
            return AppRouter;
        })(Backbone.Router);

        var app = new AppRouter({
            "routes": {
                "": "home",
                "services/*id": "service",
                "objects/*id": "object"
            }
        });

        var PageController = (function (_super) {
            __extends(PageController, _super);
            function PageController(options) {
                _super.call(this, options);
                _.bindAll(this, 'render');
                this.presentation = Modern.presentationFactory.PagePresentation();
                this.presentation.on('home', this.home);
                this.presentation.on('back', this.back);
                this.presentation.on('forward', this.forward);
            }
            PageController.prototype.changeModel = function (model) {
                var _this = this;
                if (this.model) {
                    this.model.off();
                }

                this.model = model;
                _.each(['change', 'reset', 'draw'], function (evt) {
                    return _this.model.on(evt, _this.render);
                });

                Modern.presentationFactory.PagePresentation(model);
            };

            PageController.prototype.home = function () {
                app.home();
            };

            PageController.prototype.back = function () {
                parent.history.back();
            };

            PageController.prototype.forward = function () {
                parent.history.forward();
            };

            PageController.prototype.render = function () {
                this.presentation.draw();
                return this;
            };
            return PageController;
        })(Backbone.View);

        var pageController = new PageController();

        var ControllerFactory = (function () {
            function ControllerFactory() {
            }
            ControllerFactory.servicesController = function (model, options) {
                pageController.changeModel(model);
                return new ServicesController(model, options);
            };

            ControllerFactory.objectController = function (model, options) {
                if (options.nest) {
                    return new NestedDomainObjectController(model, options);
                } else if (options.row) {
                    return new DomainObjectController(model, options);
                }
                pageController.changeModel(model);
                return new DomainObjectController(model, options);
            };

            ControllerFactory.CreateControllerAndFetch = function (model, options) {
                var controller = ControllerFactory.CreateController(model, options);
                model.fetch();
                return controller;
            };

            ControllerFactory.CreateControllerAndDraw = function (model, options) {
                var controller = ControllerFactory.CreateController(model, options);
                model.trigger("draw");
                return controller;
            };

            ControllerFactory.CreateController = function (model, options) {
                var controller = ControllerFactory.ControllerMap[Spiro.Helpers.getClassName(model)](model, options);

                if (options.controllerEvent) {
                    options.controllerEvent(controller);
                }

                return controller;
            };
            ControllerFactory.ControllerMap = {
                "HomePageRepresentation": function (model, options) {
                    return new HomeController(model, options);
                },
                "DomainServicesRepresentation": function (model, options) {
                    return ControllerFactory.servicesController(model, options);
                },
                "DomainObjectRepresentation": function (model, options) {
                    return ControllerFactory.objectController(model, options);
                },
                "ListRepresentation": function (model, options) {
                    return new ListController(model, options);
                },
                "ActionResultRepresentation": function (model, options) {
                    return new ResultController(model, options);
                },
                "CollectionRepresentation": function (model, options) {
                    return new ListController(model, options);
                },
                "ActionRepresentation": function (model, options) {
                    return new ActionController(model, options);
                }
            };
            return ControllerFactory;
        })();

        var ResultController = (function (_super) {
            __extends(ResultController, _super);
            function ResultController(model, options) {
                var _this = this;
                _super.call(this, options);
                this.model = model;
                this.options = options;
                _.bindAll(this, 'render');
                _.each(['change', 'reset', 'draw'], function (evt) {
                    return _this.model.once(evt, _this.render);
                });
                this.model.once('error', function (e) {
                    return _this.trigger("error", e);
                });
            }
            ResultController.prototype.render = function () {
                var result = this.model.result();
                var resultType = this.model.resultType();

                if (resultType === "object") {
                    var resultObject = result.object();

                    if (resultObject) {
                        this.cache(resultObject);
                        var controller = ControllerFactory.CreateControllerAndDraw(resultObject, this.options);
                    } else {
                        this.options.actingController.render();
                    }
                }

                if (resultType === "list") {
                    var resultList = result.list();
                    var controller = ControllerFactory.CreateControllerAndDraw(resultList, this.options);
                }

                return this;
            };

            ResultController.prototype.cache = function (obj) {
                if (obj && obj.selfLink()) {
                    obj.id = obj.url();
                    Spiro.sync('cache', obj);
                }
            };
            return ResultController;
        })(Backbone.View);

        var ActionController = (function (_super) {
            __extends(ActionController, _super);
            function ActionController(model, options) {
                var _this = this;
                _super.call(this, options);
                this.model = model;
                this.options = options;
                this.presentation = Modern.presentationFactory.CreatePresentation(this.model, {});

                _.bindAll(this, 'render', 'renderWithError', 'show', 'go', 'cancel');
                _.each(['change', 'reset', 'draw'], function (evt) {
                    return _this.model.on(evt, _this.render);
                });

                this.presentation.on("show", this.show);
                this.presentation.on("go", this.go);
                this.presentation.on("cancel", this.cancel);
            }
            ActionController.prototype.getInvoke = function (values) {
                var invoke = this.model.getInvoke();

                for (var id in values) {
                    invoke.setParameter(id, values[id]);
                }
                return invoke;
            };

            ActionController.prototype.cancel = function () {
                this.presentation.clear();
                var helper = new FragmentHelper(Backbone.history.getFragment());
                helper.clearDialog();
                app.navigate(helper.currentValue(), { replace: true });
            };

            ActionController.prototype.show = function (values) {
                var invoke = this.getInvoke(values);
                var ac = ControllerFactory.CreateControllerAndFetch(invoke, { nest: true });
                ac.once("error", this.renderWithError);
            };

            ActionController.prototype.go = function (values) {
                var invoke = this.getInvoke(values);
                var ac = ControllerFactory.CreateControllerAndFetch(invoke, {});
                ac.once("error", this.renderWithError);
            };

            ActionController.prototype.navigate = function () {
            };

            ActionController.prototype.renderWithError = function (error) {
                this.presentation.draw(error);
                return this;
            };

            ActionController.prototype.render = function () {
                this.presentation.draw();
                this.navigate();
                return this;
            };
            return ActionController;
        })(Backbone.View);

        var ListController = (function (_super) {
            __extends(ListController, _super);
            function ListController(model, options) {
                var _this = this;
                _super.call(this, options);
                this.model = model;
                this.options = options;

                this.listOrCollection = model;
                this.listPresentation = Modern.presentationFactory.CreatePresentation(this.model, { list: true });
                this.tablePresentation = Modern.presentationFactory.CreatePresentation(this.model, { table: true });

                this.presentation = this.listPresentation;

                _.bindAll(this, 'render', 'drawHeader', 'table', 'list', 'link', 'cancel');
                _.each(['change', 'reset', 'draw'], function (evt) {
                    return _this.model.on(evt, _this.render);
                });

                this.listPresentation.on("table", this.table);
                this.tablePresentation.on("list", this.list);
                this.listPresentation.on("link", this.link);
                this.listPresentation.on("cancel", this.cancel);
                this.tablePresentation.on("cancel", this.cancel);
            }
            ListController.prototype.link = function (index) {
                var target = this.listOrCollection.value().models[index].getTarget();
                ControllerFactory.CreateControllerAndFetch(target, { nest: true });
            };

            ListController.prototype.drawHeader = function (model) {
                this.rows.push(model);

                if (this.rows.length === this.listOrCollection.value().models.length) {
                    this.presentation.draw(this.rows);
                }
            };

            ListController.prototype.table = function () {
                var _this = this;
                this.presentation = this.tablePresentation;
                this.render();
                var links = this.listOrCollection.value();
                this.rows = [];

                for (var i = 0; i < links.models.length; i++) {
                    var target = links.models[i].getTarget();
                    var controller = ControllerFactory.CreateControllerAndFetch(target, {
                        row: true,
                        doNotNavigate: true,
                        controllerEvent: function (c) {
                            return c.on("render", _this.drawHeader);
                        }
                    });
                }
            };

            ListController.prototype.list = function () {
                this.presentation = this.listPresentation;
                this.render();
            };

            ListController.prototype.cancel = function () {
                this.presentation.clear();
            };

            ListController.prototype.render = function () {
                this.presentation.draw();
                return this;
            };
            return ListController;
        })(Backbone.View);

        var NestedDomainObjectController = (function (_super) {
            __extends(NestedDomainObjectController, _super);
            function NestedDomainObjectController(model, options) {
                var _this = this;
                _super.call(this, options);
                this.model = model;
                this.options = options;

                this.presentation = Modern.presentationFactory.CreatePresentation(this.model, { nest: true });

                _.bindAll(this, 'render', 'expand', 'link', 'cancel');
                _.each(['change', 'reset', 'draw'], function (evt) {
                    return _this.model.on(evt, _this.render);
                });

                this.presentation.on("expand", this.expand);
                this.presentation.on("cancel", this.cancel);
                this.presentation.on("link", this.link);
            }
            NestedDomainObjectController.prototype.link = function (aId) {
                var target = this.model.propertyMember(aId).value().link().getTarget();
                ControllerFactory.CreateControllerAndFetch(target, {});
            };

            NestedDomainObjectController.prototype.expand = function () {
                var Controller = ControllerFactory.CreateControllerAndDraw(this.model, {});
            };

            NestedDomainObjectController.prototype.cancel = function () {
                this.presentation.clear();
                var helper = new FragmentHelper(Backbone.history.getFragment());
                helper.clearNested();
                app.navigate(helper.currentValue(), { replace: true });
            };

            NestedDomainObjectController.prototype.objectUrlFragment = function () {
                return this.model.domainType() + "/" + this.model.instanceId();
            };

            NestedDomainObjectController.prototype.navigate = function () {
            };

            NestedDomainObjectController.prototype.render = function () {
                this.presentation.draw();
                this.navigate();
                return this;
            };
            return NestedDomainObjectController;
        })(Backbone.View);

        var DomainObjectController = (function (_super) {
            __extends(DomainObjectController, _super);
            function DomainObjectController(model, options) {
                var _this = this;
                _super.call(this, options);
                this.model = model;
                this.options = options;
                this.viewPresentation = Modern.presentationFactory.CreatePresentation(this.model, options);

                _.bindAll(this, 'render', 'renderWithError', 'editSuccess', 'action', 'edit', 'link', 'collection', 'save', 'cancel', 'autocomplete');
                _.each(['change', 'reset', 'draw'], function (evt) {
                    return _this.model.on(evt, _this.render);
                });

                this.viewPresentation.on("action", this.action);
                this.viewPresentation.on("link", this.link);
                this.viewPresentation.on("collection", this.collection);
                this.viewPresentation.on("edit", this.edit);

                this.editPresentation = Modern.presentationFactory.CreatePresentation(this.model, { edit: true });

                this.editPresentation.on("link", this.link);
                this.editPresentation.on("collection", this.collection);
                this.editPresentation.on("save", this.save);
                this.editPresentation.on("cancel", this.cancel);
                this.editPresentation.on("autocomplete", this.autocomplete);

                this.presentation = this.viewPresentation;
            }
            DomainObjectController.prototype.action = function (aId) {
                if (this.model.actionMember(aId).extensions().hasParams) {
                    var action = this.model.actionMember(aId).getDetails();
                    ControllerFactory.CreateControllerAndFetch(action, { nest: true });
                } else {
                    var actionResult = Spiro.Helpers.createActionInvoke(this.model, aId);
                    ControllerFactory.CreateControllerAndFetch(actionResult, { nest: true });
                }
            };

            DomainObjectController.prototype.autocomplete = function (parm) {
                var actionResult = Spiro.Helpers.createActionInvoke(this.model, parm.id + "AutoComplete");
                actionResult.setParameter("name", new Spiro.Value(parm.val));
                actionResult.once("change", parm.callback);
                actionResult.fetch();
            };

            DomainObjectController.prototype.edit = function () {
                this.presentation = this.editPresentation;
                this.render();
            };

            DomainObjectController.prototype.save = function (values) {
                var updateMap = this.model.getUpdateMap();

                _.each(values, function (value, name) {
                    updateMap.setProperty(name, value);
                });

                updateMap.once("error", this.renderWithError);
                updateMap.once("success", this.editSuccess);

                var options = {
                    success: function () {
                        return updateMap.trigger("success");
                    }
                };

                updateMap.save(options);
            };

            DomainObjectController.prototype.cancel = function () {
                this.presentation = this.viewPresentation;
                this.render();
            };

            DomainObjectController.prototype.link = function (aId) {
                var target = this.model.propertyMember(aId).value().link().getTarget();
                ControllerFactory.CreateControllerAndFetch(target, { nest: true });
            };

            DomainObjectController.prototype.collection = function (aId) {
                var target = this.model.collectionMember(aId).getDetails();
                ControllerFactory.CreateControllerAndFetch(target, { nest: true });
            };

            DomainObjectController.prototype.serviceUrlFragment = function () {
                return "services/" + this.model.serviceId();
            };

            DomainObjectController.prototype.objectUrlFragment = function () {
                if (this.model.persistLink()) {
                    return "objects/" + this.model.extensions().domainType;
                }

                return "objects/" + this.model.domainType() + "/" + this.model.instanceId();
            };

            DomainObjectController.prototype.navigate = function () {
                if (!this.options.doNotNavigate) {
                    var fragment = this.model.extensions().isService ? this.serviceUrlFragment() : this.objectUrlFragment();
                    app.navigate(fragment);
                }
            };

            DomainObjectController.prototype.editSuccess = function () {
                this.presentation = this.viewPresentation;
                this.render();
                return this;
            };

            DomainObjectController.prototype.renderWithError = function (errorMap) {
                this.presentation.draw(errorMap);
                this.navigate();
                this.trigger("render", this.model);
                return this;
            };

            DomainObjectController.prototype.render = function () {
                this.presentation.draw();
                this.navigate();
                this.trigger("render", this.model);
                return this;
            };
            return DomainObjectController;
        })(Backbone.View);

        var ServicesController = (function (_super) {
            __extends(ServicesController, _super);
            function ServicesController(model, options) {
                var _this = this;
                _super.call(this, options);
                this.model = model;
                this.options = options;
                this.presentation = Modern.presentationFactory.CreatePresentation(this.model, {});

                _.bindAll(this, 'render', 'link');
                _.each(['change', 'reset', 'draw'], function (evt) {
                    return _this.model.on(evt, _this.render);
                });

                this.presentation.on("link", this.link);
            }
            ServicesController.prototype.link = function (aId) {
                var service = this.model.value().models[aId].getTarget();
                ControllerFactory.CreateControllerAndFetch(service, {});
            };

            ServicesController.prototype.navigate = function () {
                if (!this.options.doNotNavigate) {
                    app.navigate("");
                }
            };

            ServicesController.prototype.render = function () {
                this.presentation.draw();
                this.navigate();
                return this;
            };
            return ServicesController;
        })(Backbone.View);

        var HomeController = (function (_super) {
            __extends(HomeController, _super);
            function HomeController(model, options) {
                var _this = this;
                _super.call(this, options);
                this.model = model;
                this.options = options;
                _.bindAll(this, 'render');
                _.each(['change', 'reset', 'draw'], function (evt) {
                    return _this.model.on(evt, _this.render);
                });
            }
            HomeController.prototype.navigate = function () {
                if (!this.options.doNotNavigate) {
                    app.navigate("home");
                }
            };

            HomeController.prototype.render = function () {
                this.navigate();
                var domainServices = this.model.getDomainServices();
                ControllerFactory.CreateControllerAndFetch(domainServices, {});
                return this;
            };
            return HomeController;
        })(Backbone.View);

        Backbone.history.start();
    })(Spiro.Modern || (Spiro.Modern = {}));
    var Modern = Spiro.Modern;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.modern.js.map
