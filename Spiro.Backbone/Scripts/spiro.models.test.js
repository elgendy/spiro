var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SpiroModelTests;
(function (SpiroModelTests) {
    function getTodayDate() {
        var date = new Date();
        var DoM = date.getDate().toString();
        var DoM = DoM.length == 1 ? "0" + DoM : DoM;

        var MM = (date.getMonth() + 1).toString();
        var MM = MM.length == 1 ? "0" + MM : MM;

        var dateString = DoM + "/" + MM + "/" + date.getFullYear() + " 00:00:00";
        return dateString;
    }

    function toKeyValueArray(map) {
        var fieldsArray = [];

        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                fieldsArray.push({
                    key: key,
                    value: map[key]
                });
            }
        }
        return fieldsArray;
    }

    var TestView = (function (_super) {
        __extends(TestView, _super);
        function TestView(model, options) {
            _super.call(this, options);
            this.model = model;

            this.el = undefined;
            this._ensureElement();
            _.bindAll(this, 'test', 'testError');
            this.model.bind('change', this.test);
            this.model.bind('reset', this.test);
            this.model.bind('requestFailed', this.testError);

            this.delegateEvents();
        }
        TestView.prototype.test = function () {
            this.doTest(this.model);
        };
        TestView.prototype.testError = function (o) {
            this.doTestError(o.statusCode, o);
        };
        return TestView;
    })(Backbone.View);

    function homeTest(home) {
        var services = home.getDomainServices();
        equal(services.url(), "http://mvc.nakedobjects.net:1081/RestDemo/services", "service resource link");

        var user = home.getUser();
        equal(user.url(), "http://mvc.nakedobjects.net:1081/RestDemo/user", "user resource link");

        var self = home.getSelf();
        equal(self.url(), "http://mvc.nakedobjects.net:1081/RestDemo", "self resource link");

        equal(home.url(), self.url(), "url");

        var version = home.getVersion();
        equal(version.url(), "http://mvc.nakedobjects.net:1081/RestDemo/version", "version resource link");

        ok($.isEmptyObject(home.extensions()), "extensions");
    }

    var home;

    asyncTest("Home Page Resource", function () {
        home = new Spiro.HomePageRepresentation();
        var test = new TestView(home);
        expect(6);

        test.doTest = function () {
            homeTest(home);
            start();
        };

        home.fetch();
    });

    asyncTest("Home Self  Resource", function () {
        var self = new Spiro.HomePageRepresentation();
        var test = new TestView(self);
        expect(6);

        test.doTest = function () {
            homeTest(self);
            start();
        };

        self.hateoasUrl = home.selfLink().href();
        self.fetch();
    });

    asyncTest("User Resource", function () {
        var user = new Spiro.UserRepresentation();
        var test = new TestView(user);
        expect(8);

        test.doTest = function () {
            equal(user.userName(), "", "userName");
            equal(user.friendlyName(), undefined, "friendlyName");
            equal(user.email(), undefined, "email");
            equal(user.roles().length, 0, "roles");

            var self = user.getSelf();
            equal(self.url(), "http://mvc.nakedobjects.net:1081/RestDemo/user", "self resource link");

            equal(user.url(), self.url(), "url");

            var home = user.getUp();
            equal(home.url(), "http://mvc.nakedobjects.net:1081/RestDemo", "up resource link");

            ok($.isEmptyObject(user.extensions()), "extensions");

            start();
        };

        user.hateoasUrl = home.userLink().href();
        user.fetch();
    });

    asyncTest("Domain Services Resource", function () {
        var domainServices = new Spiro.DomainServicesRepresentation();
        var test = new TestView(domainServices);
        expect(41);

        test.doTest = function () {
            var services = domainServices.value().models;
            equal(services.length, 12, "Service count");

            var serviceData = ["CustomerRepository", "OrderRepository", "ProductRepository", "EmployeeRepository", "SalesRepository", "SpecialOfferRepository", "ContactRepository", "VendorRepository", "PurchaseOrderRepository", "WorkOrderRepository", "OrderContributedActions", "CustomerContributedActions"];
            var serviceWithData = _.zip(services, serviceData);

            for (var i = 0; i < serviceWithData.length; i++) {
                var service = serviceWithData[i];
                var s = service[0];
                var d = service[1];
                var url = "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel." + d;

                equal(s.href(), url, "href");
                equal(s.type().representationType, "object", "targetType");
                equal(s.method(), "GET", "method");
            }

            var self = domainServices.getSelf();
            equal(self.url(), "http://mvc.nakedobjects.net:1081/RestDemo/services", "self resource link");

            equal(domainServices.url(), self.url(), "url");

            var home = domainServices.getUp();
            equal(home.url(), "http://mvc.nakedobjects.net:1081/RestDemo", "up resource link");

            ok($.isEmptyObject(domainServices.extensions()), "extensions");

            start();
        };

        domainServices.hateoasUrl = home.serviceLink().href();
        domainServices.fetch();
    });

    asyncTest("Version Resource", function () {
        var version = new Spiro.VersionRepresentation();
        var test = new TestView(version);
        expect(11);

        test.doTest = function () {
            equal(version.specVersion(), "1.0", "specVersion");
            equal(version.implVersion(), "1.3.0", "implVersion");

            var oc = version.optionalCapabilities();

            equal(oc.blobsClobs, "no", "blobsClobs");
            equal(oc.deleteObjects, "no", "deleteObjects");
            equal(oc.domainModel, "selectable", "domainModel");
            equal(oc.protoPersistentObjects, "yes", "protoPersistentObjects");
            equal(oc.validateOnly, "yes", "validateOnly");

            var self = version.getSelf();
            equal(self.url(), "http://mvc.nakedobjects.net:1081/RestDemo/version", "self resource link");

            equal(version.url(), self.url(), "url");

            var home = version.getUp();
            equal(home.url(), "http://mvc.nakedobjects.net:1081/RestDemo", "up resource link");

            ok($.isEmptyObject(version.extensions()), "extensions");

            start();
        };

        version.hateoasUrl = home.versionLink().href();
        version.fetch();
    });

    asyncTest("DomainObject Resource", function () {
        var obj = new Spiro.DomainObjectRepresentation();
        var test = new TestView(obj);

        expect(19);

        test.doTest = function () {
            equal(obj.domainType(), "AdventureWorksModel.SalesOrderHeader", "domainType");
            equal(obj.instanceId(), "51131", "instanceId");
            equal(obj.serviceId(), undefined, "serviceId");
            equal(obj.title(), "SO51131", "title");

            var self = obj.getSelf();
            equal(self.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.SalesOrderHeader/51131", "self resource link");

            equal(obj.url(), self.url(), "url");

            var updateMap = obj.getUpdateMap();
            equal(updateMap.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.SalesOrderHeader/51131", "update link");

            var members = obj.members();
            var aMembers = obj.actionMembers();
            var cMembers = obj.collectionMembers();
            var pMembers = obj.propertyMembers();

            equal(_.toArray(members).length, 40, "member count");
            equal(_.toArray(aMembers).length, 13, "action member count");
            equal(_.toArray(cMembers).length, 2, "collection member count");
            equal(_.toArray(pMembers).length, 25, "property member count");

            var ext = obj.extensions();

            equal(ext.friendlyName, "Sales Order", "friendlyName");
            equal(ext.description, "", "description");
            equal(ext.returnType, undefined, "returnType");
            equal(ext.optional, undefined, "optional");
            equal(ext.hasParams, undefined, "hasParams");
            equal(ext.elementType, undefined, "elementType");
            equal(ext.pluralName, "Sales Orders", "pluralName");
            equal(ext.format, undefined, "format");

            start();
        };

        obj.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.SalesOrderHeader/51131";
        obj.fetch();
    });

    asyncTest("Proto Persistent DomainObject Resource", function () {
        var invoke = new Spiro.ActionResultRepresentation();
        var test = new TestView(invoke);

        expect(17);

        test.doTest = function () {
            var obj = invoke.result().object();

            var dateString = getTodayDate();

            equal(obj.domainType(), undefined, "domainType");
            equal(obj.instanceId(), undefined, "instanceId");
            equal(obj.serviceId(), undefined, "serviceId");
            equal(obj.title(), dateString, "title");

            var persistMap = obj.getPersistMap();
            equal(persistMap.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.PurchaseOrderHeader", "persist link");

            var members = obj.members();
            var aMembers = obj.actionMembers();
            var cMembers = obj.collectionMembers();
            var pMembers = obj.propertyMembers();

            equal(_.toArray(members).length, 12, "member count");
            equal(_.toArray(aMembers).length, 0, "action member count");
            equal(_.toArray(cMembers).length, 1, "collection member count");
            equal(_.toArray(pMembers).length, 11, "property member count");

            var ext = obj.extensions();

            equal(ext.friendlyName, "Purchase Order Header", "friendlyName");
            equal(ext.description, "", "description");
            equal(ext.returnType, undefined, "returnType");
            equal(ext.optional, undefined, "optional");
            equal(ext.hasParams, undefined, "hasParams");
            equal(ext.elementType, undefined, "elementType");
            equal(ext.pluralName, "Purchase Order Headers", "pluralName");
            equal(ext.format, undefined, "format");

            start();
        };

        invoke.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.PurchaseOrderRepository/actions/CreateNewPurchaseOrder/invoke";
        invoke.method = "POST";
        invoke.setParameter("vendor", new Spiro.Value({ "href": "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.Vendor/32" }));

        invoke.fetch();
    });

    asyncTest("Proto Persistent DomainObject Resource save", function () {
        var invoke = new Spiro.ActionResultRepresentation();
        var test = new TestView(invoke);

        expect(5);

        test.doTest = function () {
            var obj = invoke.result().object();

            var test2 = new TestView(obj);

            var persistMap = obj.getPersistMap();

            test2.doTest = function () {
                equal(obj.domainType(), "AdventureWorksModel.PurchaseOrderHeader", "domainType");

                var members = obj.members();
                var aMembers = obj.actionMembers();
                var cMembers = obj.collectionMembers();
                var pMembers = obj.propertyMembers();

                equal(_.toArray(members).length, 15, "member count");
                equal(_.toArray(aMembers).length, 3, "action member count");
                equal(_.toArray(cMembers).length, 1, "collection member count");
                equal(_.toArray(pMembers).length, 11, "property member count");

                start();
            };

            persistMap.setMember("OrderDate", new Spiro.Value(getTodayDate()));
            persistMap.setMember("OrderPlacedBy", new Spiro.Value({ "href": "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.Employee/165" }));
            persistMap.setMember("ShipMethod", new Spiro.Value({ "href": "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.ShipMethod/4" }));

            persistMap.save();
        };

        invoke.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.PurchaseOrderRepository/actions/CreateNewPurchaseOrder/invoke";
        invoke.method = "POST";
        invoke.setParameter("vendor", new Spiro.Value({ "href": "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.Vendor/32" }));

        invoke.fetch();
    });

    asyncTest("Proto Persistent DomainObject Resource save fail", function () {
        var invoke = new Spiro.ActionResultRepresentation();
        var test = new TestView(invoke);

        expect(3);

        test.doTest = function () {
            var obj = invoke.result().object();

            var test2 = new TestView(obj);

            var persistMap = obj.getPersistMap();

            test2.doTest = function () {
                ok(false, "should never hit this point");
                start();
            };

            test2.doTestError = function (rc, m) {
                var name = m.get("OrderPlacedBy");
                equal(rc, 422, "ret code value");
                equal(name.value, null, "orderplacedby value");
                equal(name.invalidReason, "Mandatory", "orderplacedby reason");
                start();
            };

            persistMap.setMember("OrderDate", new Spiro.Value(getTodayDate()));

            persistMap.setMember("ShipMethod", new Spiro.Value({ "href": "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.ShipMethod/4" }));

            persistMap.save();
        };

        invoke.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.PurchaseOrderRepository/actions/CreateNewPurchaseOrder/invoke";
        invoke.method = "POST";
        invoke.setParameter("vendor", new Spiro.Value({ "href": "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.Vendor/32" }));

        invoke.fetch();
    });

    asyncTest("DomainObject Properties Resource", function () {
        var obj = new Spiro.DomainObjectRepresentation();
        var test = new TestView(obj);

        expect(91);

        test.doTest = function () {
            var pMembers = obj.propertyMembers();
            var mArray = toKeyValueArray(pMembers);
            equal(mArray.length, 9, "property member count");

            var mData = [
                { key: "Product", value: "Steerer", fn: "Product", mo: 10, opt: false, rt: "AdventureWorksModel.Product", dr: undefined },
                { key: "OrderQty", value: "3", fn: "Order Qty", mo: 20, opt: false, rt: "number", dr: undefined },
                { key: "StockedQty", value: "3", fn: "Stocked Qty", mo: 22, opt: false, rt: "number", dr: "Field not editable" },
                { key: "ScrappedQty", value: "0", fn: "Scrapped Qty", mo: 24, opt: false, rt: "number", dr: undefined },
                { key: "ScrapReason", value: "", fn: "Scrap Reason", mo: 26, opt: true, rt: "AdventureWorksModel.ScrapReason", dr: undefined },
                { key: "StartDate", value: "2001-08-27T23:00:00Z", fn: "Start Date", mo: 30, opt: false, rt: "string", dr: undefined },
                { key: "EndDate", value: "2001-09-06T23:00:00Z", fn: "End Date", mo: 32, opt: true, rt: "string", dr: undefined },
                { key: "DueDate", value: "2001-09-07T23:00:00Z", fn: "Due Date", mo: 34, opt: false, rt: "string", dr: undefined },
                { key: "ModifiedDate", value: "2001-09-06T23:00:00Z", fn: "Last Modified", mo: 99, opt: false, rt: "string", dr: "Field not editable" }
            ];

            var wData = _.zip(mArray, mData);

            for (var i = 0; i < wData.length; i++) {
                var propertyMember = wData[i][0].value;
                var propertyName = wData[i][0].key;
                var testData = wData[i][1];

                equal(propertyName, testData.key, "property name");

                equal(propertyMember.memberType(), "property", "member type");
                equal(propertyMember.disabledReason(), testData.dr, "disabled reason");

                equal(propertyMember.value().toString(), testData.value, "value");

                var details = propertyMember.getDetails();
                equal(details.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287/properties/" + testData.key, "details resource link");

                equal(propertyMember.extensions().description, "", "description");
                equal(propertyMember.extensions().friendlyName, testData.fn, "friendlyName");
                equal(propertyMember.extensions().memberOrder, testData.mo, "memberOrder");
                equal(propertyMember.extensions().optional, testData.opt, "optional");
                equal(propertyMember.extensions().returnType, testData.rt, "returnType");
            }

            start();
        };

        obj.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287";
        obj.fetch();
    });

    asyncTest("DomainObject Collections Resource", function () {
        var obj = new Spiro.DomainObjectRepresentation();
        var test = new TestView(obj);

        expect(12);

        test.doTest = function () {
            var cMembers = obj.collectionMembers();
            var mArray = toKeyValueArray(cMembers);
            equal(mArray.length, 1, "property collection count");

            equal(mArray[0].key, "WorkOrderRoutings", "collection name");

            var collectionMember = mArray[0].value;

            equal(collectionMember.size(), 0, "collection count");
            equal(collectionMember.memberType(), "collection", "member type");
            equal(collectionMember.disabledReason(), "Field not editable", "disabled reason");

            var details = collectionMember.getDetails();
            equal(details.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287/collections/WorkOrderRoutings", "details resource link");

            equal(collectionMember.extensions().description, "", "description");
            equal(collectionMember.extensions().elementType, "AdventureWorksModel.WorkOrderRouting", "elementType");
            equal(collectionMember.extensions().friendlyName, "Work Order Routings", "friendlyName");
            equal(collectionMember.extensions().memberOrder, 0, "memberOrder");
            equal(collectionMember.extensions().pluralName, "Work Order Routings", "pluralName");
            equal(collectionMember.extensions().returnType, "list", "returnType");

            start();
        };

        obj.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287";
        obj.fetch();
    });

    asyncTest("DomainObject Actions Resource", function () {
        var obj = new Spiro.DomainObjectRepresentation();
        var test = new TestView(obj);

        expect(10);

        test.doTest = function () {
            var aMembers = obj.actionMembers();
            var mArray = toKeyValueArray(aMembers);
            equal(mArray.length, 1, "property action count");

            equal(mArray[0].key, "AddNewRouting", "action name");

            var actionMember = mArray[0].value;

            equal(actionMember.memberType(), "action", "member type");
            equal(actionMember.disabledReason(), undefined, "disabled reason");

            var details = actionMember.getDetails();
            equal(details.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287/actions/AddNewRouting", "details resource link");

            equal(actionMember.extensions().description, "", "description");
            equal(actionMember.extensions().friendlyName, "Add New Routing", "friendlyName");
            equal(actionMember.extensions().hasParams, true, "hasParams");
            equal(actionMember.extensions().memberOrder, 1, "memberOrder");
            equal(actionMember.extensions().returnType, "AdventureWorksModel.WorkOrderRouting", "returnType");

            start();
        };

        obj.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287";
        obj.fetch();
    });

    asyncTest("Update Domain Object scalar ok", function () {
        var obj = new Spiro.DomainObjectRepresentation();
        var test = new TestView(obj);

        expect(2);

        test.doTest = function () {
            var oldComment = obj.propertyMember("Comment").value() || "";
            var newComment = oldComment + "1";

            test.doTest = function () {
                equal(obj.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.SalesOrderHeader/51131", "object url");
                equal(obj.propertyMember("Comment").value(), newComment, "comment value");
                start();
            };
            var map = obj.getUpdateMap();

            map.setProperty("Comment", new Spiro.Value(newComment));
            map.save();
        };

        obj.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.SalesOrderHeader/51131";
        obj.fetch();
    });

    asyncTest("Update Domain Object reference ok", function () {
        var obj = new Spiro.DomainObjectRepresentation();
        var test = new TestView(obj);

        expect(2);

        test.doTest = function () {
            var newShipMethod;
            var oldShipMethod = obj.propertyMember("ShipMethod").value();
            var newTitle;

            if (oldShipMethod.toString() == "CARGO TRANSPORT 5") {
                newShipMethod = new Spiro.Value({ "href": "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.ShipMethod/4" });
                newTitle = "OVERNIGHT J-FAST";
            } else {
                newShipMethod = new Spiro.Value({ "href": "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.ShipMethod/5" });
                newTitle = "CARGO TRANSPORT 5";
            }

            test.doTest = function () {
                equal(obj.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.SalesOrderHeader/51131", "object url");
                equal(obj.propertyMember("ShipMethod").value().toString(), newTitle, "ship method value");
                start();
            };
            var map = obj.getUpdateMap();

            map.setProperty("ShipMethod", newShipMethod);
            map.save();
        };

        obj.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.SalesOrderHeader/51131";
        obj.fetch();
    });

    asyncTest("Update Domain Object fail", function () {
        var obj = new Spiro.DomainObjectRepresentation();
        var test = new TestView(obj);

        expect(3);

        test.doTest = function () {
            var map = obj.getUpdateMap();

            test.doTest = function () {
                ok(false, "should never hit this point");
                start();
            };

            test.doTestError = function (rc, m) {
                var status = m.get("Status");
                equal(rc, 422, "ret code value");
                equal(status.value, "", "status value");
                equal(status.invalidReason, "Mandatory", "status reason");
                start();
            };

            map.setProperty("Status", new Spiro.Value(""));
            map.save();
        };

        obj.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.SalesOrderHeader/51131";
        obj.fetch();
    });

    asyncTest("Property Resources", function () {
        var obj = new Spiro.DomainObjectRepresentation();
        var test = new TestView(obj);

        expect(122);

        test.doTest = function () {
            var pMembers = obj.propertyMembers();
            var mArray = toKeyValueArray(pMembers);
            equal(mArray.length, 9, "property member count");

            var mData = {
                Product: { key: "Product", value: { href: "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.Product/531" }, fn: "Product", mo: 10, opt: false, rt: "AdventureWorksModel.Product", dr: undefined },
                OrderQty: { key: "OrderQty", value: "3", fn: "Order Qty", mo: 20, opt: false, rt: "number", dr: undefined },
                StockedQty: { key: "StockedQty", value: "3", fn: "Stocked Qty", mo: 22, opt: false, rt: "number", dr: "Field not editable" },
                ScrappedQty: { key: "ScrappedQty", value: 0, fn: "Scrapped Qty", mo: 24, opt: false, rt: "number", dr: undefined },
                ScrapReason: { key: "ScrapReason", value: null, fn: "Scrap Reason", mo: 26, opt: true, rt: "AdventureWorksModel.ScrapReason", dr: undefined },
                StartDate: { key: "StartDate", value: "2001-08-27T23:00:00Z", fn: "Start Date", mo: 30, opt: false, rt: "string", dr: undefined },
                EndDate: { key: "EndDate", value: "2001-09-06T23:00:00Z", fn: "End Date", mo: 32, opt: true, rt: "string", dr: undefined },
                DueDate: { key: "DueDate", value: "2001-09-07T23:00:00Z", fn: "Due Date", mo: 34, opt: false, rt: "string", dr: undefined },
                ModifiedDate: { key: "ModifiedDate", value: "2001-09-06T23:00:00Z", fn: "Last Modified", mo: 99, opt: false, rt: "string", dr: "Field not editable" }
            };

            var k = mArray.length;
            for (var i = 0; i < mArray.length; i++) {
                var propertyMember = mArray[i].value;
                var propertyName = mArray[i].key;

                var details = propertyMember.getDetails();

                var test = new TestView(details);

                test.doTest = function (pm) {
                    var data = mData[pm.instanceId()];

                    equal(pm.instanceId(), data.key, "id");
                    equal(pm.disabledReason(), data.dr, "disabled reason");

                    if (pm.choices()) {
                        equal(pm.choices().length, 16, "choices count");

                        for (var i = 0; i < pm.choices().length; i++) {
                            var link = pm.choices()[i].link();

                            equal(link.href(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.ScrapReason/" + (i + 1), "choice link");
                        }
                    } else {
                        equal(pm.choices(), data.choices, "choices");
                    }

                    if (pm.isScalar()) {
                        equal(pm.value(), data.value, "value");
                    } else {
                        equal(pm.value().link().href(), data.value.href, "value");
                    }

                    var self = pm.getSelf();
                    equal(self.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287/properties/" + pm.instanceId(), "self resource link");

                    var up = pm.getUp();
                    equal(up.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287", "up resource link");

                    var modify = pm.getModifyMap();
                    if (modify) {
                        equal(modify.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287/properties/" + pm.instanceId(), "modify resource link");
                        equal(modify.method, "PUT", "modify method");
                    }

                    var clear = pm.getClearMap();
                    if (clear) {
                        equal(clear.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287/properties/" + pm.instanceId(), "clear resource link");
                        equal(clear.method, "DELETE", "clear method");
                    }

                    equal(pm.extensions().description, "", "description");
                    equal(pm.extensions().friendlyName, data.fn, "friendlyName");
                    equal(pm.extensions().memberOrder, data.mo, "memberOrder");
                    equal(pm.extensions().optional, data.opt, "optional");
                    equal(pm.extensions().returnType, data.rt, "returnType");
                };

                details.fetch();
            }

            setTimeout(function () {
                return start();
            }, 20000);
        };

        obj.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287";
        obj.fetch();
    });

    asyncTest("Collection Resources", function () {
        var obj = new Spiro.DomainObjectRepresentation();
        var test = new TestView(obj);

        expect(15);

        test.doTest = function () {
            var pMembers = obj.collectionMembers();
            var mArray = toKeyValueArray(pMembers);
            equal(mArray.length, 1, "collection member count");

            var k = mArray.length;
            for (var i = 0; i < mArray.length; i++) {
                var collectionMember = mArray[i].value;
                var collectionName = mArray[i].key;

                var details = collectionMember.getDetails();

                var test = new TestView(details);

                test.doTest = function (cm) {
                    equal(cm.instanceId(), "WorkOrderRoutings", "id");
                    equal(cm.disabledReason(), "Field not editable", "disabled reason");

                    equal(cm.value().models.length, 0, "value count");

                    var self = cm.getSelf();
                    equal(self.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287/collections/" + cm.instanceId(), "self resource link");

                    var up = cm.getUp();
                    equal(up.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287", "up resource link");

                    var addTo = cm.getAddToMap();
                    equal(addTo, null, "add to");

                    var removeFrom = cm.getRemoveFromMap();
                    equal(removeFrom, null, "remove from");

                    equal(cm.extensions().description, "", "description");
                    equal(cm.extensions().friendlyName, "Work Order Routings", "friendlyName");
                    equal(cm.extensions().memberOrder, 0, "memberOrder");
                    equal(cm.extensions().optional, undefined, "optional");
                    equal(cm.extensions().returnType, "list", "returnType");
                    equal(cm.extensions().elementType, "AdventureWorksModel.WorkOrderRouting", "elementType");
                    equal(cm.extensions().pluralName, "Work Order Routings", "pluralName");

                    start();
                };

                details.fetch();
            }
        };

        obj.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287";
        obj.fetch();
    });

    asyncTest("Action Resources", function () {
        var obj = new Spiro.DomainObjectRepresentation();
        var test = new TestView(obj);

        expect(35);

        test.doTest = function () {
            var aMembers = obj.actionMembers();
            var aArray = toKeyValueArray(aMembers);
            equal(aArray.length, 1, "action member count");

            var k = aArray.length;
            for (var i = 0; i < aArray.length; i++) {
                var actionMember = aArray[i].value;
                var actionName = aArray[i].key;

                var details = actionMember.getDetails();

                var test = new TestView(details);

                test.doTest = function (am) {
                    equal(am.actionId(), "AddNewRouting", "id");
                    equal(am.disabledReason(), undefined, "disabled reason");

                    var parms = am.parameters();
                    var parmKVP = toKeyValueArray(parms);

                    equal(parmKVP.length, 1, "parms count");

                    var indexes = [1, 2, 3, 4, 5, 6, 7, 10, 20, 30, 40, 45, 50, 60];

                    for (var i = 0; i < parmKVP.length; i++) {
                        var parmName = parmKVP[i].key;
                        var parm = parmKVP[i].value;

                        equal(parmName, "loc", "parm name");

                        equal(parm.choices().length, 14, "parm choices count");

                        for (var i = 0; i < parm.choices().length; i++) {
                            equal(parm.choices()[i].link().href(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.Location/" + indexes[i], "parm choice");
                        }

                        equal(parm.default().scalar(), null, "parm def");

                        equal(parm.extensions().friendlyName, "Loc", "parm f name");
                        equal(parm.extensions().description, "", "parm description");
                        equal(parm.extensions().returnType, "AdventureWorksModel.Location", "parm returnType");
                        equal(parm.extensions().optional, "", "parm optional");
                    }

                    var self = am.getSelf();
                    equal(self.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287/actions/" + am.actionId(), "self resource link");

                    var up = am.getUp();
                    equal(up.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287", "up resource link");

                    var invoke = am.getInvoke();
                    equal(invoke.url(), "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287/actions/" + am.actionId() + "/invoke", "invoke resource link");
                    equal(invoke.method, "POST", "invoke method");

                    equal(am.extensions().description, "", "description");
                    equal(am.extensions().friendlyName, "Add New Routing", "friendlyName");
                    equal(am.extensions().memberOrder, 1, "memberOrder");
                    equal(am.extensions().optional, undefined, "optional");
                    equal(am.extensions().hasParams, true, "hasParams");
                    equal(am.extensions().returnType, "AdventureWorksModel.WorkOrderRouting", "returnType");

                    start();
                };

                details.fetch();
            }
            ;
        };

        obj.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.WorkOrder/2287";
        obj.fetch();
    });

    asyncTest("Property Resource - Modify - scalar", function () {
        var property = new Spiro.PropertyRepresentation();
        var test = new TestView(property);

        expect(1);

        test.doTest = function () {
            var existValue = property.value().scalar();
            var newValue = existValue + 1;
            var modify = property.getModifyMap();

            modify.setValue(new Spiro.Value(newValue));

            test.doTest = function () {
                equal(newValue, property.value().scalar(), "new property value");

                start();
            };

            modify.fetch();
        };

        property.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.Product/421/properties/SafetyStockLevel";
        property.fetch();
    });

    asyncTest("Property Resource - Modify - reference", function () {
        var property = new Spiro.PropertyRepresentation();
        var test = new TestView(property);

        expect(1);

        test.doTest = function () {
            var newShipMethod;
            var oldShipMethod = property.value();
            var newTitle;

            if (oldShipMethod.toString() == "CARGO TRANSPORT 5") {
                newShipMethod = new Spiro.Value({ "href": "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.ShipMethod/4" });
                newTitle = "OVERNIGHT J-FAST";
            } else {
                newShipMethod = new Spiro.Value({ "href": "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.ShipMethod/5" });
                newTitle = "CARGO TRANSPORT 5";
            }

            var modify = property.getModifyMap();

            modify.setValue(newShipMethod);

            test.doTest = function () {
                equal(newTitle, property.value().toString(), "new property value");

                start();
            };

            modify.fetch();
        };

        property.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.SalesOrderHeader/51131/properties/ShipMethod";
        property.fetch();
    });

    asyncTest("Collection Resource - AddTo/RemoveFrom - no links", function () {
        var collection = new Spiro.CollectionRepresentation();
        var test = new TestView(collection);

        expect(3);

        test.doTest = function () {
            equal(collection.value().models.length, 0, "collection size 1");
            var addTo = collection.getAddToMap();
            var removeFrom = collection.getRemoveFromMap();
            equal(addTo, null, "no add to");
            equal(removeFrom, null, "no remove from");

            start();
        };

        collection.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.SalesOrderHeader/51131/collections/SalesOrderHeaderSalesReason";
        collection.fetch();
    });

    asyncTest("Action Resources - No parms", function () {
        var action = new Spiro.ActionRepresentation();
        var test = new TestView(action);

        expect(9);

        test.doTest = function () {
            equal(action.actionId(), "Recalculate", "id");
            equal(action.disabledReason(), undefined, "disabled reason");

            var parms = action.parameters();
            var parmKVP = toKeyValueArray(parms);

            equal(parmKVP.length, 0, "parms count");

            equal(action.extensions().description, "", "description");
            equal(action.extensions().friendlyName, "Recalculate", "friendlyName");
            equal(action.extensions().memberOrder, 0, "memberOrder");
            equal(action.extensions().optional, undefined, "optional");
            equal(action.extensions().hasParams, false, "hasParams");
            equal(action.extensions().returnType, undefined, "returnType");

            start();
        };

        action.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.SalesOrderHeader/51131/actions/Recalculate";
        action.fetch();
    });

    asyncTest("ActionResources - With parms", function () {
        var action = new Spiro.ActionRepresentation();
        var test = new TestView(action);

        expect(23);

        test.doTest = function () {
            equal(action.actionId(), "AddNewDetail", "id");
            equal(action.disabledReason(), undefined, "disabled reason");

            var parms = action.parameters();
            var parmKVP = toKeyValueArray(parms);

            equal(parmKVP.length, 2, "parms count");

            var data = [
                { "name": "product", "fn": "Product", "def": undefined, "rt": "AdventureWorksModel.Product" },
                { "name": "quantity", "fn": "Quantity", "def": 1, "rt": "number" }
            ];

            for (var i = 0; i < parmKVP.length; i++) {
                var parmName = parmKVP[i].key;
                var parm = parmKVP[i].value;

                equal(parmName, data[i].name, "parm name");

                equal(parm.choices(), null, "parm choices");

                equal(parm.default().scalar(), data[i].def, "parm def");

                equal(parm.extensions().friendlyName, data[i].fn, "parm f name");
                equal(parm.extensions().description, "", "parm description");
                equal(parm.extensions().returnType, data[i].rt, "parm returnType");
                equal(parm.extensions().optional, false, "parm optional");
            }

            equal(action.extensions().description, "Add a new line item to the order", "description");
            equal(action.extensions().friendlyName, "Add New Detail", "friendlyName");
            equal(action.extensions().memberOrder, 1, "memberOrder");
            equal(action.extensions().optional, undefined, "optional");
            equal(action.extensions().hasParams, true, "hasParams");
            equal(action.extensions().returnType, "AdventureWorksModel.SalesOrderDetail", "returnType");

            start();
        };

        action.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.SalesOrderHeader/51131/actions/AddNewDetail";
        action.fetch();
    });

    asyncTest("ActionInvoke Resource - GET - no parms - list", function () {
        var invoke = new Spiro.ActionResultRepresentation();
        var test = new TestView(invoke);

        expect(126);

        test.doTest = function () {
            var self = invoke.getSelf();
            equal(self.url(), "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.OrderRepository/actions/HighestValueOrders/invoke", "self resource link");

            var result = invoke.result();

            equal(result.isNull(), false, "null");
            equal(result.isVoid(), false, "void");
            equal(result.object(), null, "object");
            equal(result.scalar(), null, "scalar");

            var resultList = result.list().value();
            equal(resultList.models.length, 20, "count");

            for (var i = 0; i < resultList.models.length; i++) {
                var model = resultList.models[i];
                equal(model.type().asString, "application/json; profile=\"urn:org.restfulobjects:repr-types/object\"; charset=utf-8; x-ro-domain-type=\"AdventureWorksModel.SalesOrderHeader\"", "type");

                equal(model.type().applicationType, "application/json", "app type");
                equal(model.type().profile, "profile=\"urn:org.restfulobjects:repr-types/object\"", "profile");
                equal(model.type().representationType, "object", "rep type");
                equal(model.type().xRoDomainType, "x-ro-domain-type=\"AdventureWorksModel.SalesOrderHeader\"", "x ro domain type");
                equal(model.type().domainType, "AdventureWorksModel.SalesOrderHeader", "domain type");
            }
            start();
        };

        invoke.method = "GET";
        invoke.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.OrderRepository/actions/HighestValueOrders/invoke";
        invoke.fetch();
    });

    asyncTest("ActionInvoke Resource - GET - with parms - list", function () {
        var invoke = new Spiro.ActionResultRepresentation();
        var test = new TestView(invoke);

        expect(8);

        test.doTest = function () {
            var self = invoke.getSelf();
            equal(self.url(), "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.ProductRepository/actions/FindProductByName/invoke", "self resource link");

            var result = invoke.result();

            equal(result.isNull(), false, "null");
            equal(result.isVoid(), false, "void");
            equal(result.object(), null, "object");
            equal(result.scalar(), null, "scalar");

            var resultList = result.list().value();
            equal(resultList.models.length, 1, "count");

            for (var i = 0; i < resultList.models.length; i++) {
                var model = resultList.models[i];
                equal(model.type().asString, "application/json; profile=\"urn:org.restfulobjects:repr-types/object\"; charset=utf-8; x-ro-domain-type=\"AdventureWorksModel.Product\"", "type");
                equal(model.title(), "HL Mountain Frame - Black, 38", "type");
            }
            start();
        };

        invoke.method = "GET";
        invoke.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.ProductRepository/actions/FindProductByName/invoke";
        invoke.setParameter("searchString", new Spiro.Value("HL Mountain Frame - Black, 38"));
        invoke.fetch();
    });

    asyncTest("ActionInvoke Resource - GET - with parms - empty list", function () {
        var invoke = new Spiro.ActionResultRepresentation();
        var test = new TestView(invoke);

        expect(6);

        test.doTest = function () {
            var self = invoke.getSelf();
            equal(self.url(), "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.ProductRepository/actions/FindProductByName/invoke", "self resource link");

            var result = invoke.result();

            equal(result.isNull(), false, "null");
            equal(result.isVoid(), false, "void");
            equal(result.object(), null, "object");
            equal(result.scalar(), null, "scalar");

            var resultList = result.list().value();
            equal(resultList.models.length, 0, "count");

            start();
        };

        invoke.method = "GET";
        invoke.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.ProductRepository/actions/FindProductByName/invoke";
        invoke.setParameter("searchString", new Spiro.Value("xxxx"));
        invoke.fetch();
    });

    asyncTest("ActionInvoke Resource - POST - no parms - object", function () {
        var invoke = new Spiro.ActionResultRepresentation();
        var test = new TestView(invoke);

        expect(5);

        test.doTest = function () {
            var result = invoke.result();
            var resultObj = result.object();
            equal(resultObj.domainType(), "AdventureWorksModel.SalesOrderHeader", "type");
            equal(result.isNull(), false, "null");
            equal(result.isVoid(), false, "void");
            equal(result.list(), null, "list");
            equal(result.scalar(), null, "scalar");
            start();
        };

        invoke.method = "POST";
        invoke.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.OrderRepository/actions/RandomOrder/invoke";
        invoke.fetch();
    });

    asyncTest("ActionInvoke Resource - POST - no parms - void", function () {
        var invoke = new Spiro.ActionResultRepresentation();
        var test = new TestView(invoke);

        expect(5);

        test.doTest = function () {
            var result = invoke.result();

            equal(result.isNull(), true, "null");
            equal(result.isVoid(), true, "void");
            equal(result.list(), null, "list");
            equal(result.object(), null, "object");
            equal(result.scalar(), null, "scalar");
            start();
        };

        invoke.method = "POST";
        invoke.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/objects/AdventureWorksModel.SalesOrderHeader/51131/actions/Recalculate/invoke";
        invoke.fetch();
    });

    asyncTest("ActionInvoke Resource - POST - with parms - object", function () {
        var invoke = new Spiro.ActionResultRepresentation();
        var test = new TestView(invoke);

        expect(5);

        test.doTest = function () {
            var result = invoke.result();
            var resultObj = result.object();
            equal(resultObj.domainType(), "AdventureWorksModel.Store", "type");
            equal(result.isNull(), false, "null");
            equal(result.isVoid(), false, "void");
            equal(result.list(), null, "list");
            equal(result.scalar(), null, "scalar");
            start();
        };

        invoke.method = "POST";
        invoke.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.CustomerRepository/actions/FindCustomerByAccountNumber/invoke";
        invoke.setParameter("accountNumber", new Spiro.Value("AW00000580"));

        invoke.fetch();
    });

    asyncTest("ActionInvoke Resource - POST - with parms - null", function () {
        var invoke = new Spiro.ActionResultRepresentation();
        var test = new TestView(invoke);

        expect(5);

        test.doTest = function () {
            var result = invoke.result();
            equal(result.isNull(), true, "null");
            equal(result.isVoid(), false, "void");
            equal(result.list(), null, "list");
            equal(result.object(), null, "object");
            equal(result.scalar(), null, "scalar");
            start();
        };

        test.doTestError = function (rc, m) {
            ok(false, "should never hit this point");
            start();
        };

        invoke.method = "POST";
        invoke.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.CustomerRepository/actions/FindCustomerByAccountNumber/invoke";
        invoke.setParameter("accountNumber", new Spiro.Value("AW00000000"));

        invoke.fetch();
    });

    asyncTest("ActionInvoke Resource - POST - with parms - list", function () {
        var invoke = new Spiro.ActionResultRepresentation();
        var test = new TestView(invoke);

        expect(6);

        test.doTest = function () {
            var result = invoke.result();

            equal(result.isNull(), false, "null");
            equal(result.isVoid(), false, "void");
            equal(result.object(), null, "object");
            equal(result.scalar(), null, "scalar");

            var resultList = result.list().value();
            equal(resultList.models.length, 1, "count");

            for (var i = 0; i < resultList.models.length; i++) {
                var model = resultList.models[i];
                equal(model.type().asString, "application/json; profile=\"urn:org.restfulobjects:repr-types/object\"; charset=utf-8; x-ro-domain-type=\"AdventureWorksModel.Store\"", "type");
            }
            start();
        };

        invoke.method = "POST";
        invoke.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.CustomerRepository/actions/FindStoreByName/invoke";
        invoke.setParameter("name", new Spiro.Value("Sharp Bikes"));

        invoke.fetch();
    });

    asyncTest("ActionInvoke Resource - POST - with parms - fail", function () {
        var invoke = new Spiro.ActionResultRepresentation();
        var test = new TestView(invoke);

        expect(3);

        test.doTest = function () {
            ok(false, "should never hit this point");
            start();
        };

        test.doTestError = function (rc, m) {
            var name = m.get("name");
            equal(rc, 422, "ret code value");
            equal(name.value, "", "name value");
            equal(name.invalidReason, "Mandatory", "name reason");
            start();
        };

        invoke.method = "POST";
        invoke.hateoasUrl = "http://mvc.nakedobjects.net:1081/RestDemo/services/AdventureWorksModel.CustomerRepository/actions/FindStoreByName/invoke";
        invoke.setParameter("name", new Spiro.Value(""));
        invoke.fetch();
    });
})(SpiroModelTests || (SpiroModelTests = {}));
//@ sourceMappingURL=spiro.models.test.js.map
