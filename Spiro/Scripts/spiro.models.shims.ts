//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.

// ABOUT THIS FILE:
// spiro.models defines a set of classes that correspond directly to the JSON representations returned by Restful Objects
// resources.  These classes provide convenient methods for navigating the contents of those representations, and for
// following links to other resources.

// null  version of shims 

module Spiro {

    export class ModelShim {
        constructor(object?) {
        }
        url: any;
        attributes: any;
        get(attributeName: string): any { }
        set(attributeName?: any, value?: any, options?: any) { }
    }

    // base class for all representations that can be directly loaded from the server 
    export class HateoasModelBaseShim extends ModelShim {
        constructor(object?) {
            super(object);
            this.url = () => { return this.hateoasUrl; };
        }
        hateoasUrl: string;
        method: string;
        private suffix: string;
  
        onError(map: Object, statusCode: string, warnings: string) { }
        preFetch() { }
    }

    export class ArgumentMap extends HateoasModelBaseShim {
        constructor(map: Object, parent: any, public id: string) {
            super(map);
        }
        onChange() { }
        onError(map: Object, statusCode: string, warnings: string) { }
    }


    export class CollectionShim {
        constructor(object?) {
        }
        url: any;
        add(models: any, options?: any) { }
    }
}
