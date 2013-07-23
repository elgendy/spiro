var Spiro;
(function (Spiro) {
    (function (Angular) {
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

        function typeFromUrl(url) {
            var typeRegex = /(objects|services)\/([\w|\.]+)/;
            var results = (typeRegex).exec(url);
            return (results && results.length > 2) ? results[2] : "";
        }

        function toColorFromHref(href) {
            var type = typeFromUrl(href);
            return "bg-color-" + getColourMapValues(type)["backgroundColor"];
        }

        function toColorFromType(type) {
            return "bg-color-" + getColourMapValues(type)["backgroundColor"];
        }

        function getOtherParms($routeParams, excepts) {
            function include(parm) {
                return $routeParams[parm] && !_.any(excepts, function (except) {
                    return parm === except;
                });
            }

            function getParm(name) {
                return include(name) ? "&" + name + "=" + $routeParams[name] : "";
            }

            var actionParm = include("action") ? "&action=" + $routeParams.action : "";
            var collectionParm = include("collection") ? "&collection=" + $routeParams.collection : "";
            var collectionItemParm = include("collectionItem") ? "&collectionItem=" + $routeParams.collectionItem : "";
            var propertyParm = include("property") ? "&property=" + $routeParams.property : "";
            var resultObjectParm = include("resultObject") ? "&resultObject=" + $routeParams.resultObject : "";
            var resultCollectionParm = include("resultCollection") ? "&resultCollection=" + $routeParams.resultCollection : "";

            return actionParm + collectionParm + collectionItemParm + propertyParm + resultObjectParm + resultCollectionParm;
        }
        Angular.getOtherParms = getOtherParms;

        function toAppUrl(href, $routeParams, toClose) {
            var urlRegex = /(objects|services)\/(.*)/;
            var results = (urlRegex).exec(href);
            var parms = "";

            if (toClose) {
                parms = getOtherParms($routeParams, toClose);
                parms = parms ? "?" + parms.substr(1) : "";
            }

            return (results && results.length > 2) ? "#/" + results[1] + "/" + results[2] + parms : "";
        }

        function toActionUrl(href, $routeParams) {
            var urlRegex = /(services|objects)\/([\w|\.]+(\/[\w|\.]+)?)\/actions\/([\w|\.]+)/;
            var results = (urlRegex).exec(href);
            return (results && results.length > 3) ? "#/" + results[1] + "/" + results[2] + "?action=" + results[4] + getOtherParms($routeParams, ["action"]) : "";
        }

        function toPropertyUrl(href, $routeParams) {
            var urlRegex = /(objects)\/([\w|\.]+)\/([\w|\.]+)\/(properties)\/([\w|\.]+)/;
            var results = (urlRegex).exec(href);
            return (results && results.length > 5) ? "#/" + results[1] + "/" + results[2] + "/" + results[3] + "?property=" + results[5] + getOtherParms($routeParams, ["property", "collectionItem", "resultObject"]) : "";
        }

        function toCollectionUrl(href, $routeParams) {
            var urlRegex = /(objects)\/([\w|\.]+)\/([\w|\.]+)\/(collections)\/([\w|\.]+)/;
            var results = (urlRegex).exec(href);
            return (results && results.length > 5) ? "#/" + results[1] + "/" + results[2] + "/" + results[3] + "?collection=" + results[5] + getOtherParms($routeParams, ["collection", "resultCollection"]) : "";
        }

        function toItemUrl(href, itemHref, $routeParams) {
            var parentUrlRegex = /(services|objects)\/([\w|\.]+(\/[\w|\.|-]+)?)/;
            var itemUrlRegex = /(objects)\/([\w|\.]+)\/([\w|\.|-]+)/;
            var parentResults = (parentUrlRegex).exec(href);
            var itemResults = (itemUrlRegex).exec(itemHref);
            return (parentResults && parentResults.length > 2) ? "#/" + parentResults[1] + "/" + parentResults[2] + "?collectionItem=" + itemResults[2] + "/" + itemResults[3] + getOtherParms($routeParams, ["property", "collectionItem", "resultObject"]) : "";
        }

        var ErrorViewModel = (function () {
            function ErrorViewModel() {
            }
            ErrorViewModel.create = function (errorRep) {
                var errorViewModel = new ErrorViewModel();
                errorViewModel.message = errorRep.message() || "An Error occurred";
                var stackTrace = errorRep.stacktrace();

                errorViewModel.stackTrace = !stackTrace || stackTrace.length === 0 ? ["Empty"] : stackTrace;
                return errorViewModel;
            };
            return ErrorViewModel;
        })();
        Angular.ErrorViewModel = ErrorViewModel;

        var LinkViewModel = (function () {
            function LinkViewModel() {
            }
            LinkViewModel.create = function (linkRep) {
                var linkViewModel = new LinkViewModel();
                linkViewModel.title = linkRep.title();
                linkViewModel.href = toAppUrl(linkRep.href());
                linkViewModel.color = toColorFromHref(linkRep.href());
                return linkViewModel;
            };
            return LinkViewModel;
        })();
        Angular.LinkViewModel = LinkViewModel;

        var ItemViewModel = (function () {
            function ItemViewModel() {
            }
            ItemViewModel.create = function (linkRep, parentHref, index, $routeParams) {
                var linkViewModel = new LinkViewModel();
                linkViewModel.title = linkRep.title();
                linkViewModel.href = toItemUrl(parentHref, linkRep.href(), $routeParams);
                linkViewModel.color = toColorFromHref(linkRep.href());
                return linkViewModel;
            };
            return ItemViewModel;
        })();
        Angular.ItemViewModel = ItemViewModel;

        var ParameterViewModel = (function () {
            function ParameterViewModel() {
            }
            ParameterViewModel.prototype.clearError = function () {
                this.error = "";
            };

            ParameterViewModel.create = function (parmRep, id) {
                var parmViewModel = new ParameterViewModel();

                parmViewModel.title = parmRep.extensions().friendlyName;
                parmViewModel.dflt = parmRep.default().toValueString();
                parmViewModel.error = "";
                parmViewModel.value = "";
                parmViewModel.id = id;

                return parmViewModel;
            };
            return ParameterViewModel;
        })();
        Angular.ParameterViewModel = ParameterViewModel;

        var ActionViewModel = (function () {
            function ActionViewModel() {
            }
            ActionViewModel.create = function (actionRep, $routeParams) {
                var actionViewModel = new ActionViewModel();
                actionViewModel.title = actionRep.extensions().friendlyName;
                actionViewModel.href = toActionUrl(actionRep.detailsLink().href(), $routeParams);
                return actionViewModel;
            };
            return ActionViewModel;
        })();
        Angular.ActionViewModel = ActionViewModel;

        var DialogViewModel = (function () {
            function DialogViewModel() {
            }
            DialogViewModel.prototype.doShow = function () {
            };
            DialogViewModel.prototype.doInvoke = function () {
            };

            DialogViewModel.prototype.clearErrors = function () {
                this.error = "";
                _.each(this.parameters, function (parm) {
                    return parm.clearError();
                });
            };

            DialogViewModel.create = function (actionRep, $routeParams, invoke) {
                var dialogViewModel = new DialogViewModel();
                var parameters = actionRep.parameters();

                dialogViewModel.title = actionRep.extensions().friendlyName;
                dialogViewModel.isQuery = actionRep.invokeLink().method() === "GET";

                dialogViewModel.error = "";

                dialogViewModel.close = toAppUrl(actionRep.upLink().href(), $routeParams, ["action"]);

                dialogViewModel.parameters = _.map(parameters, function (parm, id) {
                    return ParameterViewModel.create(parm, id);
                });

                dialogViewModel.doShow = function () {
                    return invoke(dialogViewModel, true);
                };
                dialogViewModel.doInvoke = function () {
                    return invoke(dialogViewModel, false);
                };

                return dialogViewModel;
            };
            return DialogViewModel;
        })();
        Angular.DialogViewModel = DialogViewModel;

        var PropertyViewModel = (function () {
            function PropertyViewModel() {
            }
            PropertyViewModel.prototype.getValue = function () {
                if (this.type === "scalar") {
                    return new Spiro.Value(this.value || "");
                }

                return new Spiro.Value({ href: this.reference });
            };

            PropertyViewModel.create = function (propertyRep, id, $routeParams) {
                var propertyViewModel = new PropertyViewModel();
                propertyViewModel.title = propertyRep.extensions().friendlyName;
                propertyViewModel.value = propertyRep.value().toString();
                propertyViewModel.type = propertyRep.isScalar() ? "scalar" : "ref";
                propertyViewModel.returnType = propertyRep.extensions().returnType;
                propertyViewModel.href = propertyRep.isScalar() ? "" : toPropertyUrl(propertyRep.detailsLink().href(), $routeParams);
                propertyViewModel.target = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : toAppUrl(propertyRep.value().link().href());
                propertyViewModel.reference = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : propertyRep.value().link().href();

                propertyViewModel.color = toColorFromType(propertyRep.extensions().returnType);
                propertyViewModel.id = id;
                propertyViewModel.isEditable = !propertyRep.disabledReason();

                return propertyViewModel;
            };
            return PropertyViewModel;
        })();
        Angular.PropertyViewModel = PropertyViewModel;

        var CollectionViewModel = (function () {
            function CollectionViewModel() {
            }
            CollectionViewModel.create = function (collectionRep, $routeParams) {
                var collectionViewModel = new CollectionViewModel();

                collectionViewModel.title = collectionRep.extensions().friendlyName;
                collectionViewModel.size = collectionRep.size();
                collectionViewModel.pluralName = collectionRep.extensions().pluralName;

                collectionViewModel.href = toCollectionUrl(collectionRep.detailsLink().href(), $routeParams);
                collectionViewModel.color = toColorFromType(collectionRep.extensions().elementType);

                collectionViewModel.items = [];

                return collectionViewModel;
            };

            CollectionViewModel.createFromDetails = function (collectionRep, $routeParams) {
                var collectionViewModel = new CollectionViewModel();
                var links = collectionRep.value().models;

                collectionViewModel.title = collectionRep.extensions().friendlyName;
                collectionViewModel.size = links.length;
                collectionViewModel.pluralName = collectionRep.extensions().pluralName;

                collectionViewModel.href = toCollectionUrl(collectionRep.selfLink().href(), $routeParams);
                collectionViewModel.color = toColorFromType(collectionRep.extensions().elementType);

                var i = 0;
                collectionViewModel.items = _.map(links, function (link) {
                    return ItemViewModel.create(link, collectionViewModel.href, i++, $routeParams);
                });

                return collectionViewModel;
            };

            CollectionViewModel.createFromList = function (listRep, $routeParams, $location) {
                var collectionViewModel = new CollectionViewModel();
                var links = listRep.value().models;

                collectionViewModel.size = links.length;
                collectionViewModel.pluralName = "Objects";

                var i = 0;
                collectionViewModel.items = _.map(links, function (link) {
                    return ItemViewModel.create(link, $location.path(), i++, $routeParams);
                });

                return collectionViewModel;
            };
            return CollectionViewModel;
        })();
        Angular.CollectionViewModel = CollectionViewModel;

        var ServicesViewModel = (function () {
            function ServicesViewModel() {
            }
            ServicesViewModel.create = function (servicesRep) {
                var servicesViewModel = new ServicesViewModel();
                var links = servicesRep.value().models;
                servicesViewModel.title = "Services";
                servicesViewModel.color = "bg-color-darkBlue";
                servicesViewModel.items = _.map(links, function (link) {
                    return LinkViewModel.create(link);
                });
                return servicesViewModel;
            };
            return ServicesViewModel;
        })();
        Angular.ServicesViewModel = ServicesViewModel;

        var ServiceViewModel = (function () {
            function ServiceViewModel() {
            }
            ServiceViewModel.create = function (serviceRep, $routeParams) {
                var serviceViewModel = new ServiceViewModel();
                var actions = serviceRep.actionMembers();
                serviceViewModel.serviceId = serviceRep.serviceId();
                serviceViewModel.title = serviceRep.title();
                serviceViewModel.actions = _.map(actions, function (action) {
                    return ActionViewModel.create(action, $routeParams);
                });
                serviceViewModel.color = toColorFromType(serviceRep.serviceId());
                serviceViewModel.href = toAppUrl(serviceRep.getUrl());
                serviceViewModel.closeNestedObject = toAppUrl(serviceRep.getUrl(), $routeParams, ["property", "collectionItem", "resultObject"]);
                serviceViewModel.closeCollection = toAppUrl(serviceRep.getUrl(), $routeParams, ["collection", "resultCollection"]);

                return serviceViewModel;
            };
            return ServiceViewModel;
        })();
        Angular.ServiceViewModel = ServiceViewModel;

        var DomainObjectViewModel = (function () {
            function DomainObjectViewModel() {
            }
            DomainObjectViewModel.prototype.doSave = function () {
            };

            DomainObjectViewModel.prototype.update = function (objectRep, $routeParams) {
                var properties = objectRep.propertyMembers();
                var collections = objectRep.collectionMembers();
                var actions = objectRep.actionMembers();

                this.domainType = objectRep.domainType();
                this.title = objectRep.title();

                this.message = "";

                this.properties = _.map(properties, function (property, id) {
                    return PropertyViewModel.create(property, id, $routeParams);
                });
                this.collections = _.map(collections, function (collection) {
                    return CollectionViewModel.create(collection, $routeParams);
                });
                this.actions = _.map(actions, function (action) {
                    return ActionViewModel.create(action, $routeParams);
                });
            };

            DomainObjectViewModel.create = function (objectRep, $routeParams, save) {
                var objectViewModel = new DomainObjectViewModel();

                objectViewModel.href = toAppUrl(objectRep.getUrl());

                objectViewModel.closeNestedObject = toAppUrl(objectRep.getUrl(), $routeParams, ["property", "collectionItem", "resultObject"]);
                objectViewModel.closeCollection = toAppUrl(objectRep.getUrl(), $routeParams, ["collection", "resultCollection"]);

                objectViewModel.cancelEdit = toAppUrl(objectRep.getUrl());

                objectViewModel.color = toColorFromType(objectRep.domainType());

                objectViewModel.doSave = save ? function () {
                    return save(objectViewModel);
                } : function () {
                };

                objectViewModel.update(objectRep, $routeParams);

                return objectViewModel;
            };
            return DomainObjectViewModel;
        })();
        Angular.DomainObjectViewModel = DomainObjectViewModel;
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.angular.viewmodels.js.map
