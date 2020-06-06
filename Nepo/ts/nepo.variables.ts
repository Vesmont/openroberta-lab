import * as Blockly from "blockly";
import { Log } from "utils/nepo.logger";

const LOG = new Log();

export function nepoVariablesFlyoutCallback(workspace: Blockly.Workspace): Array<string> {
	let variableModelList: Array<Blockly.VariableModel> = getUniqueVariables(workspace);
	var xmlList = [];
	if (variableModelList.length > 0) {
		if (Blockly.Blocks['nepo_variables_set']) {
			variableModelList.forEach(
				variable => {
					var block = (Blockly.utils as any).xml.createElement('block');
					block.setAttribute('type', 'nepo_variables_set');
					block.setAttribute('gap', 8);
					block.setAttribute('id', variable.getId());
					block.appendChild(Blockly.Variables.generateVariableFieldDom(variable));
					xmlList.push(block);
				}
			)
		}
		if (Blockly.Blocks['nepo_variables_get']) {
			variableModelList.forEach(
				variable => {
					var block = (Blockly.utils as any).xml.createElement('block');
					block.setAttribute('type', 'nepo_variables_get');
					block.setAttribute('gap', 8);
					block.appendChild(Blockly.Variables.generateVariableFieldDom(variable));
					xmlList.push(block);
				}
			)
		};
	}
	return xmlList;
}

/**
 * Should be called whenever a scope block has been moved to check if the variable names are still valid. If
 * not, the variables (and fields) are renamed. 
 * @param {!Blockly.Block} scopeBlock Block of the scope.
 */
export function checkScope(scopeBlock: Blockly.Block) {
	let scopeVars = getVarScopeList(scopeBlock);
	
	let succDeclBlocks: Array<Blockly.Block> = getSuccDeclList(scopeBlock);
	succDeclBlocks.forEach(block => {
		if (!isUniqueName(block, scopeVars)) {
			setUniqueName(block, scopeVars);
		}
	});
}

/**
 * Finds all variables unique by name and returns them. For variables with same names only the first instance found 
 * will be considered. 
 * @param {!Blockly.Workspace} workspace Workspace of the global variables.
 * @return {!Array.<!Blockly.VariableModel>} All variables unique by name or null if no variables are declared.
 */
export function getUniqueVariables(workspace: Blockly.Workspace): Array<Blockly.VariableModel> {
	let prev: Blockly.VariableModel;
	let uniqueList: Array<Blockly.VariableModel> = [];
	workspace.getAllVariables().sort(Blockly.VariableModel.compareByName).forEach((variable: Blockly.VariableModel) => {
		if (!prev || variable.name !== prev.name) {
			uniqueList.push(variable);
		}
		prev = variable;
	})
	return uniqueList;
}

export function setUniqueName(thisBlock: Blockly.Block, scopeList: Array<Blockly.VariableModel>, opt_name?: string) {
	let newName = getUniqueName(thisBlock, scopeList, opt_name);
	thisBlock.workspace.renameVariableById(thisBlock.id, newName);
	thisBlock.getField("VAR").value_ = newName;
	(thisBlock.getField("VAR") as any).setEditorValue_(newName);
	thisBlock.getField("VAR").forceRerender();
	LOG.info("setUniqueName", newName);
}

export function getUniqueName(thisBlock: Blockly.Block, scopeList: Array<Blockly.VariableModel>, opt_name?: string) {
	let name = opt_name || (thisBlock.getField("VAR") && thisBlock.getField("VAR").getValue());
	let names: Array<string> = scopeList.map(variable => {
		if (variable.getId() !== thisBlock.id) {
			return variable.name;
		}
	});

	let newName = name;
	while (newName && names.indexOf(newName) >= 0) {
		var r = newName.match(/^(.*?)(\d+)$/);
		if (!r) {
			r = newName.match(/^[a-zA-Z]{1}$/);
			if (!r) {
				newName += '2';
			} else {
				// special case variable names in loops, e.g. i,j ...
				newName = Blockly.Variables.generateUniqueName(thisBlock.workspace);
			}
		} else {
			newName = r[1] + (parseInt(r[2], 10) + 1);
		}
	}
	LOG.info("getUniqueName", newName);
	return newName;
}

export function isUniqueName(thisBlock: Blockly.Block, scopeList: Array<Blockly.VariableModel>): boolean {
	let name = thisBlock.getField("VAR") && thisBlock.getField("VAR").getValue();
	for (let variable of Object.values(scopeList)) {
		if (variable.getId() !== thisBlock.id && variable.name === name) {
			return false;
		}
	}
	return true;
};

export function getVariablesByName(workspace: Blockly.Workspace, name: string): Array<Blockly.VariableModel> {
	return workspace.getAllVariables().
		filter(variable => variable.name === name);
}

/**
 * Finds all variables of this blocks' scope. Including global variables and variables of the same scope level.
 * @param {!Blockly.Block} scopeBlock Block of the scope.
 * @return {!Array.<!Blockly.VariableModel>} The variables of the scope.
 */
export function getVarScopeList(scopeBlock: Blockly.Block): Array<Blockly.VariableModel> {
	let surrScopeVars = getSurrScopeList(scopeBlock);
	let succScopeVars = getSuccVarList(scopeBlock);
	let varScopeList = surrScopeVars.concat(succScopeVars);
	LOG.info("scope variables", varScopeList);
	return varScopeList;
}

export function getSurrScopeList(scopeBlock: Blockly.Block): Array<Blockly.VariableModel> {
	let scopeVars = getGlobalVars(scopeBlock.workspace);
	let surroundParent: Blockly.Block = scopeBlock;
	while (!!surroundParent) {
		if ((surroundParent as any).varScope) {
			let declBlock = surroundParent.getFirstStatementConnection() &&
				surroundParent.getFirstStatementConnection().targetBlock();
			// special case internal variable declarations, e.g. in loops
			if ((surroundParent as any).internalVarDecl) {
				declBlock = surroundParent;
			}
			while (declBlock) {
				if ((declBlock as any).varDecl) {
					scopeVars.push((declBlock as any).getVariable());

				}
				declBlock = (declBlock as any).getNextBlock();
			}
		}
		surroundParent = surroundParent.getSurroundParent();
	}
	return scopeVars;
}

function getSuccVarList(thisBlock: Blockly.Block): Array<Blockly.VariableModel> {
	return getSuccDeclList(thisBlock).map(block => (block as any).variable_);
}

function getSuccDeclList(thisBlock: Blockly.Block): Array<Blockly.Block> {
	let firstDeclBlock: Blockly.Block;
	let list = [];
	if (thisBlock.getInput("DECL")) {
		firstDeclBlock = thisBlock.getInput("DECL").connection && thisBlock.getInput("DECL").connection.targetBlock();
		list = firstDeclBlock ? firstDeclBlock.getDescendants(true) : [];
		let firstDoBlock = thisBlock.getInput("DO") && thisBlock.getInput("DO").connection && thisBlock.getInput("DO").connection.targetBlock();
		list = list.concat(firstDoBlock ? firstDoBlock.getDescendants(true) : []);
	} else if ((thisBlock as any).internalVarDecl) {
		// special case internal variable declarations, e.g. in loops
		list = [thisBlock];
		let firstBlock = thisBlock.getFirstStatementConnection() && thisBlock.getFirstStatementConnection().targetBlock();
		if (firstBlock) {
			list = list.concat(firstBlock.getDescendants(true));
		}
	}
	return list && list.filter(block => (block as any).varDecl);
}

/**
 * Finds all global variables and returns them.
 * @param {!Blockly.Workspace} workspace Workspace of the global variables.
 * @return {!Array.<!Blockly.VariableModel>} The global variables or null, if none are declared.
 */
function getGlobalVars(workspace: Blockly.Workspace): Array<Blockly.VariableModel> {
	let startBlocks: Array<Blockly.Block> = workspace.getTopBlocks(false).filter(block => block.type.indexOf("start") >= 0);
	let globalVars = [];
	if (startBlocks.length >= 1) {
		let declBlock = startBlocks[0].getFirstStatementConnection() &&
			startBlocks[0].getFirstStatementConnection().targetBlock();
		while (declBlock) {
			if ((declBlock as any).varDecl) {
				globalVars.push((declBlock as any).getVariable());
			}
			declBlock = declBlock && (declBlock as any).getNextBlock();
		}
	}
	LOG.info("global variables", globalVars)
	return globalVars;
}

export function setStyle(thisBlock: Blockly.Block, varType: string) {
	switch (varType) {
		case "GLOBAL":
			thisBlock.setStyle("start_blocks");
			break;
		case "LOCAL":
			thisBlock.setStyle("variable_blocks");
			break;
		case "LOOP":
			thisBlock.setStyle("control_blocks");
			break;
		case "PROC":
			thisBlock.setStyle("control_blocks");
			break;
		default:
			thisBlock.setStyle("variable_blocks");
	}
}

