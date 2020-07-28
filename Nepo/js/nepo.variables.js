define(["require", "exports", "blockly", "utils/nepo.logger"], function (require, exports, Blockly, nepo_logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setStyle = exports.getSurrScopeList = exports.getVarScopeList = exports.getVariablesByName = exports.isUniqueName = exports.getUniqueName = exports.setUniqueName = exports.getUniqueVariables = exports.checkScope = exports.flyoutCallback = void 0;
    var LOG = new nepo_logger_1.Log();
    function flyoutCallback(workspace) {
        // add the new scope block always on top:
        // <block type="variable_scope" > </block>
        var xmlList = [];
        var scope = Blockly.utils.xml.createElement("block");
        scope.setAttribute("type", "variable_scope");
        scope.setAttribute("gap", 16);
        xmlList.push(scope);
        var variableModelList = getUniqueVariables(workspace);
        if (variableModelList.length > 0) {
            variableModelList.forEach(function (variable) {
                if (Blockly.Blocks["nepo_variables_set"]) {
                    var block = Blockly.utils.xml.createElement("block");
                    block.setAttribute("type", "nepo_variables_set");
                    block.setAttribute("gap", 8);
                    block.setAttribute("id", variable.getId());
                    block.appendChild(Blockly.Variables.generateVariableFieldDom(variable));
                    xmlList.push(block);
                }
                if (Blockly.Blocks["nepo_variables_get"]) {
                    var block = Blockly.utils.xml.createElement("block");
                    block.setAttribute("type", "nepo_variables_get");
                    block.setAttribute("gap", 16);
                    block.appendChild(Blockly.Variables.generateVariableFieldDom(variable));
                    xmlList.push(block);
                }
            });
        }
        ;
        return xmlList;
    }
    exports.flyoutCallback = flyoutCallback;
    /**
     * Should be called whenever a scope block has been moved to check if the variable names are still valid. If
     * not, the variables (and fields) are renamed.
     * @param {!Blockly.Block} scopeBlock Block of the scope.
     */
    function checkScope(scopeBlock) {
        var scopeVars = getVarScopeList(scopeBlock);
        var succDeclBlocks = getSuccDeclList(scopeBlock);
        succDeclBlocks.forEach(function (block) {
            if (!isUniqueName(block, scopeVars)) {
                setUniqueName(block, scopeVars);
            }
        });
    }
    exports.checkScope = checkScope;
    /**
     * Finds all variables unique by name and returns them. For variables with same names only the first instance found
     * will be considered.
     * @param {!Blockly.Workspace} workspace Workspace of the global variables.
     * @return {!Array.<!Blockly.VariableModel>} All variables unique by name or null if no variables are declared.
     */
    function getUniqueVariables(workspace) {
        var prev;
        var uniqueList = [];
        workspace.getAllVariables().sort(Blockly.VariableModel.compareByName).forEach(function (variable) {
            if (!prev || variable.name !== prev.name) {
                uniqueList.push(variable);
            }
            prev = variable;
        });
        return uniqueList;
    }
    exports.getUniqueVariables = getUniqueVariables;
    function setUniqueName(thisBlock, scopeList, opt_name) {
        var newName = getUniqueName(thisBlock, scopeList, opt_name);
        thisBlock.workspace.renameVariableById(thisBlock.id, newName);
        thisBlock.getField("VAR").value_ = newName;
        thisBlock.getField("VAR").setEditorValue_(newName);
        thisBlock.getField("VAR").forceRerender();
        LOG.info("setUniqueName", newName);
    }
    exports.setUniqueName = setUniqueName;
    function getUniqueName(thisBlock, scopeList, opt_name) {
        var name = opt_name || (thisBlock.getField("VAR") && thisBlock.getField("VAR").getValue());
        var names = scopeList.filter(function (variable) {
            if (variable.getId() !== thisBlock.id) {
                return variable;
            }
        }).map(function (variableModel) { return variableModel.name; });
        var newName = name;
        while (newName && names.indexOf(newName) >= 0) {
            var r = newName.match(/^(.*?)(\d+)$/);
            if (!r) {
                r = newName.match(/^[a-zA-Z]{1}$/);
                if (!r) {
                    newName += "2";
                }
                else {
                    // special case variable names in loops, e.g. i,j ...
                    newName = Blockly.Variables.generateUniqueName(thisBlock.workspace);
                }
            }
            else {
                newName = r[1] + (parseInt(r[2], 10) + 1);
            }
        }
        LOG.info("getUniqueName", newName);
        return newName;
    }
    exports.getUniqueName = getUniqueName;
    function isUniqueName(thisBlock, scopeList) {
        var name = thisBlock.getField("VAR") && thisBlock.getField("VAR").getValue();
        for (var _i = 0, _a = Object.values(scopeList); _i < _a.length; _i++) {
            var variable = _a[_i];
            if (variable.getId() !== thisBlock.id && variable.name === name) {
                return false;
            }
        }
        return true;
    }
    exports.isUniqueName = isUniqueName;
    ;
    function getVariablesByName(workspace, name) {
        return workspace.getAllVariables().
            filter(function (variable) { return variable.name === name; });
    }
    exports.getVariablesByName = getVariablesByName;
    /**
     * Finds all variables of this blocks' scope. Including global variables and variables of the same scope level.
     * @param {!Blockly.Block} scopeBlock Block of the scope.
     * @return {!Array.<!Blockly.VariableModel>} The variables of the scope.
     */
    function getVarScopeList(scopeBlock) {
        var surrScopeVars = getSurrScopeList(scopeBlock);
        var succScopeVars = getSuccVarList(scopeBlock);
        var varScopeList = surrScopeVars.concat(succScopeVars);
        LOG.info("scope variables", varScopeList);
        return varScopeList;
    }
    exports.getVarScopeList = getVarScopeList;
    function getSurrScopeList(scopeBlock) {
        var scopeVars = getGlobalVars(scopeBlock.workspace);
        var surroundParent = scopeBlock;
        while (!!surroundParent) {
            if (surroundParent.varScope) {
                var declBlock = surroundParent.getFirstStatementConnection() &&
                    surroundParent.getFirstStatementConnection().targetBlock();
                // special case internal variable declarations, e.g. in loops
                if (surroundParent.internalVarDecl) {
                    declBlock = surroundParent;
                }
                while (declBlock) {
                    if (declBlock.varDecl) {
                        scopeVars.push(declBlock.variable_);
                    }
                    declBlock = declBlock.getNextBlock();
                }
            }
            surroundParent = surroundParent.getSurroundParent();
        }
        return scopeVars;
    }
    exports.getSurrScopeList = getSurrScopeList;
    function getSuccVarList(thisBlock) {
        return getSuccDeclList(thisBlock).map(function (block) { return block.variable_; });
    }
    function getSuccDeclList(thisBlock) {
        var firstDeclBlock;
        var list = [];
        if (thisBlock.getInput("DECL")) {
            firstDeclBlock = thisBlock.getInput("DECL").connection && thisBlock.getInput("DECL").connection.targetBlock();
            list = firstDeclBlock ? firstDeclBlock.getDescendants(true) : [];
            var firstDoBlock = thisBlock.getInput("DO") && thisBlock.getInput("DO").connection && thisBlock.getInput("DO").connection.targetBlock();
            list = list.concat(firstDoBlock ? firstDoBlock.getDescendants(true) : []);
        }
        else if (thisBlock.internalVarDecl) {
            // special case internal variable declarations, e.g. in loops
            list = [thisBlock];
            var firstBlock = thisBlock.getFirstStatementConnection() && thisBlock.getFirstStatementConnection().targetBlock();
            if (firstBlock) {
                list = list.concat(firstBlock.getDescendants(true));
            }
        }
        return list && list.filter(function (block) { return block.varDecl; });
    }
    /**
     * Finds all global variables and returns them.
     * @param {!Blockly.Workspace} workspace Workspace of the global variables.
     * @return {!Array.<!Blockly.VariableModel>} The global variables or null, if none are declared.
     */
    function getGlobalVars(workspace) {
        var startBlocks = workspace.getTopBlocks(false).filter(function (block) { return block.type.indexOf("start") >= 0; });
        var globalVars = [];
        if (startBlocks.length >= 1) {
            var declBlock = startBlocks[0].getFirstStatementConnection() &&
                startBlocks[0].getFirstStatementConnection().targetBlock();
            while (declBlock) {
                if (declBlock.varDecl) {
                    globalVars.push(declBlock.variable_);
                }
                declBlock = declBlock && declBlock.getNextBlock();
            }
        }
        LOG.info("global variables", globalVars);
        return globalVars;
    }
    function setStyle(thisBlock, scopeType) {
        switch (scopeType) {
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
                thisBlock.setStyle("procedure_blocks");
                break;
            default:
                thisBlock.setStyle("variable_blocks");
        }
    }
    exports.setStyle = setStyle;
});
//# sourceMappingURL=nepo.variables.js.map