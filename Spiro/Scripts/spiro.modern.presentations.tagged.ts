/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/backbone/backbone.d.ts" />
/// <reference path="typings/backbone/backbone.mine.d.ts" />
/// <reference path="spiro.models.ts" />
/// <reference path="spiro.models.helpers.ts" />
/// <reference path="spiro.modern.presentations.ts" />
/// <reference path="spiro.tags.ts" />

module Spiro.Modern.Tagged {

    class TagsPresentationFactory implements PresentationFactory  {
        CreatePresentation(model: Backbone.Model, element: JQuery): Presentation {
            // todo make map 
            var view: Presentation;

            if (model instanceof DomainObjectRepresentation) {
                view = new ObjectPresentation(<DomainObjectRepresentation>model, element);
            }

            return view;
        }
    }

    class ObjectPresentation extends Backbone.EventsMixin implements Presentation {

        constructor(public model: Spiro.DomainObjectRepresentation, public element: JQuery) {
            super();
        }

        setupEvents() {
            this.element.on("click", ".back", (event : JQueryEventObject) => {                
                this.markLastClicked(event);
                this.trigger("back");
            });
            this.element.on("click", ".forward", (event: JQueryEventObject) => {                
                this.markLastClicked(event);
                this.trigger("forward");
            });
            this.element.on("click", ".up", (event: JQueryEventObject) => {                
                this.markLastClicked(event);
                this.trigger("up");
            });
            this.element.on("click", ".down", (event: JQueryEventObject) => {               
                this.markLastClicked(event);
                this.trigger("down");
            });
            this.element.on("click", ".action", (event: JQueryEventObject) => {
                this.trigger("action", $(event.currentTarget).attr("id"));
            });
        }

        markLastClicked(event: JQueryEventObject) {
            this.element.find(".lastClicked").removeClass("lastClicked");
            $(event.currentTarget).addClass("lastClicked");
        }

        disableLastClicked() {
            this.element.find(".back .forward .up .down").removeAttr("disabled");
            this.element.find(".lastClicked").attr("disabled", "disabled");
        }

        draw() : JQuery {
            var title = Tags.Tag("h2").setInnerText(this.model.title());

            var actions = this.model.actionMembers();

            var actionsDiv = Tags.Tag("div");

            for (var a in actions) {
                var action = actions[a];
                var actionTag = Tags.Tag("button", "action").setInnerText(action.extensions().friendlyName);
                actionTag.mergeAttribute("id", a);
                actionsDiv.innerHtml += actionTag;
            }

            var upButton = Tags.Tag("button", "up").setInnerText("Up");
            var downButton = Tags.Tag("button", "down").setInnerText("Down");
            var backButton = Tags.Tag("button", "back").setInnerText("Back");
            var forwardButton = Tags.Tag("button", "forward").setInnerText("Forward");

            var upDownDiv = Tags.Tag("div");
            upDownDiv.innerHtml += downButton;
            upDownDiv.innerHtml += upButton;

            var backForwardDiv = Tags.Tag("div");
            backForwardDiv.innerHtml += backButton;
            backForwardDiv.innerHtml += forwardButton;

            this.element.html("");
            this.element.append($(title.toString()));
            this.element.append($(actionsDiv.toString()));
            this.element.append($(upDownDiv.toString()));
            this.element.append($(backForwardDiv.toString()));

            this.setupEvents();

            return this.element;
        }
    }

    function handleKey(event) {
        if (event.keyCode == 39) { // forward -> 
            $("button.forward").click();
            return false;
        }
        if (event.keyCode == 37) { // backward <-
            $("button.back").click();
            return false;
        }
        if (event.keyCode == 38) { // up -> 
            $("button.up").click();
            return false;
        }
        if (event.keyCode == 40) { // down <-
            $("button.down").click();
            return false;
        }

        return true;
    }

    $(document).bind("keydown", handleKey);

    presentationFactory = new TagsPresentationFactory();
}