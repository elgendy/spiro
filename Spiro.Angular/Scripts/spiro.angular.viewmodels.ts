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

    function toAppUrl(href : string) : string {
        var urlRegex = /(objects|services)\/(.*)/;
        var results = (urlRegex).exec(href);
        return (results && results.length > 2) ? "#/" + results[1] + "/" + results[2] : "";
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

    export class ActionViewModel {

        title: string;
        href: string;

        static create(actionRep: ActionMember) {
            var actionViewModel = new ActionViewModel();
            actionViewModel.title = actionRep.extensions().friendlyName;
            actionViewModel.href = toAppUrl(actionRep.detailsLink().href());
            return actionViewModel;
        }
    } 

    export class PropertyViewModel {

        title: string;
        value: string;
        type: string;
        returnType: string;
        href: string;
        color : string; 

        static create(propertyRep: PropertyMember) {
            var propertyViewModel = new PropertyViewModel();
            propertyViewModel.title = propertyRep.extensions().friendlyName;
            propertyViewModel.value = propertyRep.value().toString();
            propertyViewModel.type = propertyRep.isScalar() ? "scalar" : "ref";
            propertyViewModel.returnType = propertyRep.extensions().returnType;
            propertyViewModel.href = toAppUrl(propertyRep.isScalar() ? "" : propertyRep.detailsLink().href());
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
        
        static create(collectionRep: CollectionMember) {
            var collectionViewModel = new CollectionViewModel();
          
            collectionViewModel.title = collectionRep.extensions().friendlyName;
            collectionViewModel.size = collectionRep.size();
            collectionViewModel.pluralName = collectionRep.extensions().pluralName;
            
            collectionViewModel.href = toAppUrl(collectionRep.detailsLink().href());
            collectionViewModel.color = toColorFromType(collectionRep.extensions().elementType);
            
            collectionViewModel.items = [];

            return collectionViewModel;
        }

        static createFromDetails(collectionRep: CollectionRepresentation) {
            var collectionViewModel = new CollectionViewModel();
            var links = collectionRep.value().models;
            
            collectionViewModel.title = collectionRep.extensions().friendlyName;
            collectionViewModel.size = links.length;
            collectionViewModel.pluralName = collectionRep.extensions().pluralName;

            collectionViewModel.href = toAppUrl(collectionRep.selfLink().href());
            collectionViewModel.color = toColorFromType(collectionRep.extensions().elementType);

            collectionViewModel.items = _.map(links, (link) => { return LinkViewModel.create(link); });

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

        static create(serviceRep: DomainObjectRepresentation) {
            var serviceViewModel = new ServiceViewModel();
            var actions = serviceRep.actionMembers();
            serviceViewModel.serviceId = serviceRep.serviceId();
            serviceViewModel.title = serviceRep.title();
            serviceViewModel.actions = _.map(actions, (action) => { return ActionViewModel.create(action); });
            serviceViewModel.color = toColorFromType(serviceRep.serviceId());
            serviceViewModel.href = toAppUrl(serviceRep.getUrl()); 

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

        static create(objectRep: DomainObjectRepresentation) {
            var objectViewModel = new DomainObjectViewModel();
            
            var properties = objectRep.propertyMembers();
            var collections = objectRep.collectionMembers();
            var actions = objectRep.actionMembers();
        
            objectViewModel.domainType = objectRep.domainType();
            objectViewModel.title = objectRep.title();
            objectViewModel.href = toAppUrl(objectRep.getUrl()); 

            objectViewModel.color = toColorFromType( objectRep.domainType()); 

            objectViewModel.properties = _.map(properties, (property) => { return PropertyViewModel.create(property); });
            objectViewModel.collections = _.map(collections, (collection) => { return CollectionViewModel.create(collection); });

            objectViewModel.actions = _.map(actions, (action) => { return ActionViewModel.create(action); });

            return objectViewModel;
        }
    } 
}