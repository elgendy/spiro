/// <reference path="spiro.models.ts" />
/// <reference path="spiro.angular.app.ts" />

module Spiro.Angular {

    interface ColourMapItemInterface {
        [index: string]: string;
    }

    interface ColourMapInterface {
        [index: string]: ColourMapItemInterface;
    }

    declare var colourMap: ColourMapInterface;
    declare var defaultColourArray: ColourMapItemInterface[];
    declare var defaultColour: ColourMapItemInterface;

    function hashCode(toHash) {
        var hash = 0, i, char;
        if (toHash.length == 0) return hash;
        for (i = 0; i < toHash.length; i++) {
            char = toHash.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    function getColourMapValues(dt : string) {
        var map = dt ? colourMap[dt] : defaultColour;
        if (!map) {
            var hash = Math.abs(hashCode(dt));
            var index = hash % 18;
            map = defaultColourArray[index];
            colourMap[dt] = map;
        }
        return map;
    }

    function typeFromUrl(url : string) : string {
        var typeRegex = /(objects|services)\/([\w|\.]+)/;
        var results = (typeRegex).exec(url);
        return (results && results.length > 2) ? results[2] : "";
    }

    function toColorFromHref(href : string) {      
        var type = typeFromUrl(href);
        return "bg-color-" + getColourMapValues(type)["backgroundColor"]; 
    }

    function toColorFromType(type) {
        return "bg-color-" + getColourMapValues(type)["backgroundColor"];
    }


    // TODO rewrite all the parm handling code into a window manager class 
    // state from $routeParams driven by events 
    export function getOtherParms($routeParams, excepts?: string[]) {

        function include(parm) {
            return $routeParams[parm] && !_.any(excepts, (except) => parm === except); 
        }

        function getParm(name: string) {
            return include(name) ? "&" + name + "=" + $routeParams[name] : "";
        }
    
        var actionParm = include("action") ? "&action=" + $routeParams.action : "";
        var collectionParm = include("collection") ? "&collection=" + $routeParams.collection : "";
        var collectionItemParm = include("collectionItem") ? "&collectionItem=" + $routeParams.collectionItem : "";
        var propertyParm = include("property") ? "&property=" + $routeParams.property : "";
        var resultParm = include("result") ? "&result=" + $routeParams.result : "";

        return actionParm + collectionParm + collectionItemParm + propertyParm + resultParm; 
    }

    function toAppUrl(href : string, $routeParams?, toClose? : string[]) : string {
        var urlRegex = /(objects|services)\/(.*)/;
        var results = (urlRegex).exec(href);
        var parms = ""; 

        if (toClose) {
            parms = getOtherParms($routeParams, toClose); 
            parms = parms ? "?" + parms.substr(1) : ""; 
        }

        return (results && results.length > 2) ? "#/" + results[1] + "/" + results[2]  + parms: "";
    }

    
    function toActionUrl(href: string, $routeParams): string {
        var urlRegex = /(services|objects)\/([\w|\.]+(\/[\w|\.]+)?)\/actions\/([\w|\.]+)/;
        var results = (urlRegex).exec(href);
        return (results && results.length > 3) ? "#/" + results[1] + "/" + results[2] + "?action=" + results[4] + getOtherParms($routeParams, ["action"]) : "";
    }

    function toPropertyUrl(href: string, $routeParams): string {
        var urlRegex = /(objects)\/([\w|\.]+)\/([\w|\.]+)\/(properties)\/([\w|\.]+)/;
        var results = (urlRegex).exec(href);   
        return (results && results.length > 5) ? "#/" + results[1] + "/" + results[2] + "/" + results[3] + "?property=" + results[5] + getOtherParms($routeParams, ["property", "collectionItem", "result"]) : "";
    }

    function toCollectionUrl(href: string, $routeParams): string {
        var urlRegex = /(objects)\/([\w|\.]+)\/([\w|\.]+)\/(collections)\/([\w|\.]+)/;
        var results = (urlRegex).exec(href); 
        return (results && results.length > 5) ? "#/" + results[1] + "/" + results[2] + "/" + results[3] + "?collection=" + results[5] + getOtherParms($routeParams, [])  : "";
    }

    function toItemUrl(href: string, index : number, $routeParams): string {
        var urlRegex = /(objects)\/([\w|\.]+)\/([\w|\.]+)/;
        var results = (urlRegex).exec(href);     
        return (results && results.length > 2) ? "#/" + results[1] + "/" + results[2] + "/" + results[3] + "?collectionItem=" + $routeParams.collection + "/" + index + getOtherParms($routeParams, ["property", "collectionItem", "result"])  : "";
    }

    export class LinkViewModel {

        title: string;
        href: string;
        color: string; 

        static create(linkRep: Link) {
            var linkViewModel = new LinkViewModel(); 
            linkViewModel.title = linkRep.title();
            linkViewModel.href = toAppUrl(linkRep.href()); 
            linkViewModel.color = toColorFromHref(linkRep.href());
            return linkViewModel;
        }
    } 

    export class ItemViewModel {

        title: string;
        href: string;
        color: string;

        static create(linkRep: Link, parentHref : string, index : number, $routeParams) {
            var linkViewModel = new LinkViewModel();
            linkViewModel.title = linkRep.title();
            linkViewModel.href = toItemUrl(parentHref, index, $routeParams);
            linkViewModel.color = toColorFromHref(linkRep.href());
            return linkViewModel;
        }
    }

    export class ParameterViewModel {

        title: string;
        dflt: string; 
        value: string; 
        error: string; 
        id: string; 

        static create(parmRep: Parameter, id : string) {
            var parmViewModel = new ParameterViewModel();

            parmViewModel.title = parmRep.extensions().friendlyName;
            parmViewModel.dflt = parmRep.default().toValueString();
            parmViewModel.error = ""; 
            parmViewModel.value = ""; 
            parmViewModel.id = id; 
          
            return parmViewModel;
        }
    } 

    export class ActionViewModel {

        title: string;
        href: string;

        static create(actionRep: ActionMember, $routeParams) {
            var actionViewModel = new ActionViewModel();
            actionViewModel.title = actionRep.extensions().friendlyName;
            actionViewModel.href = toActionUrl(actionRep.detailsLink().href(), $routeParams);
            return actionViewModel;
        }
    } 

    export class DialogViewModel {

        title: string;
        error: string;
        close: string; 

        parameters: ParameterViewModel[];

        doInvoke() {}

        static create(actionRep: ActionRepresentation, $routeParams,  invoke: (dvm : DialogViewModel) => void ) {
            var dialogViewModel = new DialogViewModel();
            var parameters = actionRep.parameters();

            dialogViewModel.title = actionRep.extensions().friendlyName;
            dialogViewModel.error = "";

            dialogViewModel.close = toAppUrl(actionRep.upLink().href(), $routeParams, ["action"]); 

            dialogViewModel.parameters = _.map(parameters, (parm, id) => { return ParameterViewModel.create(parm, id); });

            dialogViewModel.doInvoke = () => invoke(dialogViewModel);  

            return dialogViewModel;
        }
    } 
    

    export class PropertyViewModel {

        title: string;
        value: string;
        type: string;
        returnType: string;
        href: string;
        target: string;
        color : string; 

        static create(propertyRep: PropertyMember, $routeParams) {
            var propertyViewModel = new PropertyViewModel();
            propertyViewModel.title = propertyRep.extensions().friendlyName;
            propertyViewModel.value = propertyRep.value().toString();
            propertyViewModel.type = propertyRep.isScalar() ? "scalar" : "ref";
            propertyViewModel.returnType = propertyRep.extensions().returnType;
            propertyViewModel.href = propertyRep.isScalar() ? "" : toPropertyUrl(propertyRep.detailsLink().href(), $routeParams);
            propertyViewModel.target = propertyRep.isScalar() || propertyRep.value().isNull()  ? "" : toAppUrl(propertyRep.value().link().href());

            propertyViewModel.color = toColorFromType(propertyRep.extensions().returnType); 

            return propertyViewModel;
        }
    } 

    export class CollectionViewModel {

        title: string;
        size: number;
        pluralName: string;
        href: string;
        color: string; 
        items: LinkViewModel[]; 
        
        static create(collectionRep: CollectionMember, $routeParams) {
            var collectionViewModel = new CollectionViewModel();
          
            collectionViewModel.title = collectionRep.extensions().friendlyName;
            collectionViewModel.size = collectionRep.size();
            collectionViewModel.pluralName = collectionRep.extensions().pluralName;
            
            collectionViewModel.href = toCollectionUrl(collectionRep.detailsLink().href(), $routeParams);
            collectionViewModel.color = toColorFromType(collectionRep.extensions().elementType);
            
            collectionViewModel.items = [];

            return collectionViewModel;
        }

        static createFromDetails(collectionRep: CollectionRepresentation, $routeParams) {
            var collectionViewModel = new CollectionViewModel();
            var links = collectionRep.value().models;
            
            collectionViewModel.title = collectionRep.extensions().friendlyName;
            collectionViewModel.size = links.length;
            collectionViewModel.pluralName = collectionRep.extensions().pluralName;

            collectionViewModel.href = toCollectionUrl(collectionRep.selfLink().href(), $routeParams);
            collectionViewModel.color = toColorFromType(collectionRep.extensions().elementType);

            var i = 0; 
            collectionViewModel.items = _.map(links, (link) => { return ItemViewModel.create(link, collectionViewModel.href, i++, $routeParams); });

            return collectionViewModel;
        }

    } 

    export class ServicesViewModel {
        
        title: string; 
        color: string; 
        items: LinkViewModel[]; 
            
        static create(servicesRep: DomainServicesRepresentation) {
            var servicesViewModel = new ServicesViewModel(); 
            var links = servicesRep.value().models;
            servicesViewModel.title = "Services";
            servicesViewModel.color = "bg-color-darkBlue";
            servicesViewModel.items = _.map(links, (link) => { return LinkViewModel.create(link); });
            return servicesViewModel;
        }
    } 

    export class ServiceViewModel {

        title: string;
        serviceId: string;
        actions: ActionViewModel[];
        color: string; 
        href: string; 

        closeNestedObject: string; 

        static create(serviceRep: DomainObjectRepresentation, $routeParams) {
            var serviceViewModel = new ServiceViewModel();
            var actions = serviceRep.actionMembers();
            serviceViewModel.serviceId = serviceRep.serviceId();
            serviceViewModel.title = serviceRep.title();
            serviceViewModel.actions = _.map(actions, (action) => { return ActionViewModel.create(action, $routeParams); });
            serviceViewModel.color = toColorFromType(serviceRep.serviceId());
            serviceViewModel.href = toAppUrl(serviceRep.getUrl()); 
            serviceViewModel.closeNestedObject = toAppUrl(serviceRep.getUrl(), $routeParams, ["result"]); 

            return serviceViewModel;
        }
    } 

    export class DomainObjectViewModel {

        title: string;
        domainType: string; 
        properties: PropertyViewModel[];
        collections: CollectionViewModel[];
        actions: ActionViewModel[];
        color: string; 
        href: string; 

        closeNestedObject: string; 
        closeCollection: string; 
     
        static create(objectRep: DomainObjectRepresentation, $routeParams) {
            var objectViewModel = new DomainObjectViewModel();
            
            var properties = objectRep.propertyMembers();
            var collections = objectRep.collectionMembers();
            var actions = objectRep.actionMembers();
        
            objectViewModel.domainType = objectRep.domainType();
            objectViewModel.title = objectRep.title();
            objectViewModel.href = toAppUrl(objectRep.getUrl()); 

            objectViewModel.closeNestedObject = toAppUrl(objectRep.getUrl(), $routeParams, ["property", "collectionItem", "result"]); 
            objectViewModel.closeCollection = toAppUrl(objectRep.getUrl(), $routeParams, ["collection"]); 

            objectViewModel.color = toColorFromType(objectRep.domainType()); 

            objectViewModel.properties = _.map(properties, (property) => { return PropertyViewModel.create(property, $routeParams); });
            objectViewModel.collections = _.map(collections, (collection) => { return CollectionViewModel.create(collection, $routeParams); });
            objectViewModel.actions = _.map(actions, (action) => { return ActionViewModel.create(action, $routeParams); });

            return objectViewModel;
        }
    } 
}