//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.

// ABOUT THIS FILE:
// spiro.models defines a set of classes that correspond directly to the JSON representations returned by Restful Objects
// resources.  These classes provide convenient methods for navigating the contents of those representations, and for
// following links to other resources.

/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/backbone/backbone.d.ts" />

// Backbone version of shims 

module Spiro {

    declare var _: any;

    // option helpers 
    export interface Options {
        success?: (originalModel, resp, iOptions) => void;
        error?: (originalModel, resp, iOptions) => void;
    }

    export var sync = function (method: string, model: Backbone.Model, options?: any) {
        Backbone.sync(method, model, options);
    }

    export class ModelShim extends Backbone.Model {

    }

    // base class for all representations that can be directly loaded from the server 
    export class HateoasModelBaseShim extends ModelShim {
        constructor(object?) {
            super(object);
            this.once('error', this.error);
        }

        hateoasUrl: string;
        method: string = "GET"; // default to GET 
        private suffix: string = "";

        url(): string {
            return (this.hateoasUrl || super.url()) + this.suffix;
        }

        error(originalModel, resp, iOptions) {
            var rs = resp.responseText ? $.parseJSON(resp.responseText) : {};
            var warnings = resp.getResponseHeader("Warning");
            this.trigger("error", this.onError(rs, resp.status, warnings));
        }

        onError(map: Object, statusCode: string, warnings: string) { }

        private appendUrlSuffix() {
            this.suffix = "";
            var asJson = this.toJSON();

            if (_.toArray(asJson).length > 0) {
                var map = JSON.stringify(asJson);
                var encodedMap = encodeURI(map);
                this.suffix = "?" + encodedMap;
            }
        }

        preFetch() { }

        fetch(options?) {
            this.preFetch();
            if (this.method === "GET") {
                this.appendUrlSuffix();
                super.fetch(options);
            }
            else if (this.method === "POST") {
                super.save(null, options);
            }
            else if (this.method === "PUT") {
                // set id so not new ? 
                super.save(null, options);
            }
            else if (this.method === "DELETE") {
                this.appendUrlSuffix();
                super.destroy(options);
            }
        }

        save(options?) {
            super.save(null, options);
        }

        destroy(options?) {
            this.appendUrlSuffix();
            super.destroy(options);
        }

        sync(method, model, options) {
            model.id = model.url();
            sync(method, model, options);
        }
    }

    export class ArgumentMap extends HateoasModelBaseShim {

        constructor(map: Object, parent: Backbone.Model, public id: string) {
            super(map);

            this.id = id;

            this.on("requestFailed", (args) => {
                parent.trigger("requestFailed", args);
            });

            this.on("requestSucceeded", (args) => {
                parent.trigger("requestSucceeded", args);
            });

            this.on("change", () => {
                this.onChange();
            });

        }

        onChange() { }

        onError(map: Object, statusCode: string, warnings: string) { }
    }


    export class CollectionShim extends Backbone.Collection {

    }

}
