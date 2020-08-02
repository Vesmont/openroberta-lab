import * as Blockly from "blockly";
import { MutatorPlus } from "nepo.mutator.plus";
import { MutatorMinus } from "nepo.mutator.minus";
import * as Variables from "nepo.variables";
import { Log } from "utils/nepo.logger";

const LOG = new Log();

(Blockly as any).Msg.check = function(key) {
	return Blockly.Msg[key] || key;
};

(Blockly.Extensions as any).registerMutators = function(name: string, mutator: string, mixinObj: object, opt_helperFn: Function) {
	var errorPrefix = 'Error when registering mutator "' + name + '": ';

	// Sanity check the mixin object before registering it.
	(Blockly.Extensions as any).checkHasFunction_(
		errorPrefix, mixinObj["domToMutation"], 'domToMutation');
	(Blockly.Extensions as any).checkHasFunction_(
		errorPrefix, mixinObj["mutationToDom"], 'mutationToDom');

	let hasMutator: boolean = mutator != undefined && (mutator == "mutatorPlus" || mutator == "mutatorMinus");

	if (opt_helperFn && (typeof opt_helperFn != 'function')) {
		throw Error('Extension "' + name + '" is not a function');
	}
	// Sanity checks passed.
	(Blockly.Extensions as any).register(name, function() {
		if (hasMutator) {
			if (!MutatorPlus || !MutatorMinus) {
				throw Error(errorPrefix + 'Missing require for Blockly.Mutator');
			}
			if (mutator === "mutatorPlus") {
				this.setMutator(new MutatorPlus());
			} else if (mutator === "mutatorMinus") {
				this.setMutator(new MutatorMinus());
				this.setNextStatement(false);
			}
		}

		// Mixin the object.
		this.mixin(mixinObj, true);

		if (opt_helperFn) {
			opt_helperFn.apply(this);
		}
	});
};
// overriding
(Blockly.Extensions as any).apply = function(name, block, isMutator) {
	var extensionFn = (Blockly.Extensions as any).ALL_[name];
	if (typeof extensionFn != 'function') {
		return;//throw Error('Error: Extension "' + name + '" not found.');
	}
	if (isMutator) {
		// Fail early if the block already has mutation properties.
		(Blockly.Extensions as any).checkNoMutatorProperties_(name, block);
	}
	extensionFn.apply(block);

	if (isMutator) {
		var errorPrefix = 'Error after applying mutator "' + name + '": ';
		(Blockly.Extensions as any).checkBlockHasMutatorProperties_(errorPrefix, block);
	}
};

// overriding
/**
* Give this block a mutator.
* @param {Blockly.Mutator} mutator A mutator instance or null to remove.
*/
(Blockly.BlockSvg as any).prototype.setMutator = function(mutator: Blockly.Mutator) {
	if (this.mutatorPlus && mutator instanceof MutatorPlus && this.mutatorPlus != mutator) {
		this.mutatorPlus.dispose();
	}
	if (this.mutatorMinus && mutator instanceof MutatorMinus && this.mutatorMinus != mutator) {
		this.mutatorMinus.dispose();
	}
	if (mutator) {
		mutator.setBlock(this);
		if (mutator instanceof MutatorPlus) {
			this.mutatorPlus = mutator;
		} else if (mutator instanceof MutatorMinus) {
			this.mutatorMinus = mutator;
		}
		mutator.createIcon();
	}
	if (this.rendered) {
		this.render();
		// Adding or removing a mutator icon will cause the block to change shape.
		this.bumpNeighbours();
	}
};

// overriding
Blockly.BlockSvg.prototype.getIcons = function() {
	var icons = [];
	if (this.mutatorPlus) {
		icons.push(this.mutatorPlus);
	}
	if (this.mutatorMinus) {
		icons.push(this.mutatorMinus);
	}
	if (this.commentIcon_) {
		icons.push(this.commentIcon_);
	}
	if (this.warning) {
		icons.push(this.warning);
	}
	return icons;
};

// override
Blockly.FieldVariable.dropdownCreate = function() {
	if (!this.variable_) {
		throw Error('Tried to call dropdownCreate on a variable field with no' +
			' variable selected.');
	}
	let variableModelList = [];
	if (this.sourceBlock_ && this.sourceBlock_.workspace) {
		variableModelList = Variables.getUniqueVariables(this.sourceBlock_.workspace);
	}
	var options = [];
	variableModelList.forEach(variable =>
		options.push([variable.name, variable.getId()]));
	return options;
}
Blockly.VariableMap.prototype.renameVariable = function(variable, newName) {
	//var type = variable.type;
	var conflictVar = null; // TODO if this is ok for all cases //this.getVariable(newName, type);
	var blocks = this.workspace.getAllBlocks(false);
	Blockly.Events.setGroup(true);
	try {
		// The IDs may match if the rename is a simple case change (name1 -> Name1).
		if (!conflictVar || conflictVar.getId() == variable.getId()) {
			this.renameVariableAndUses_(variable, newName, blocks);
		} else {
			this.renameVariableWithConflict_(variable, newName, conflictVar, blocks);
		}
	} finally {
		Blockly.Events.setGroup(false);
	}
};

//override
Blockly.VariableMap.prototype.createVariable = function(name, opt_type, opt_id) {
	var variable = this.getVariable(name, opt_type);
	if (variable) {
		if (opt_id && variable.getId() != opt_id) {
			// this is ok and may happen in different scopes
		} else {
			// The variable already exists and has the same ID.
			return variable;
		}
	}
	if (opt_id && this.getVariableById(opt_id)) {
		throw Error('Variable id, "' + opt_id + '", is already in use.');
	}
	var id = opt_id || Blockly.utils.genUid();
	var type = opt_type || '';
	variable = new Blockly.VariableModel(this.workspace, name, type, id);
	var variables = this.variableMap_[type] || [];
	variables.push(variable);
	// Delete the list of variables of this type, and re-add it so that
	// the most recent addition is at the end.
	// This is used so the toolbox's set block is set to the most recent variable.
	delete this.variableMap_[type];
	this.variableMap_[type] = variables;
	LOG.warn("create variable", variable.getId(), variable.name);
	return variable;
};

Blockly.FieldVariable.prototype.doClassValidation_ = function(opt_newValue) {
	if (opt_newValue === null) {
		return null;
	}
	var newId = /** @type {string} */ (opt_newValue);
	var variable = Blockly.Variables.getVariable(
		this.sourceBlock_.workspace, newId);
	if (!variable) {
		console.warn('Variable id doesn\'t point to a real variable! ' +
			'ID was ' + newId);
		return null;
	}
	// Type Checks. Not wanted for Nepo
	return newId;
};

Blockly.WorkspaceSvg.prototype.createVariable = function(name,
	opt_type, opt_id) {
	var newVar = (Blockly.WorkspaceSvg as any).superClass_.createVariable.call(
		this, name, opt_type, opt_id);
	//this.refreshToolboxSelection(); // for nepo this is not used!
	return newVar;
};

Blockly.FieldVariable.prototype.fromXml = function(fieldElement) {
	var id = fieldElement.getAttribute('id');
	var variableName = fieldElement.textContent;
	// 'variabletype' should be lowercase, but until July 2019 it was sometimes
	// recorded as 'variableType'.  Thus we need to check for both.
	var variableType = fieldElement.getAttribute('variabletype') ||
		fieldElement.getAttribute('variableType') || '';

	var variable = Blockly.Variables.getOrCreateVariablePackage(
		this.sourceBlock_.workspace, id, variableName, variableType);

	// This should never happen :)
	if (variableType != null && variableType !== variable.type) {
		throw Error('Serialized variable type with id \'' +
			variable.getId() + '\' had type ' + variable.type + ', and ' +
			'does not match variable field that references it: ' +
			Blockly.Xml.domToText(fieldElement) + '.');
	}
	// Nepo allows sometimes multiple Datatypes
	this.sourceBlock_.updateDataType(null);
	this.setValue(variable.getId());
};
