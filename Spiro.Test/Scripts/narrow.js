var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Spiro;
(function (Spiro) {
    (function (Narrow) {
        function displayOnMain() {
            $("#main").html("");
            return $("#main");
        }
        ; ;
        function renderOnMain(view, content) {
            view.$el.html(content);
            displayOnMain().html(view.$el);
            return view;
        }
        var home;
        var OrderPage = (function (_super) {
            __extends(OrderPage, _super);
            function OrderPage(model, options) {
                        _super.call(this, options);
                this.model = model;
                _.bindAll(this, 'render');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            OrderPage.prototype.renderOrder = function () {
                var order = this.model;
                var acnTag = Tags.Tag("p", "", "Order no: " + order.propertyMembers()["SalesOrderNumber"].value());
                var cTag = Tags.Tag("p", "", "Customer: " + order.propertyMembers()["Customer"].value());
                var aTag = Tags.Tag("p", "", "Amount: " + order.propertyMembers()["TotalDue"].value());
                return acnTag.toString() + cTag + aTag;
            };
            OrderPage.prototype.render = function () {
                return renderOnMain(this, this.renderOrder());
            };
            return OrderPage;
        })(Backbone.View);        
        var ConfirmOrderPage = (function (_super) {
            __extends(ConfirmOrderPage, _super);
            function ConfirmOrderPage(model, options) {
                        _super.call(this, options);
                this.model = model;
                this.events = {
                    "click :button": "onOK"
                };
                _.bindAll(this, 'render', 'onOK');
                this.model.bind('change', this.render);
                this.model.bind('reset', this.render);
                this.delegateEvents();
            }
            ConfirmOrderPage.prototype.onOK = function (e) {
                var _this = this;
                var invoke = Spiro.Helpers.createActionInvoke(this.model, "CreateNewOrder");
                Spiro.Helpers.invoke(invoke, {
                    "copyHeaderFromLastOrder": true
                }, {
                    "success": function (originalModel, resp, iOptions) {
                        var order = invoke.result().object();
                        var members = {
                            "SalesOrderNumber": "placeholder",
                            "CreditCardApprovalCode": "placeholder"
                        };
                        Spiro.Helpers.persist(order, members, {
                            "success": function (originalModel, resp, iOptions) {
                                var innerInvoke = Spiro.Helpers.createActionInvoke(order, "AddNewDetail");
                                var parameters = {
                                    "product": _this.product,
                                    "quantity": _this.count
                                };
                                Spiro.Helpers.invoke(innerInvoke, parameters, {
                                    "success": function (originalModel, resp, iOptions) {
                                        var orderLine = innerInvoke.result().object();
                                        Spiro.Helpers.persist(orderLine, {
                                        }, {
                                            "success": function (originalModel, resp, iOptions) {
                                                var op = new OrderPage(order);
                                                order.fetch();
                                            },
                                            "error": function (originalModel, resp, iOptions) {
                                                renderOnMain(_this, "failed to save order detail " + resp.message);
                                            }
                                        });
                                    },
                                    "error": function (originalModel, resp, iOptions) {
                                        renderOnMain(_this, "failed to add order detail " + resp.message);
                                    }
                                });
                            },
                            "error": function (originalModel, resp, iOptions) {
                                renderOnMain(_this, "failed to persist new order " + resp.message);
                            }
                        });
                    },
                    "error": function (originalModel, resp, iOptions) {
                        renderOnMain(_this, "failed to create new order " + resp.message);
                    }
                });
                return false;
            };
            ConfirmOrderPage.prototype.renderOrderSummary = function () {
                var summaryTag = Tags.Tag("p", "", "Create Order : ");
                var productTag = Tags.Tag("p", "", "Selected " + this.count + "  " + this.product.title());
                var customerTag = Tags.Tag("p", "", "Customer: " + this.model.title());
                var buttontag = Tags.Tag("button", "", "OK");
                return summaryTag.toString() + productTag + customerTag + buttontag;
            };
            ConfirmOrderPage.prototype.render = function () {
                return renderOnMain(this, this.renderOrderSummary());
            };
            return ConfirmOrderPage;
        })(Backbone.View);        
        var ChooseCustomerPage = (function (_super) {
            __extends(ChooseCustomerPage, _super);
            function ChooseCustomerPage(options) {
                        _super.call(this, options);
                this.events = {
                    "click :button": "onOK"
                };
                this.model = new Spiro.ActionResultRepresentation();
                this.model.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.CustomerRepository/actions/FindStoreByName/invoke";
                this.model.method = "GET";
                _.bindAll(this, 'render', 'reRender', 'onOK');
                this.model.bind('change', this.reRender);
                this.model.bind('reset', this.reRender);
                this.model.bind('requestFailed', this.reRender);
                this.delegateEvents();
            }
            ChooseCustomerPage.prototype.onOK = function (e) {
                var customerLink = this.result.value().models[$("select").val()];
                var customer = customerLink.getTarget();
                var cPage = new ConfirmOrderPage(customer);
                cPage.product = this.product;
                cPage.count = this.count;
                customer.fetch();
                return false;
            };
            ChooseCustomerPage.prototype.search = function () {
                Spiro.Helpers.invoke(this.model, {
                    "name": this.searchValue
                });
            };
            ChooseCustomerPage.prototype.reRender = function () {
                this.result = this.model.result().list();
                var select = this.$el.find("select");
                select.html("");
                for(var i = 0; this.result && i < this.result.value().models.length; i++) {
                    var title = this.result.value().models[i].title();
                    var optionTag = Tags.Tag("option", "", title);
                    optionTag.mergeAttribute("value", i.toString());
                    select.append(optionTag.toString());
                }
            };
            ChooseCustomerPage.prototype.renderCustomerSelection = function () {
                var page = Tags.Tag("div", "");
                var products = Tags.Tag("p", "", "Selected " + this.count + "  " + this.product.title());
                page.innerHtml += products;
                page.innerHtml += Tags.Tag("input", "customerSearch");
                var ddTag = Tags.Tag("select", "");
                var buttonTag = Tags.Tag("button", "okButton", "OK");
                page.innerHtml += ddTag;
                page.innerHtml += buttonTag;
                return page.toString();
            };
            ChooseCustomerPage.prototype.render = function () {
                var p = renderOnMain(this, this.renderCustomerSelection());
                var view = this;
                this.$el.find(".customerSearch").bind("propertychange keyup input paste", function (event) {
                    view.searchValue = $(this).val();
                    view.search();
                });
                return p;
            };
            return ChooseCustomerPage;
        })(Backbone.View);        
        var ChooseProductPage = (function (_super) {
            __extends(ChooseProductPage, _super);
            function ChooseProductPage(options) {
                        _super.call(this, options);
                this.searchValue = "";
                this.events = {
                    "click :button": "onOK"
                };
                this.model = Spiro.Helpers.createUrlInvoke("http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.ProductRepository/actions/FindProductByName/invoke", "GET");
                _.bindAll(this, 'render', 'reRender', 'onOK');
                this.model.bind('change', this.reRender);
                this.model.bind('reset', this.reRender);
                this.model.bind('requestFailed', this.reRender);
                this.delegateEvents();
            }
            ChooseProductPage.prototype.onOK = function (e) {
                var ccView = new ChooseCustomerPage();
                ccView.product = this.result.value().models[$("select").val()];
                ccView.count = $("input.productCount").val();
                ccView.render();
                return false;
            };
            ChooseProductPage.prototype.search = function () {
                Spiro.Helpers.invoke(this.model, {
                    "searchString": this.searchValue
                });
            };
            ChooseProductPage.prototype.renderProductSelection = function () {
                var page = Tags.Tag("div", "");
                page.innerHtml += Tags.Tag("input", "productSearch");
                page.innerHtml += Tags.Tag("select", "");
                var countTag = Tags.Tag("input", "productCount");
                countTag.mergeAttribute("value", "1");
                page.innerHtml += countTag;
                page.innerHtml += Tags.Tag("button", "okButton", "OK");
                return page.toString();
            };
            ChooseProductPage.prototype.reRender = function () {
                this.result = this.model.result().list();
                var select = this.$el.find("select");
                select.html("");
                for(var i = 0; (this.result) && i < this.result.value().models.length; i++) {
                    var title = this.result.value().models[i].title();
                    var optionTag = Tags.Tag("option", "", title);
                    optionTag.mergeAttribute("value", i.toString());
                    select.append(optionTag.toString());
                }
            };
            ChooseProductPage.prototype.render = function () {
                var p = renderOnMain(this, this.renderProductSelection());
                var view = this;
                this.$el.find(".productSearch").bind("propertychange keyup input paste", function (event) {
                    view.searchValue = $(this).val();
                    view.search();
                });
                return p;
            };
            return ChooseProductPage;
        })(Backbone.View);        
        var AppRouter = (function (_super) {
            __extends(AppRouter, _super);
            function AppRouter(options) {
                        _super.call(this, options);
            }
            AppRouter.prototype.home = function () {
                new ChooseProductPage().render();
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
    })(Spiro.Narrow || (Spiro.Narrow = {}));
    var Narrow = Spiro.Narrow;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=narrow.js.map
