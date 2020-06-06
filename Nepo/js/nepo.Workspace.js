var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "blockly"], function (require, exports, Blockly) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NepoWorkspace = void 0;
    var NepoWorkspace = /** @class */ (function (_super) {
        __extends(NepoWorkspace, _super);
        function NepoWorkspace() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.getScopeList = function () {
                return this.scopes_;
            };
            _this.addScope = function (id) {
                console.assert(!!id, "[Workspace.addScope] missing id ", [this]);
                console.assert(!this.scopes_[id], "[Workspace.addScope] scope " + id + " already exists", [this]);
                if (!this.scopes_[id]) {
                    this.scopes_[id] = [];
                    return true;
                }
                else {
                    return false;
                }
            };
            _this.addVariable = function (scopeId, variable) {
                if (!this.scopes_[scopeId]) {
                    this.addScope(scopeId);
                }
                this.scopes_[scopeId][variable.varId] = variable;
            };
            return _this;
        }
        return NepoWorkspace;
    }(Blockly.WorkspaceSvg));
    exports.NepoWorkspace = NepoWorkspace;
});
//# sourceMappingURL=nepo.Workspace.js.map