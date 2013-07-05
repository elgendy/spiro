/// <reference path="backbone.d.ts" />

declare module Backbone {

    export interface HasEvents {
        on(event: string, callback, context?);
        once(event: string, callback, context?);
        off(event: string, callback, context?);
        trigger(event: string, args?);
        stopListening(obj: Object, name: string, callback);
    }

    //export class EventsMixin implements HasEvents {
    //    on(event: string, callback, context?);
    //    once(event: string, callback, context?);
    //    off(event: string, callback, context?);
    //    trigger(event: string, args?);
    //    stopListening(obj: Object, name: string, callback);
    //}

    export var cachingSync: any;
}