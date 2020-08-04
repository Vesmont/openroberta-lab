import * as Blockly from "blockly";

export const checkMsgKey = function(msgKey) {
	if (msgKey) {
		console.warn('This message is not translated: ' + msgKey);
		return msgKey;
	} else {
		return "";
	}
}

export const getConfigPorts=function(actorName) {
	var ports = [];
	var container = Blockly.Workspace.getById("bricklyDiv");
	if (container) {
		var blocks = container.getAllBlocks(false);
		for (var x = 0; x < blocks.length; x++) {
			var func = (blocks[x] as any).getConfigDecl;
			if (func) {
				var config = func.call(blocks[x]);
				if (config.type === actorName) {
					ports.push([config.name, config.name]);
				}
			}
		}
	}

	if (ports.length === 0) {
		ports.push([Blockly["Msg"]["CONFIGURATION_NO_PORT"] || checkMsgKey('CONFIGURATION_NO_PORT'),
		(Blockly["Msg"]["CONFIGURATION_NO_PORT"] || checkMsgKey('CONFIGURATION_NO_PORT')).toUpperCase()]);
	}
	return new Blockly.FieldDropdown(ports);
};