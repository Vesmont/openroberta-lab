define(["require", "exports", "blockly", "utils/nepo.logger"], function (require, exports, Blockly, nepo_logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VariableModel = void 0;
    var LOG = new nepo_logger_1.Log();
    var IDENT = window.location.pathname;
    var VariableModel = /** @class */ (function () {
        function VariableModel(workspace, scopeId, varId, varName, dataType) {
            this.workspace = workspace;
            this.varId = varId || Blockly.utils.genUid();
            this.scopeId = scopeId;
            this.varName = varName;
            this.dataType = dataType;
            if (this.scopeId !== "dublicate") {
                this.addToScopeList(scopeId);
            }
            LOG.info(IDENT, "create variable", this.varId, scopeId);
        }
        VariableModel.prototype.addToScopeList = function (scopeId) {
            this.workspace.addVariable(scopeId, this);
        };
        VariableModel.prototype.setName = function (newName) {
            this.varName = newName;
        };
        VariableModel.prototype.getId = function () {
            return this.varId;
        };
        VariableModel.prototype.getName = function () {
            return this.varName;
        };
        VariableModel.prototype.getScopeId = function () {
            return this.scopeId;
        };
        VariableModel.prototype.getDataType = function () {
            return this.dataType;
        };
        return VariableModel;
    }());
    exports.VariableModel = VariableModel;
    ;
});
//# sourceMappingURL=nepo.variable.model.js.map