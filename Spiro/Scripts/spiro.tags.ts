
module Spiro.Tags {
    // based on Microsoft TagBuilder class 
    export class TagBuilder {

        attributes = {};

        innerHtml = "";

        constructor (private tagName: string, cls?: string) {
            if (!this.tagName) {
                throw "tagName cannot be empty";
            }

            if (cls) {
                this.addCssClass(cls);
            }
        }

        getTagName(): string {
            return this.tagName;
        }

        addCssClass(value: string) : TagBuilder {
            if (this.attributes["class"]) {
                this.attributes["class"] = value + " " + this.attributes["class"];
            }
            else {
                this.attributes["class"] = value;
            }

            return this;
        }

        private htmlEscape(str: string) {
            return str.replace(/&/g, '&amp;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#39;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
        }

        private  appendAttributes(): string {

            var sb = "";

            for (var attribute in this.attributes) {
                var key = attribute;

                var value = this.htmlEscape(this.attributes[key]); //   HttpUtility.HtmlAttributeEncode(attribute.Value);

                if (key === "id" && !(value)) {
                    continue;
                }

                sb = sb + " " + key + "=\"" + value + "\"";
            }

            return sb;
        }

        mergeAttribute(key: string, value: string, replaceExisting?: bool) : TagBuilder {
            if (!key) {
                throw "key cannot be null or empty";
            }

            if (replaceExisting || !this.attributes[key]) {
                this.attributes[key] = value;
            }

            return this; 
        }

        mergeAttributes(attrs, replaceExisting?: bool) : TagBuilder {

            for (var key in attrs) {
                this.mergeAttribute(key, attrs[key], replaceExisting);
            }
            
            return this; 
        }

        setInnerText(innerText: string) : TagBuilder{
            this.innerHtml = this.htmlEscape(innerText);
            return this; 
        }

        toString(renderMode? ) {
            var sb = "";
            switch (renderMode) {
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
        }
    }

    // helpers 

    export function Tag(tag: string): TagBuilder;
    export function Tag(tag: string, cls: string): TagBuilder;
    export function Tag(tag: string, cls: string, innerTag: TagBuilder): TagBuilder;
    export function Tag(tag: string, cls: string, innerText: string): TagBuilder;

    export function Tag(tag: string, cls?: string, inner?: any): TagBuilder {

        if (inner) {
            var newTag = new Tags.TagBuilder(tag, cls);

            if (inner instanceof TagBuilder) {
                newTag.innerHtml += inner;
            }
            else {
                newTag.setInnerText(inner); 
            }

            return newTag;
        }

        return new Tags.TagBuilder(tag, cls);
    }

}


   