var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Spiro;
(function (Spiro) {
    (function (Modern) {
        (function (Tagged) {
            var TagsPresentationFactory = (function () {
                function TagsPresentationFactory() { }
                TagsPresentationFactory.prototype.CreatePresentation = function (model, element) {
                    var view;
                    if(model instanceof Spiro.DomainObjectRepresentation) {
                        view = new ObjectPresentation(model, element);
                    }
                    return view;
                };
                return TagsPresentationFactory;
            })();            
            var ObjectPresentation = (function (_super) {
                __extends(ObjectPresentation, _super);
                function ObjectPresentation(model, element) {
                                _super.call(this);
                    this.model = model;
                    this.element = element;
                }
                ObjectPresentation.prototype.setupEvents = function () {
                    var _this = this;
                    this.element.on("click", ".back", function (event) {
                        _this.markLastClicked(event);
                        _this.trigger("back");
                    });
                    this.element.on("click", ".forward", function (event) {
                        _this.markLastClicked(event);
                        _this.trigger("forward");
                    });
                    this.element.on("click", ".up", function (event) {
                        _this.markLastClicked(event);
                        _this.trigger("up");
                    });
                    this.element.on("click", ".down", function (event) {
                        _this.markLastClicked(event);
                        _this.trigger("down");
                    });
                    this.element.on("click", ".action", function (event) {
                        _this.trigger("action", $(event.currentTarget).attr("id"));
                    });
                };
                ObjectPresentation.prototype.markLastClicked = function (event) {
                    this.element.find(".lastClicked").removeClass("lastClicked");
                    $(event.currentTarget).addClass("lastClicked");
                };
                ObjectPresentation.prototype.disableLastClicked = function () {
                    this.element.find(".back .forward .up .down").removeAttr("disabled");
                    this.element.find(".lastClicked").attr("disabled", "disabled");
                };
                ObjectPresentation.prototype.draw = function () {
                    var title = Spiro.Tags.Tag("h2").setInnerText(this.model.title());
                    var actions = this.model.actionMembers();
                    var actionsDiv = Spiro.Tags.Tag("div");
                    for(var a in actions) {
                        var action = actions[a];
                        var actionTag = Spiro.Tags.Tag("button", "action").setInnerText(action.extensions().friendlyName);
                        actionTag.mergeAttribute("id", a);
                        actionsDiv.innerHtml += actionTag;
                    }
                    var upButton = Spiro.Tags.Tag("button", "up").setInnerText("Up");
                    var downButton = Spiro.Tags.Tag("button", "down").setInnerText("Down");
                    var backButton = Spiro.Tags.Tag("button", "back").setInnerText("Back");
                    var forwardButton = Spiro.Tags.Tag("button", "forward").setInnerText("Forward");
                    var upDownDiv = Spiro.Tags.Tag("div");
                    upDownDiv.innerHtml += downButton;
                    upDownDiv.innerHtml += upButton;
                    var backForwardDiv = Spiro.Tags.Tag("div");
                    backForwardDiv.innerHtml += backButton;
                    backForwardDiv.innerHtml += forwardButton;
                    this.element.html("");
                    this.element.append($(title.toString()));
                    this.element.append($(actionsDiv.toString()));
                    this.element.append($(upDownDiv.toString()));
                    this.element.append($(backForwardDiv.toString()));
                    this.setupEvents();
                    return this.element;
                };
                return ObjectPresentation;
            })(Backbone.EventsMixin);            
            function handleKey(event) {
                if(event.keyCode == 39) {
                    $("button.forward").click();
                    return false;
                }
                if(event.keyCode == 37) {
                    $("button.back").click();
                    return false;
                }
                if(event.keyCode == 38) {
                    $("button.up").click();
                    return false;
                }
                if(event.keyCode == 40) {
                    $("button.down").click();
                    return false;
                }
                return true;
            }
            $(document).bind("keydown", handleKey);
            Modern.presentationFactory = new TagsPresentationFactory();
        })(Modern.Tagged || (Modern.Tagged = {}));
        var Tagged = Modern.Tagged;
    })(Spiro.Modern || (Spiro.Modern = {}));
    var Modern = Spiro.Modern;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.modern.presentations.tagged.js.map
