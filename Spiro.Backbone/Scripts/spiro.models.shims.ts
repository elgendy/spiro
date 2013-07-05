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
    export var sync = function (method: string, model: Backbone.Model, options?: any) {
        Backbone.sync(method, model, options);
    }

    export class ModelShim extends Backbone.Model {

    }

    export class CollectionShim extends Backbone.Collection {

    }

}
