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
// The interfaces defined here permit the separation of the presentation layer from the
// mechanics of spiro.modern, which use Backbone.js.  In the distribution, we provide
// an implementation of the presentation layer using Handlebars templates, but it would
// also be possible to write your presentation layer using Tags or Stickit or another
// library.


/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/backbone/backbone.d.ts" />
/// <reference path="typings/backbone/backbone.mine.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.models.helpers.ts" />



module Spiro.Modern {

    declare var _: any;

    //_.extend((<any>Backbone.EventsMixin).prototype, (<any>Backbone).Events);

    export interface Presentation extends Backbone.HasEvents {
        element: JQuery;
        draw(errors?: ErrorMap): void;
        draw(models?: Backbone.Model[]): void;
        clear(): void;
    }

    export interface ModernOptions extends Backbone.ViewOptions {
        nest?: bool;
        row?: bool;
        table?: bool;
        list?: bool;
        edit?: bool;
        doNotNavigate?: bool;
        actingController?: Backbone.View; // todo remove 
        controllerEvent?: (controller: Backbone.View) => void;
    }

    export interface PresentationFactory {
        CreatePresentation(model: Backbone.Model, options: ModernOptions): Presentation;
        PagePresentation(model?: Backbone.Model): Presentation;
    }

    export var presentationFactory: PresentationFactory;
}