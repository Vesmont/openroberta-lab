define(["require", "exports", "blockly", "nepo.constants.mixins", "nepo.variables", "utils/nepo.logger", "nepo.blockly"], function (require, exports, Blockly, NepoMix, Variables, nepo_logger_1, nepo_blockly_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DATATYPE_DROPDOWN_VALIDATOR_EXTENSION = exports.PROCEDURE_CALL_EXTENSION = exports.PROCEDURE_EXTENSION = exports.INTERNAL_VARIABLE_DECLARATION_EXTENSION = exports.VARIABLE_DECLARATION_EXTENSION = exports.VARIABLE_EXTENSION = exports.TEXT_COMMENTS_VALIDATOR = exports.TEXT_COMMENTS_EXTENSION = exports.TEXT_JOIN_EXTENSION = exports.TEXT_QUOTES_EXTENSION = exports.IS_DIVISIBLE_MUTATOR_EXTENSION = exports.CONTROLS_IF_TOOLTIP_EXTENSION = exports.VARIABLE_SCOPE_EXTENSION = exports.COMMON_TYPE_EXTENSION = exports.COMMON_PARENT_TOOLTIP_EXTENSION = exports.COMMON_TOOLTIP_EXTENSION = void 0;
    var LOG = new nepo_logger_1.Log();
    LOG.info("nothing to log?");
    exports.COMMON_TOOLTIP_EXTENSION = function () {
        var thisBlock = this;
        var type = thisBlock.type.toUpperCase();
        // define the standard tooltip
        var tooltip = "%{BKY_" + type + "_TOOLTIP}";
        this.setTooltip(function () {
            // check if there are dropdowns or variable used in the block
            var dropDownValue = "";
            var dropDownText = "";
            var variableName = "";
            var thisTooltip = tooltip;
            for (var _i = 0, _a = thisBlock.inputList; _i < _a.length; _i++) {
                var input = _a[_i];
                for (var _b = 0, _c = input.fieldRow; _b < _c.length; _b++) {
                    var field = _c[_b];
                    if (field instanceof Blockly.FieldVariable) {
                        variableName = field.getText();
                        break;
                    }
                    if (field instanceof Blockly.FieldDropdown) {
                        dropDownValue = field.getValue();
                        dropDownText = field.getText();
                        break;
                    }
                }
            }
            if (dropDownValue.length > 0 && Blockly.Msg[thisTooltip.slice(6, -1)] == undefined) {
                thisTooltip = "%{BKY_" + type + "_TOOLTIP_" + dropDownValue.toUpperCase() + "}";
            }
            // document missing tooltip
            if (Blockly.Msg[thisTooltip.slice(6, -1)] == undefined) {
                console.warn('No tooltip for ' + type + " defined!");
            }
            return Blockly.utils.replaceMessageReferences(thisTooltip).replace("%1", variableName.length > 0 ? variableName : dropDownText);
        });
    };
    exports.COMMON_PARENT_TOOLTIP_EXTENSION = function () {
        // this refers to the block that the extension is being run on, we need
        // to cache it so that it can be used inside the tooltip function.
        var thisBlock = this;
        this.setTooltip(function () {
            var parent = thisBlock.getParent();
            return (parent && parent.getInputsInline() && parent.tooltip) ||
                Blockly.utils.replaceMessageReferences("%{BKY_" + thisBlock.type.toUpperCase() + "_TOOLTIP}");
        });
    };
    exports.COMMON_TYPE_EXTENSION = function () {
    };
    exports.VARIABLE_SCOPE_EXTENSION = function () {
        this.varScope = true;
        switch (this.type) {
            case "controls_start":
                this.scopeType = "GLOBAL";
                break;
            case "variable_scope":
                this.scopeType = "LOCAL";
                break;
            case "procedures_defnoreturn":
            case "procedures_defreturn":
                this.scopeType = "PROC";
                break;
            case "controls_for":
            case "controls_forEach":
                this.scopeType = "LOOP";
                break;
            default:
                this.scopeType = "LOCAL";
        }
    };
    exports.CONTROLS_IF_TOOLTIP_EXTENSION = function () {
        this.setTooltip(function () {
            if (!this.elseifCount_ && !this.elseCount_) {
                return Blockly.Msg['CONTROLS_IF_TOOLTIP_1'];
            }
            else if (!this.elseifCount_ && this.elseCount_) {
                return Blockly.Msg['CONTROLS_IF_TOOLTIP_2'];
            }
            else if (this.elseifCount_ && !this.elseCount_) {
                return Blockly.Msg['CONTROLS_IF_TOOLTIP_3'];
            }
            else if (this.elseifCount_ && this.elseCount_) {
                return Blockly.Msg['CONTROLS_IF_TOOLTIP_4'];
            }
            return '';
        }.bind(this));
    };
    exports.IS_DIVISIBLE_MUTATOR_EXTENSION = function () {
        this.getField('PROPERTY').setValidator(function (option) {
            var divisorInput = (option == 'DIVISIBLE_BY');
            this.getSourceBlock().updateShape_(divisorInput);
        });
    };
    exports.TEXT_QUOTES_EXTENSION = function () {
        this.mixin(NepoMix.QUOTE_IMAGE_MIXIN);
        this.quoteField_('TEXT');
    };
    exports.TEXT_JOIN_EXTENSION = function () {
        this.mixin(NepoMix.QUOTE_IMAGE_MIXIN);
    };
    exports.TEXT_COMMENTS_EXTENSION = function () {
        this.mixin(NepoMix.COMMENTS_IMAGE_MIXIN);
        this.commentField_('TEXT');
    };
    exports.TEXT_COMMENTS_VALIDATOR = function () {
        this.getField('TEXT').setValidator(function (content) {
            if (content && content.match(/[<>\$]/)) {
                return null;
            }
            return content;
        });
    };
    exports.VARIABLE_EXTENSION = function () {
        this.mixin(NepoMix.VARIABLE_MIXIN);
    };
    exports.VARIABLE_DECLARATION_EXTENSION = function () {
        this.previousConnection.setCheck("declaration_only");
        this.setMovable(false);
        var name;
        this.scopeId_ = this.id;
        this.scopeType = "LOCAL";
        name = Variables.getUniqueName(this, [], Blockly.Msg["VARIABLES_LOCAL_DEFAULT_NAME"]);
        this.variable_ = this.workspace.createVariable(name, "Number", this.id);
        this.varDecl = true;
        this.dataType_ = "Number";
        this.setNextStatement(false, "declaration_only");
        this.next_ = false;
        this.getField("VAR").setValue(name);
        this.getField("VAR").setValidator(VARIABLE_DECLARATION_VALIDATOR);
    };
    exports.INTERNAL_VARIABLE_DECLARATION_EXTENSION = function () {
        this.mixin(NepoMix.INTERNAL_VARIABLE_DECLARATION_MIXIN, true);
        this.varScope = true;
        this.scopeId_ = this.id;
        this.dataType_ = "Number";
        this.scopeType = "LOOP";
        this.varDecl = true;
        this.internalVarDecl = true;
        this.scopeId_ = this.id;
        this.setFieldValue(Blockly.Msg["VARIABLES_LOOP_DEFAULT_NAME"], "VAR");
        this.getField("VAR").setValidator(VARIABLE_DECLARATION_VALIDATOR);
    };
    var VARIABLE_DECLARATION_VALIDATOR = function (newName) {
        if (newName === this.value_) {
            return newName;
        }
        var thisBlock = this.getSourceBlock();
        var scopeVars = [];
        var scopeBlock = thisBlock.workspace.getBlockById(thisBlock.getScopeId());
        if (scopeBlock) {
            if (scopeBlock.scopeType === "GLOBAL") {
                scopeVars = Variables.getUniqueVariables(scopeBlock.workspace);
            }
            else {
                scopeVars = Variables.getVarScopeList(scopeBlock);
            }
        }
        var name = Variables.getUniqueName(thisBlock, scopeVars, newName);
        var varId = thisBlock.variable_ && thisBlock.variable_.getId();
        if (varId) {
            thisBlock.workspace.renameVariableById(varId, name);
        }
        else {
            thisBlock.workspace.createVariable(name);
        }
        return name;
    };
    exports.PROCEDURE_EXTENSION = function () {
        this.mixin(NepoMix.PROCEDURE_MIXIN, true);
        this.varScope = true;
        this.scopeId_ = this.id;
        this.varDecl = true;
        this.setNextStatement(false);
        this.setPreviousStatement(false);
        this.getField("NAME").setValidator(Blockly.Procedures.rename);
    };
    exports.PROCEDURE_CALL_EXTENSION = function () {
        this.args_ = 0;
        this.mixin(NepoMix.PROCEDURE_CALL_MIXIN, true);
    };
    exports.DATATYPE_DROPDOWN_VALIDATOR_EXTENSION = function () {
        Blockly.FieldDropdown.validateOptions_(nepo_blockly_1.Nepo.dropdownTypes);
        this.getField("DATATYPE").menuGenerator_ = nepo_blockly_1.Nepo.dropdownTypes;
        this.getField("DATATYPE").setValidator(function (option) {
            if (option && option !== this.sourceBlock_.getFieldValue('DATATYPE')) {
                this.sourceBlock_.updateDataType(option);
            }
        });
        this.getField("DATATYPE").doValueUpdate_(nepo_blockly_1.Nepo.dropdownTypes[0][1]);
    };
});
//# sourceMappingURL=nepo.constants.extensions.js.map