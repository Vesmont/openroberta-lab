import * as Blockly from "blockly";
import { Log } from "utils/nepo.logger";

const LOG = new Log();
const IDENT = window.location.pathname;

export class VariableModel {
	workspace: Blockly.Workspace;
	varId: string;
	scopeId: string;
	varName: string;
	dataType: any;

	constructor(workspace: Blockly.Workspace, scopeId: string, varId: string, varName: string, dataType: any) {
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
	addToScopeList(scopeId) {
		(this.workspace as any).addVariable(scopeId, this);
	}
	setName(newName) {
		this.varName = newName;
	}
	getId() {
		return this.varId;
	}
	getName() {
		return this.varName;
	}
	getScopeId() {
		return this.scopeId;
	}
	getDataType() {
		return this.dataType;
	}
};