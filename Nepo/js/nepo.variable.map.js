define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VariableMap = void 0;
    var VariableMap = /** @class */ (function () {
        function VariableMap(varName, dataType) {
            this.varName = varName;
            this.dataType = dataType;
            this.ids = [];
        }
        VariableMap.prototype.addId = function (id) {
            console.assert(!!id, "missing id", [this]);
            this.ids.push(id);
            console.log("add " + id);
            console.log(this.varName);
            console.log(this.ids);
        };
        VariableMap.prototype.removeId = function (id) {
            console.assert(!!id, "missing id", [this]);
            var index = this.ids.indexOf(id);
            if (index >= 0) {
                this.ids.splice(index, 1);
                console.log("remove " + id);
                console.log(this.varName);
                console.log(this.ids);
            }
            else {
                console.warn("Index to be removed is not in the list of ids", this, id);
            }
        };
        VariableMap.prototype.hasIds = function () {
            return this.ids.length > 0;
        };
        return VariableMap;
    }());
    exports.VariableMap = VariableMap;
});
//# sourceMappingURL=nepo.variable.map.js.map