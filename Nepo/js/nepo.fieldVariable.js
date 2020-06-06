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
    exports.NepoFieldVariable = void 0;
    var NepoFieldVariable = /** @class */ (function (_super) {
        __extends(NepoFieldVariable, _super);
        function NepoFieldVariable(varName, opt_validator, opt_variableTypes, opt_defaultType, opt_config) {
            var _this = _super.call(this, varName, opt_validator, opt_variableTypes, opt_defaultType, opt_config) || this;
            _this.menuGenerator_ = NepoFieldVariable.dropdownCreate;
            _this.fromJson = function (options) {
                var varName = Blockly.utils.replaceMessageReferences(options['variable']);
                return new NepoFieldVariable(varName, undefined, undefined, undefined, options);
            };
            /**
             * Return a sorted list of variable names for variable dropdown menus.
             * Include a special option at the end for creating a new variable name.
             * @return {!Array.<!Array>} Array of variable names/id tuples.
             * @this {Blockly.FieldVariable}
             */
            _this.dropdownCreate = function () {
                if (!this.variable_) {
                    throw Error('Tried to call dropdownCreate on a variable field with no' +
                        ' variable selected.');
                }
                var variableModelList = [];
                if (this.sourceBlock_ && this.sourceBlock_.workspace) {
                    var variableTypes = this.getVariableTypes_();
                    // Get a copy of the list, so that adding rename and new variable options
                    // doesn't modify the workspace's list.
                    for (var i = 0; i < variableTypes.length; i++) {
                        var variableType = variableTypes[i];
                        var variables = this.sourceBlock_.workspace.getVariablesOfType(variableType);
                        variableModelList = variableModelList.concat(variables);
                    }
                }
                variableModelList.sort(Blockly.VariableModel.compareByName);
                var options = [];
                for (var i = 0; i < variableModelList.length; i++) {
                    // Set the UUID as the internal representation of the variable.
                    options[i] = [variableModelList[i].name, variableModelList[i].getId()];
                }
                return options;
            };
            return _this;
            //this.setValidator(this.dropDownVariable);
        }
        ;
        return NepoFieldVariable;
    }(Blockly.FieldVariable));
    exports.NepoFieldVariable = NepoFieldVariable;
    Blockly.fieldRegistry.register('nepo_field_variable', NepoFieldVariable);
});
//# sourceMappingURL=nepo.fieldVariable.js.map