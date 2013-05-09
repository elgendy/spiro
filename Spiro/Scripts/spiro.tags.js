var Spiro;
(function (Spiro) {
    (function (Tags) {
        var TagBuilder = (function () {
            function TagBuilder(tagName, cls) {
                this.tagName = tagName;
                this.attributes = {
                };
                this.innerHtml = "";
                if(!this.tagName) {
                    throw "tagName cannot be empty";
                }
                if(cls) {
                    this.addCssClass(cls);
                }
            }
            TagBuilder.prototype.getTagName = function () {
                return this.tagName;
            };
            TagBuilder.prototype.addCssClass = function (value) {
                if(this.attributes["class"]) {
                    this.attributes["class"] = value + " " + this.attributes["class"];
                } else {
                    this.attributes["class"] = value;
                }
                return this;
            };
            TagBuilder.prototype.htmlEscape = function (str) {
                return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            };
            TagBuilder.prototype.appendAttributes = function () {
                var sb = "";
                for(var attribute in this.attributes) {
                    var key = attribute;
                    var value = this.htmlEscape(this.attributes[key]);
                    if(key === "id" && !(value)) {
                        continue;
                    }
                    sb = sb + " " + key + "=\"" + value + "\"";
                }
                return sb;
            };
            TagBuilder.prototype.mergeAttribute = function (key, value, replaceExisting) {
                if(!key) {
                    throw "key cannot be null or empty";
                }
                if(replaceExisting || !this.attributes[key]) {
                    this.attributes[key] = value;
                }
                return this;
            };
            TagBuilder.prototype.mergeAttributes = function (attrs, replaceExisting) {
                for(var key in attrs) {
                    this.mergeAttribute(key, attrs[key], replaceExisting);
                }
                return this;
            };
            TagBuilder.prototype.setInnerText = function (innerText) {
                this.innerHtml = this.htmlEscape(innerText);
                return this;
            };
            TagBuilder.prototype.toString = function (renderMode) {
                var sb = "";
                switch(renderMode) {
                    case "StartTag":
                        sb = sb + '<' + this.getTagName();
                        sb = sb + this.appendAttributes();
                        sb = sb + '>';
                        break;
                    case "EndTag":
                        sb = sb + '</' + this.getTagName() + '>';
                        break;
                    case "SelfClosing":
                        sb = sb + '<' + this.getTagName();
                        sb = sb + this.appendAttributes();
                        sb = sb + '/>';
                        break;
                    default:
                        sb = sb + '<' + this.getTagName();
                        sb = sb + this.appendAttributes();
                        sb = sb + '>';
                        sb = sb + this.innerHtml;
                        sb = sb + '</' + this.getTagName() + '>';
                        break;
                }
                return sb;
            };
            return TagBuilder;
        })();
        Tags.TagBuilder = TagBuilder;        
                                        function Tag(tag, cls, inner) {
            if(inner) {
                var newTag = new Tags.TagBuilder(tag, cls);
                if(inner instanceof TagBuilder) {
                    newTag.innerHtml += inner;
                } else {
                    newTag.setInnerText(inner);
                }
                return newTag;
            }
            return new Tags.TagBuilder(tag, cls);
        }
        Tags.Tag = Tag;
    })(Spiro.Tags || (Spiro.Tags = {}));
    var Tags = Spiro.Tags;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.tags.js.map
