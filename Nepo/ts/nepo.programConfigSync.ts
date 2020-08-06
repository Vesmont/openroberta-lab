import * as Blockly from "blockly";
import { Log } from "utils/nepo.logger";
import * as U from "utils/util";

const LOG = new Log();
LOG;

declare var blocklyWorkspace;
declare var bricklyWorkspace;

/**
 * Find all instances of this configuration block and rename the values in the
 * dropdown.
 * 
 * @param {string}
 *            oldName Configuration title to rename.
 * @param {string}
 *            newName New configuration name.
 * @param {!Blockly.Workspace}
 *            workspace Workspace rename variables in.
 */
export function renameConfig(thatBlock, oldName, newName) {
    Blockly.Events.setGroup(true);
    var blocks = blocklyWorkspace.getAllBlocks(false);
    for (var x = 0; x < blocks.length; x++) {
        var block = blocks[x];
        if (!block.dependConfig) {
            continue;
        }
        var dependConfig;
        if (typeof block.dependConfig === "function") {
            dependConfig = block.dependConfig();
        } else {
            dependConfig = block.dependConfig;
        }
        if (thatBlock.type !== dependConfig.type) {
            continue;
        }

        var dropDown = dependConfig.dropDown;
        if (!Array.isArray(dropDown)) {
            dropDown = [dropDown];
        }
        for (var d = 0; d < dropDown.length; d++) {
            var index = -1;
            for (var i = 0; i < dropDown[d].menuGenerator_.length; i++) {
                if (dropDown[d].menuGenerator_[i][1] === thatBlock.getFieldValue('NAME')) {
                    index = i;
                    break;
                }
            }
            if (dropDown[d].menuGenerator_[0][0] == Blockly.Msg["CONFIGURATION_NO_PORT"]) {
                dropDown[d].menuGenerator_[0][0] = newName;
                dropDown[d].menuGenerator_[0][1] = newName;
                dropDown[d].setValue(newName);
            } else if (index >= 0) {
                dropDown[d].menuGenerator_[index][0] = newName;
                dropDown[d].menuGenerator_[index][1] = newName;
                if (dropDown[d].value_ === oldName) {
                    dropDown[d].setValue(newName);
                }
            } else {
                dropDown[d].menuGenerator_.push([newName, newName]);
                dropDown[d].arrow_.replaceChild(document.createTextNode(dropDown[d].sourceBlock_.RTL ? Blockly.FieldDropdown.ARROW_CHAR + ' ' : ' '
                    + Blockly.FieldDropdown.ARROW_CHAR), dropDown[d].arrow_.childNodes[0]);
                dropDown[d].render_();
            }
        }
        block.render();
    }
    Blockly.Events.setGroup(false);
};

export function disposeConfig(thisBlock) {
    Blockly.Events.setGroup(true);
    var blocks = blocklyWorkspace.getAllBlocks(false);
    for (var x = 0; x < blocks.length; x++) {
        var block = blocks[x];
        if (!block["dependConfig"]) {
            continue;
        }
        var dependConfig;
        if (typeof block["dependConfig"] === "function") {
            dependConfig = block["dependConfig"]();
        } else {
            dependConfig = block["dependConfig"];
        }
        if (thisBlock.type !== dependConfig.type) {
            continue;
        }
        var dropDown = dependConfig.dropDown;
        if (!Array.isArray(dropDown)) {
            dropDown = [dropDown];
        }
        for (var d = 0; d < dropDown.length; d++) {
            var index = -1;
            for (var i = 0; i < dropDown[d].menuGenerator_.length; i++) {
                if (dropDown[d].menuGenerator_[i][1] === thisBlock.getFieldValue('NAME')) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                dropDown[d].menuGenerator_.splice(index, 1);
                if (dropDown[d].menuGenerator_.length == 0) {
                    dropDown[d].menuGenerator_.push([Blockly.Msg["CONFIGURATION_NO_PORT"] || U.checkMsgKey('CONFIGURATION_NO_PORT'),
                    (Blockly.Msg["CONFIGURATION_NO_PORT"] || U.checkMsgKey('CONFIGURATION_NO_PORT')).toUpperCase()]);
                    dropDown[d].setValue((Blockly.Msg["CONFIGURATION_NO_PORT"] || U.checkMsgKey('CONFIGURATION_NO_PORT')).toUpperCase());
                } else if (dropDown[d].menuGenerator_.length == 1) {
                    dropDown[d].arrow_.replaceChild(document.createTextNode(''), dropDown[d].arrow_.childNodes[0]);
                    dropDown[d].render_();
                }
                if (dropDown[d].getValue() === thisBlock.getFieldValue('NAME')) {
                    dropDown[d].setValue(dropDown[d].menuGenerator_[0][1]);
                }
            }
        }
        (block as any).render();
    }
    Blockly.Events.setGroup(false);
}

/**
 * Ensure two identically-named configuration blocks don't exist.
 * 
 * @param {string}
 *            name Proposed variable name.
 * @param {!Blockly.Block}
 *            block Block to disambiguate.
 * @return {string} Non-colliding name.
 */
export function findLegalName(name, block) {
    // TODO: check for reserved words again
    // while (!isLegalName(name, block) || Blockly.Variables.isReservedName(name, block)) {
    while (!isLegalName(name, block)) {
        // Collision with another variable.
        var r = name.match(/^(.*?)(\d+)$/);
        if (!r) {
            name += '2';
        } else {
            name = r[1] + (parseInt(r[2], 10) + 1);
        }
    }
    return name;
};

function isLegalName(name, block) {
    var blocks = bricklyWorkspace.getAllBlocks(false);
    // Iterate through every block.
    for (var x = 0; x < blocks.length; x++) {
        if (blocks[x] == block) {
            continue;
        }
        var func = blocks[x]["getConfigDecl"];
        if (func) {
            var varName = func.call(blocks[x]);
            if (Blockly.Names.equals(name, varName.name)) {
                return false;
            }
        }
    }
    return true;
}

export function getConfigPorts(actorName) {
    var ports = [];
    if (bricklyWorkspace) {
        var blocks = bricklyWorkspace.getAllBlocks(false);
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
        ports.push([Blockly["Msg"]["CONFIGURATION_NO_PORT"] || U.checkMsgKey('CONFIGURATION_NO_PORT'),
        (Blockly["Msg"]["CONFIGURATION_NO_PORT"] || U.checkMsgKey('CONFIGURATION_NO_PORT')).toUpperCase()]);
    }
    let dropDown = new Blockly.FieldDropdown(ports);
    return dropDown;
};