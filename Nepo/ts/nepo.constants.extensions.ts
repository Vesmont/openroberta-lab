import * as Blockly from "blockly";
import * as NepoMix from "nepo.constants.mixins";
import * as Variables from "nepo.variables";
import { Log } from "utils/nepo.logger";
import { Nepo } from "nepo.blockly";

const LOG = new Log();
LOG.info("nothing to log?");

export const COMMON_TOOLTIP_EXTENSION = function() {
	var thisBlock = this;
	var type = thisBlock.type.toUpperCase();
	// define the standard tooltip
	var tooltip = "%{BKY_" + type + "_TOOLTIP}";
	this.setTooltip(function() {
		// check if there are dropdowns or variable used in the block
		let dropDownValue = "";
		let dropDownText = "";
		let variableName = "";
		let thisTooltip = tooltip;
		for (let input of thisBlock.inputList) {
			for (let field of input.fieldRow) {
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
}

export const COMMON_PARENT_TOOLTIP_EXTENSION = function() {
	// this refers to the block that the extension is being run on, we need
	// to cache it so that it can be used inside the tooltip function.
	var thisBlock = this;
	this.setTooltip(function() {
		var parent = thisBlock.getParent();
		return (parent && parent.getInputsInline() && parent.tooltip) ||
			Blockly.utils.replaceMessageReferences("%{BKY_" + thisBlock.type.toUpperCase() + "_TOOLTIP}");
	});
}

export const COMMON_TYPE_EXTENSION = function() {

}

export const VARIABLE_SCOPE_EXTENSION = function() {
	this.varScope = true;
}

export const CONTROLS_IF_TOOLTIP_EXTENSION = function() {
	this.setTooltip(function() {
		if (!this.elseifCount_ && !this.elseCount_) {
			return Blockly.Msg['CONTROLS_IF_TOOLTIP_1'];
		} else if (!this.elseifCount_ && this.elseCount_) {
			return Blockly.Msg['CONTROLS_IF_TOOLTIP_2'];
		} else if (this.elseifCount_ && !this.elseCount_) {
			return Blockly.Msg['CONTROLS_IF_TOOLTIP_3'];
		} else if (this.elseifCount_ && this.elseCount_) {
			return Blockly.Msg['CONTROLS_IF_TOOLTIP_4'];
		}
		return '';
	}.bind(this));
};

export const IS_DIVISIBLE_MUTATOR_EXTENSION = function() {
	this.getField('PROPERTY').setValidator(function(option: string) {
		var divisorInput = (option == 'DIVISIBLE_BY');
		this.getSourceBlock().updateShape_(divisorInput);
	});
};

export const TEXT_QUOTES_EXTENSION = function() {
	this.mixin(NepoMix.QUOTE_IMAGE_MIXIN);
	this.quoteField_('TEXT');
};

export const TEXT_JOIN_EXTENSION = function() {
	this.mixin(NepoMix.QUOTE_IMAGE_MIXIN);
};

export const TEXT_COMMENTS_EXTENSION = function() {
	this.mixin(NepoMix.COMMENTS_IMAGE_MIXIN);
	this.commentField_('TEXT');
};

export const TEXT_COMMENTS_VALIDATOR = function() {
	this.getField('TEXT').setValidator(function(content: string) {
		if (content && content.match(/[<>\$]/)) {
			return null;
		}
		return content;
	});
};

export const VARIABLE_EXTENSION = function() {
	this.mixin(NepoMix.VARIABLE_MIXIN);
}

export const VARIABLE_DECLARATION_EXTENSION = function() {
	this.previousConnection.setCheck("declaration_only");
	this.setMovable(false);
	let name: string;
	this.scopeId_ = this.id;
	this.varType_ = "LOCAL";
	name = Variables.getUniqueName(this, [], Blockly.Msg["VARIABLES_LOCAL_DEFAULT_NAME"]);
	this.variable_ = this.workspace.createVariable(name, "Number", this.id);
	this.varDecl = true;
	this.dataType_ = "Number";
	this.setNextStatement(false, "declaration_only");
	this.next_ = false;
	this.getField("VAR").setValue(name);
	this.getField("VAR").setValidator(VARIABLE_DECLARATION_VALIDATOR);
	(Blockly.FieldDropdown as any).validateOptions_(Nepo.dropdownTypes);
	this.getField("DATATYPE").menuGenerator_ = Nepo.dropdownTypes;
	this.getField("DATATYPE").setValidator(function(option: string) {
		if (option && option !== this.sourceBlock_.getFieldValue('DATATYPE')) {
			this.sourceBlock_.updateDataType(option);
		}
	});
	this.getField("DATATYPE").doValueUpdate_(Nepo.dropdownTypes[0][1]);
}

export const INTERNAL_VARIABLE_DECLARATION_EXTENSION = function() {
	this.mixin(NepoMix.INTERNAL_VARIABLE_DECLARATION_MIXIN, true);
	this.varScope = true;
	this.scopeId_ = this.id;
	this.varType_ = "LOOP";
	this.varDecl = true;
	this.internalVarDecl = true;
	this.scopeId_ = this.id;
	this.varType_ = "LOCAL";
	(this.getField("VAR") as Blockly.FieldTextInput).setEditorValue_(Blockly.Msg["VARIABLES_LOOP_DEFAULT_NAME"]);
	this.getField("VAR").setValidator(VARIABLE_DECLARATION_VALIDATOR);
}

const VARIABLE_DECLARATION_VALIDATOR = function(newName: string) {
	if (newName === this.value_) {
		return newName;
	}
	let thisBlock = this.getSourceBlock();
	let scopeVars = [];
	let scopeBlock = thisBlock.workspace.getBlockById((thisBlock as any).getScopeId());
	if (scopeBlock) {
		if (scopeBlock.type.indexOf("start") >= 0) {
			scopeVars = Variables.getUniqueVariables(scopeBlock.workspace);
		} else {
			scopeVars = Variables.getVarScopeList(scopeBlock);
		}
	}
	let name = Variables.getUniqueName(thisBlock, scopeVars, newName);
	let varId = thisBlock.variable_ && thisBlock.variable_.getId();
	if (varId) {
		thisBlock.workspace.renameVariableById(varId, name);
	} else {
		thisBlock.workspace.createVariable(name);
	}
	return name;
}
