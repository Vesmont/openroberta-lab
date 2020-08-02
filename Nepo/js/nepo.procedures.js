define(["require", "exports", "blockly", "nepo.mutator.plus", "utils/nepo.logger"], function (require, exports, Blockly, nepo_mutator_plus_1, nepo_logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LOG = new nepo_logger_1.Log();
    LOG;
    Blockly.Blocks['procedures_defnoreturn'] = {
        /**
         * Block for defining a procedure with no return value.
         * @this {Blockly.Block}
         */
        init: function () {
            var nameField = new Blockly.FieldTextInput('', Blockly.Procedures.rename);
            nameField.setSpellcheck(false);
            this.appendDummyInput()
                .appendField(Blockly.Msg['PROCEDURES_DEFNORETURN_TITLE'])
                .appendField(nameField, 'NAME')
                .appendField('', 'PARAMS');
            this.setMutator(new nepo_mutator_plus_1.MutatorPlus());
            if ((this.workspace.options.comments ||
                (this.workspace.options.parentWorkspace &&
                    this.workspace.options.parentWorkspace.options.comments)) &&
                Blockly.Msg['PROCEDURES_DEFNORETURN_COMMENT']) {
                this.setCommentText(Blockly.Msg['PROCEDURES_DEFNORETURN_COMMENT']);
            }
            this.setStyle('procedure_blocks');
            this.setTooltip(Blockly.Msg['PROCEDURES_DEFNORETURN_TOOLTIP']);
            this.setHelpUrl(Blockly.Msg['PROCEDURES_DEFNORETURN_HELPURL']);
            this.arguments_ = [];
            this.argumentVarModels_ = [];
            this.setStatements_(true);
            this.statementConnection_ = null;
        },
        /**
         * Add or remove the statement block from this function definition.
         * @param {boolean} hasStatements True if a statement block is needed.
         * @this {Blockly.Block}
         */
        setStatements_: function (hasStatements) {
            if (this.hasStatements_ === hasStatements) {
                return;
            }
            if (hasStatements) {
                this.appendStatementInput('STACK')
                    .appendField(Blockly.Msg['PROCEDURES_DEFNORETURN_DO']);
                if (this.getInput('RETURN')) {
                    this.moveInputBefore('STACK', 'RETURN');
                }
            }
            else {
                this.removeInput('STACK', true);
            }
            this.hasStatements_ = hasStatements;
        },
        /**
         * Update the display of parameters for this procedure definition block.
         * @private
         * @this {Blockly.Block}
         */
        updateParams_: function () {
            // Merge the arguments into a human-readable list.
            var paramString = '';
            if (this.arguments_.length) {
                paramString = Blockly.Msg['PROCEDURES_BEFORE_PARAMS'] +
                    ' ' + this.arguments_.join(', ');
            }
            // The params field is deterministic based on the mutation,
            // no need to fire a change event.
            Blockly.Events.disable();
            try {
                this.setFieldValue(paramString, 'PARAMS');
            }
            finally {
                Blockly.Events.enable();
            }
        },
        /**
         * Create XML to represent the argument inputs.
         * @param {boolean=} opt_paramIds If true include the IDs of the parameter
         *     quarks.  Used by Blockly.Procedures.mutateCallers for reconnection.
         * @return {!Element} XML storage element.
         * @this {Blockly.Block}
         */
        mutationToDom: function (opt_paramIds) {
            var container = Blockly.utils.xml.createElement('mutation');
            if (opt_paramIds) {
                container.setAttribute('name', this.getFieldValue('NAME'));
            }
            for (var i = 0; i < this.argumentVarModels_.length; i++) {
                var parameter = Blockly.utils.xml.createElement('arg');
                var argModel = this.argumentVarModels_[i];
                parameter.setAttribute('name', argModel.name);
                parameter.setAttribute('varid', argModel.getId());
                if (opt_paramIds && this.paramIds_) {
                    parameter.setAttribute('paramId', this.paramIds_[i]);
                }
                container.appendChild(parameter);
            }
            // Save whether the statement input is visible.
            if (!this.hasStatements_) {
                container.setAttribute('statements', 'false');
            }
            return container;
        },
        /**
         * Parse XML to restore the argument inputs.
         * @param {!Element} xmlElement XML storage element.
         * @this {Blockly.Block}
         */
        domToMutation: function (xmlElement) {
            this.arguments_ = [];
            this.argumentVarModels_ = [];
            for (var i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
                if (childNode.nodeName.toLowerCase() == 'arg') {
                    var varName = childNode.getAttribute('name');
                    var varId = childNode.getAttribute('varid') || childNode.getAttribute('varId');
                    this.arguments_.push(varName);
                    var variable = Blockly.Variables.getOrCreateVariablePackage(this.workspace, varId, varName, '');
                    if (variable != null) {
                        this.argumentVarModels_.push(variable);
                    }
                    else {
                        console.log('Failed to create a variable with name ' + varName + ', ignoring.');
                    }
                }
            }
            this.updateParams_();
            Blockly.Procedures.mutateCallers(this);
            // Show or hide the statement input.
            this.setStatements_(xmlElement.getAttribute('statements') !== 'false');
        },
        /**
         * Return the signature of this procedure definition.
         * @return {!Array} Tuple containing three elements:
         *     - the name of the defined procedure,
         *     - a list of all its arguments,
         *     - that it DOES NOT have a return value.
         * @this {Blockly.Block}
         */
        getProcedureDef: function () {
            return [this.getFieldValue('NAME'), this.arguments_, false];
        },
        /**
         * Return all variables referenced by this block.
         * @return {!Array.<string>} List of variable names.
         * @this {Blockly.Block}
         */
        getVars: function () {
            return this.arguments_;
        },
        /**
         * Return all variables referenced by this block.
         * @return {!Array.<!Blockly.VariableModel>} List of variable models.
         * @this {Blockly.Block}
         */
        getVarModels: function () {
            return this.argumentVarModels_;
        },
        /**
         * Notification that a variable is renaming.
         * If the ID matches one of this block's variables, rename it.
         * @param {string} oldId ID of variable to rename.
         * @param {string} newId ID of new variable.  May be the same as oldId, but
         *     with an updated name.  Guaranteed to be the same type as the old
         *     variable.
         * @override
         * @this {Blockly.Block}
         */
        renameVarById: function (oldId, newId) {
            var oldVariable = this.workspace.getVariableById(oldId);
            if (oldVariable.type != '') {
                // Procedure arguments always have the empty type.
                return;
            }
            var oldName = oldVariable.name;
            var newVar = this.workspace.getVariableById(newId);
            var change = false;
            for (var i = 0; i < this.argumentVarModels_.length; i++) {
                if (this.argumentVarModels_[i].getId() == oldId) {
                    this.arguments_[i] = newVar.name;
                    this.argumentVarModels_[i] = newVar;
                    change = true;
                }
            }
            if (change) {
                this.displayRenamedVar_(oldName, newVar.name);
                Blockly.Procedures.mutateCallers(this);
            }
        },
        /**
         * Notification that a variable is renaming but keeping the same ID.  If the
         * variable is in use on this block, rerender to show the new name.
         * @param {!Blockly.VariableModel} variable The variable being renamed.
         * @package
         * @override
         * @this {Blockly.Block}
         */
        updateVarName: function (variable) {
            var newName = variable.name;
            var change = false;
            for (var i = 0; i < this.argumentVarModels_.length; i++) {
                if (this.argumentVarModels_[i].getId() == variable.getId()) {
                    var oldName = this.arguments_[i];
                    this.arguments_[i] = newName;
                    change = true;
                }
            }
            if (change) {
                this.displayRenamedVar_(oldName, newName);
                Blockly.Procedures.mutateCallers(this);
            }
        },
        /**
         * Update the display to reflect a newly renamed argument.
         * @param {string} oldName The old display name of the argument.
         * @param {string} newName The new display name of the argument.
         * @private
         * @this {Blockly.Block}
         */
        displayRenamedVar_: function (oldName, newName) {
            this.updateParams_();
            // Update the mutator's variables if the mutator is open.
            if (this.mutator && this.mutator.isVisible()) {
                var blocks = this.mutator.workspace_.getAllBlocks(false);
                for (var i = 0, block; (block = blocks[i]); i++) {
                    if (block.type == 'procedures_mutatorarg' &&
                        Blockly.Names.equals(oldName, block.getFieldValue('NAME'))) {
                        block.setFieldValue(newName, 'NAME');
                    }
                }
            }
        },
        updateShape_: function (num) {
            if (!this.workspace.isDragging || this.workspace.isDragging() || this.workspace.isFlyout) {
                return;
            }
            if (num === 1) {
                Blockly.Events.setGroup(true);
                if (!this.declare_) {
                    var variableDeclareStatement = new Blockly.Input(Blockly.NEXT_STATEMENT, "DECL", this, this.makeConnection_(Blockly.NEXT_STATEMENT));
                    this.inputList.splice(1, 0, variableDeclareStatement);
                    // making sure only declarations can connect to the statement list
                    this.getInput("DECL").connection.setCheck('declaration_only');
                    this.declare_ = true;
                }
                var variableDeclare = this.workspace.newBlock('variable_declare');
                var scopeVars = Variables.getVarScopeList(this);
                var name_1;
                if (this.type.indexOf("start") >= 0) {
                    variableDeclare.setVarType("GLOBAL");
                    name_1 = Blockly.Msg["VARIABLES_GLOBAL_DEFAULT_NAME"];
                }
                else {
                    variableDeclare.setVarType("LOCAL");
                    name_1 = Blockly.Msg["VARIABLES_LOCAL_DEFAULT_NAME"];
                }
                Variables.setUniqueName(variableDeclare, scopeVars, name_1);
                variableDeclare.initSvg();
                variableDeclare.render();
                var connection = void 0;
                if (this.getInput("DECL").connection.targetConnection) {
                    var block = this.getInput("DECL").connection.targetConnection.sourceBlock_;
                    if (block) {
                        // look for the last variable declaration block in the sequence
                        while (block.getNextBlock()) {
                            block = block.getNextBlock();
                        }
                    }
                    block.setNextStatement(true, "declaration_only");
                    block.next_ = true;
                    connection = block.nextConnection;
                }
                else {
                    connection = this.getInput("DECL").connection;
                }
                connection.connect(variableDeclare.previousConnection);
                Variables.checkScope(this);
                Blockly.Events.setGroup(false);
            }
            else if (num == -1) {
                // if the last declaration in the stack has been removed, remove the declaration statement
                this.removeInput("DECL");
                this.declare_ = false;
            }
        },
        /**
         * Add custom menu (options as any) to this block's context menu.
         * @param {!Array} (options as any) List of menu (options as any) to add to.
         * @this {Blockly.Block}
         */
        customContextMenu: function (options) {
            if (this.isInFlyout) {
                return;
            }
            // Add option to create caller.
            var option = { enabled: true };
            var name = this.getFieldValue('NAME');
            option.text = Blockly.Msg['PROCEDURES_CREATE_DO'].replace('%1', name);
            var xmlMutation = Blockly.utils.xml.createElement('mutation');
            xmlMutation.setAttribute('name', name);
            for (var i = 0; i < this.arguments_.length; i++) {
                var xmlArg = Blockly.utils.xml.createElement('arg');
                xmlArg.setAttribute('name', this.arguments_[i]);
                xmlMutation.appendChild(xmlArg);
            }
            var xmlBlock = Blockly.utils.xml.createElement('block');
            xmlBlock.setAttribute('type', this.callType_);
            xmlBlock.appendChild(xmlMutation);
            option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
            options.push(option);
            // Add (options as any) to create getters for each parameter.
            if (!this.isCollapsed()) {
                for (var i = 0; i < this.argumentVarModels_.length; i++) {
                    var argOption = { enabled: true };
                    var argVar = this.argumentVarModels_[i];
                    argOption.text = Blockly.Msg['VARIABLES_SET_CREATE_GET']
                        .replace('%1', argVar.name);
                    var argXmlField = Blockly.Variables.generateVariableFieldDom(argVar);
                    var argXmlBlock = Blockly.utils.xml.createElement('block');
                    argXmlBlock.setAttribute('type', 'variables_get');
                    argXmlBlock.appendChild(argXmlField);
                    argOption.callback =
                        Blockly.ContextMenu.callbackFactory(this, argXmlBlock);
                    options.push(argOption);
                }
            }
        },
        callType_: 'procedures_callnoreturn'
    };
    Blockly.Blocks['procedures_defreturn'] = {
        /**
         * Block for defining a procedure with a return value.
         * @this {Blockly.Block}
         */
        init: function () {
            var nameField = new Blockly.FieldTextInput('', Blockly.Procedures.rename);
            nameField.setSpellcheck(false);
            this.appendDummyInput()
                .appendField(Blockly.Msg['PROCEDURES_DEFRETURN_TITLE'])
                .appendField(nameField, 'NAME')
                .appendField('', 'PARAMS');
            this.appendValueInput('RETURN')
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(Blockly.Msg['PROCEDURES_DEFRETURN_RETURN']);
            this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
            if ((this.workspace.options.comments ||
                (this.workspace.options.parentWorkspace &&
                    this.workspace.options.parentWorkspace.options.comments)) &&
                Blockly.Msg['PROCEDURES_DEFRETURN_COMMENT']) {
                this.setCommentText(Blockly.Msg['PROCEDURES_DEFRETURN_COMMENT']);
            }
            this.setStyle('procedure_blocks');
            this.setTooltip(Blockly.Msg['PROCEDURES_DEFRETURN_TOOLTIP']);
            this.setHelpUrl(Blockly.Msg['PROCEDURES_DEFRETURN_HELPURL']);
            this.arguments_ = [];
            this.argumentVarModels_ = [];
            this.setStatements_(true);
            this.statementConnection_ = null;
        },
        setStatements_: Blockly.Blocks['procedures_defnoreturn'].setStatements_,
        updateParams_: Blockly.Blocks['procedures_defnoreturn'].updateParams_,
        mutationToDom: Blockly.Blocks['procedures_defnoreturn'].mutationToDom,
        domToMutation: Blockly.Blocks['procedures_defnoreturn'].domToMutation,
        /**
         * Return the signature of this procedure definition.
         * @return {!Array} Tuple containing three elements:
         *     - the name of the defined procedure,
         *     - a list of all its arguments,
         *     - that it DOES have a return value.
         * @this {Blockly.Block}
         */
        getProcedureDef: function () {
            return [this.getFieldValue('NAME'), this.arguments_, true];
        },
        getVars: Blockly.Blocks['procedures_defnoreturn'].getVars,
        getVarModels: Blockly.Blocks['procedures_defnoreturn'].getVarModels,
        renameVarById: Blockly.Blocks['procedures_defnoreturn'].renameVarById,
        updateVarName: Blockly.Blocks['procedures_defnoreturn'].updateVarName,
        displayRenamedVar_: Blockly.Blocks['procedures_defnoreturn'].displayRenamedVar_,
        customContextMenu: Blockly.Blocks['procedures_defnoreturn'].customContextMenu,
        callType_: 'procedures_callreturn'
    };
    Blockly.Blocks['procedures_mutatorcontainer'] = {
        /**
         * Mutator block for procedure container.
         * @this {Blockly.Block}
         */
        init: function () {
            this.appendDummyInput()
                .appendField(Blockly.Msg['PROCEDURES_MUTATORCONTAINER_TITLE']);
            this.appendStatementInput('STACK');
            this.appendDummyInput('STATEMENT_INPUT')
                .appendField(Blockly.Msg['PROCEDURES_ALLOW_STATEMENTS'])
                .appendField(new Blockly.FieldCheckbox('TRUE'), 'STATEMENTS');
            this.setStyle('procedure_blocks');
            this.setTooltip(Blockly.Msg['PROCEDURES_MUTATORCONTAINER_TOOLTIP']);
            this.contextMenu = false;
        },
    };
    Blockly.Blocks['procedures_callnoreturn'] = {
        /**
         * Block for calling a procedure with no return value.
         * @this {Blockly.Block}
         */
        init: function () {
            this.appendDummyInput('TOPROW')
                .appendField(this.id, 'NAME');
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setStyle('procedure_blocks');
            // Tooltip is set in renameProcedure.
            this.setHelpUrl(Blockly.Msg['PROCEDURES_CALLNORETURN_HELPURL']);
            this.arguments_ = [];
            this.argumentVarModels_ = [];
            this.quarkConnections_ = {};
            this.quarkIds_ = null;
            this.previousEnabledState_ = true;
        },
        /**
         * Returns the name of the procedure this block calls.
         * @return {string} Procedure name.
         * @this {Blockly.Block}
         */
        getProcedureCall: function () {
            // The NAME field is guaranteed to exist, null will never be returned.
            return /** @type {string} */ (this.getFieldValue('NAME'));
        },
        /**
         * Notification that a procedure is renaming.
         * If the name matches this block's procedure, rename it.
         * @param {string} oldName Previous name of procedure.
         * @param {string} newName Renamed procedure.
         * @this {Blockly.Block}
         */
        renameProcedure: function (oldName, newName) {
            if (Blockly.Names.equals(oldName, this.getProcedureCall())) {
                this.setFieldValue(newName, 'NAME');
                var baseMsg = this.outputConnection ?
                    Blockly.Msg['PROCEDURES_CALLRETURN_TOOLTIP'] :
                    Blockly.Msg['PROCEDURES_CALLNORETURN_TOOLTIP'];
                this.setTooltip(baseMsg.replace('%1', newName));
            }
        },
        /**
         * Notification that the procedure's parameters have changed.
         * @param {!Array.<string>} paramNames New param names, e.g. ['x', 'y', 'z'].
         * @param {!Array.<string>} paramIds IDs of params (consistent for each
         *     parameter through the life of a mutator, regardless of param renaming),
         *     e.g. ['piua', 'f8b_', 'oi.o'].
         * @private
         * @this {Blockly.Block}
         */
        setProcedureParameters_: function (paramNames, paramIds) {
            // Data structures:
            // this.arguments = ['x', 'y']
            //     Existing param names.
            // this.quarkConnections_ {piua: null, f8b_: Blockly.Connection}
            //     Look-up of paramIds to connections plugged into the call block.
            // this.quarkIds_ = ['piua', 'f8b_']
            //     Existing param IDs.
            // Note that quarkConnections_ may include IDs that no longer exist, but
            // which might reappear if a param is reattached in the mutator.
            var defBlock = Blockly.Procedures.getDefinition(this.getProcedureCall(), this.workspace);
            var mutatorOpen = defBlock && defBlock.mutator &&
                defBlock.mutator.isVisible();
            if (!mutatorOpen) {
                this.quarkConnections_ = {};
                this.quarkIds_ = null;
            }
            if (!paramIds) {
                // Reset the quarks (a mutator is about to open).
                return;
            }
            // Test arguments (arrays of strings) for changes. '\n' is not a valid
            // argument name character, so it is a valid delimiter here.
            if (paramNames.join('\n') == this.arguments_.join('\n')) {
                // No change.
                this.quarkIds_ = paramIds;
                return;
            }
            if (paramIds.length != paramNames.length) {
                throw RangeError('paramNames and paramIds must be the same length.');
            }
            this.setCollapsed(false);
            if (!this.quarkIds_) {
                // Initialize tracking for this block.
                this.quarkConnections_ = {};
                this.quarkIds_ = [];
            }
            // Switch off rendering while the block is rebuilt.
            var savedRendered = this.rendered;
            this.rendered = false;
            // Update the quarkConnections_ with existing connections.
            for (var i = 0; i < this.arguments_.length; i++) {
                var input = this.getInput('ARG' + i);
                if (input) {
                    var connection = input.connection.targetConnection;
                    this.quarkConnections_[this.quarkIds_[i]] = connection;
                    if (mutatorOpen && connection &&
                        paramIds.indexOf(this.quarkIds_[i]) == -1) {
                        // This connection should no longer be attached to this block.
                        connection.disconnect();
                        connection.getSourceBlock().bumpNeighbours();
                    }
                }
            }
            // Rebuild the block's arguments.
            this.arguments_ = [].concat(paramNames);
            // And rebuild the argument model list.
            this.argumentVarModels_ = [];
            for (var i = 0; i < this.arguments_.length; i++) {
                var variable = Blockly.Variables.getOrCreateVariablePackage(this.workspace, null, this.arguments_[i], '');
                this.argumentVarModels_.push(variable);
            }
            this.updateShape_();
            this.quarkIds_ = paramIds;
            // Reconnect any child blocks.
            if (this.quarkIds_) {
                for (var i = 0; i < this.arguments_.length; i++) {
                    var quarkId = this.quarkIds_[i];
                    if (quarkId in this.quarkConnections_) {
                        var connection = this.quarkConnections_[quarkId];
                        if (!Blockly.Mutator.reconnect(connection, this, 'ARG' + i)) {
                            // Block no longer exists or has been attached elsewhere.
                            delete this.quarkConnections_[quarkId];
                        }
                    }
                }
            }
            // Restore rendering and show the changes.
            this.rendered = savedRendered;
            if (this.rendered) {
                this.render();
            }
        },
        /**
         * Modify this block to have the correct number of arguments.
         * @private
         * @this {Blockly.Block}
         */
        updateShape_: function () {
            for (var i = 0; i < this.arguments_.length; i++) {
                var field = this.getField('ARGNAME' + i);
                if (field) {
                    // Ensure argument name is up to date.
                    // The argument name field is deterministic based on the mutation,
                    // no need to fire a change event.
                    Blockly.Events.disable();
                    try {
                        field.setValue(this.arguments_[i]);
                    }
                    finally {
                        Blockly.Events.enable();
                    }
                }
                else {
                    // Add new input.
                    field = new Blockly.FieldLabel(this.arguments_[i]);
                    var input = this.appendValueInput('ARG' + i)
                        .setAlign(Blockly.ALIGN_RIGHT)
                        .appendField(field, 'ARGNAME' + i);
                    input.init();
                }
            }
            // Remove deleted inputs.
            while (this.getInput('ARG' + i)) {
                this.removeInput('ARG' + i);
                i++;
            }
            // Add 'with:' if there are parameters, remove otherwise.
            var topRow = this.getInput('TOPROW');
            if (topRow) {
                if (this.arguments_.length) {
                    if (!this.getField('WITH')) {
                        topRow.appendField(Blockly.Msg['PROCEDURES_CALL_BEFORE_PARAMS'], 'WITH');
                        topRow.init();
                    }
                }
                else {
                    if (this.getField('WITH')) {
                        topRow.removeField('WITH');
                    }
                }
            }
        },
        /**
         * Create XML to represent the (non-editable) name and arguments.
         * @return {!Element} XML storage element.
         * @this {Blockly.Block}
         */
        mutationToDom: function () {
            var container = Blockly.utils.xml.createElement('mutation');
            container.setAttribute('name', this.getProcedureCall());
            for (var i = 0; i < this.arguments_.length; i++) {
                var parameter = Blockly.utils.xml.createElement('arg');
                parameter.setAttribute('name', this.arguments_[i]);
                container.appendChild(parameter);
            }
            return container;
        },
        /**
         * Parse XML to restore the (non-editable) name and parameters.
         * @param {!Element} xmlElement XML storage element.
         * @this {Blockly.Block}
         */
        domToMutation: function (xmlElement) {
            var name = xmlElement.getAttribute('name');
            this.renameProcedure(this.getProcedureCall(), name);
            var args = [];
            var paramIds = [];
            for (var i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
                if (childNode.nodeName.toLowerCase() == 'arg') {
                    args.push(childNode.getAttribute('name'));
                    paramIds.push(childNode.getAttribute('paramId'));
                }
            }
            this.setProcedureParameters_(args, paramIds);
        },
        /**
         * Return all variables referenced by this block.
         * @return {!Array.<string>} List of variable names.
         * @this {Blockly.Block}
         */
        getVars: function () {
            return this.arguments_;
        },
        /**
         * Return all variables referenced by this block.
         * @return {!Array.<!Blockly.VariableModel>} List of variable models.
         * @this {Blockly.Block}
         */
        getVarModels: function () {
            return this.argumentVarModels_;
        },
        /**
         * Procedure calls cannot exist without the corresponding procedure
         * definition.  Enforce this link whenever an event is fired.
         * @param {!Blockly.Events.Abstract} event Change event.
         * @this {Blockly.Block}
         */
        onchange: function (event) {
            if (!this.workspace || this.workspace.isFlyout) {
                // Block is deleted or is in a flyout.
                return;
            }
            if (!event.recordUndo) {
                // Events not generated by user. Skip handling.
                return;
            }
            if (event.type == Blockly.Events.BLOCK_CREATE &&
                event.ids.indexOf(this.id) != -1) {
                // Look for the case where a procedure call was created (usually through
                // paste) and there is no matching definition.  In this case, create
                // an empty definition block with the correct signature.
                var name = this.getProcedureCall();
                var def = Blockly.Procedures.getDefinition(name, this.workspace);
                if (def && (def.type != this.defType_ ||
                    JSON.stringify(def.getVars()) != JSON.stringify(this.arguments_))) {
                    // The signatures don't match.
                    def = null;
                }
                if (!def) {
                    Blockly.Events.setGroup(event.group);
                    /**
                     * Create matching definition block.
                     * <xml xmlns="https://developers.google.com/blockly/xml">
                     *   <block type="procedures_defreturn" x="10" y="20">
                     *     <mutation name="test">
                     *       <arg name="x"></arg>
                     *     </mutation>
                     *     <field name="NAME">test</field>
                     *   </block>
                     * </xml>
                     */
                    var xml = Blockly.utils.xml.createElement('xml');
                    var block = Blockly.utils.xml.createElement('block');
                    block.setAttribute('type', this.defType_);
                    var xy = this.getRelativeToSurfaceXY();
                    var x = xy.x + Blockly.SNAP_RADIUS * (this.RTL ? -1 : 1);
                    var y = xy.y + Blockly.SNAP_RADIUS * 2;
                    block.setAttribute('x', x);
                    block.setAttribute('y', y);
                    var mutation = this.mutationToDom();
                    block.appendChild(mutation);
                    var field = Blockly.utils.xml.createElement('field');
                    field.setAttribute('name', 'NAME');
                    field.appendChild(Blockly.utils.xml.createTextNode(this.getProcedureCall()));
                    block.appendChild(field);
                    xml.appendChild(block);
                    Blockly.Xml.domToWorkspace(xml, this.workspace);
                    Blockly.Events.setGroup(false);
                }
            }
            else if (event.type == Blockly.Events.BLOCK_DELETE) {
                // Look for the case where a procedure definition has been deleted,
                // leaving this block (a procedure call) orphaned.  In this case, delete
                // the orphan.
                var name = this.getProcedureCall();
                var def = Blockly.Procedures.getDefinition(name, this.workspace);
                if (!def) {
                    Blockly.Events.setGroup(event.group);
                    this.dispose(true);
                    Blockly.Events.setGroup(false);
                }
            }
            else if (event.type == Blockly.Events.CHANGE && event.element == 'disabled') {
                var name = this.getProcedureCall();
                var def = Blockly.Procedures.getDefinition(name, this.workspace);
                if (def && def.id == event.blockId) {
                    // in most cases the old group should be ''
                    var oldGroup = Blockly.Events.getGroup();
                    if (oldGroup) {
                        // This should only be possible programmatically and may indicate a problem
                        // with event grouping. If you see this message please investigate. If the
                        // use ends up being valid we may need to reorder events in the undo stack.
                        console.log('Saw an existing group while responding to a definition change');
                    }
                    Blockly.Events.setGroup(event.group);
                    if (event.newValue) {
                        this.previousEnabledState_ = this.isEnabled();
                        this.setEnabled(false);
                    }
                    else {
                        this.setEnabled(this.previousEnabledState_);
                    }
                    Blockly.Events.setGroup(oldGroup);
                }
            }
        },
        /**
         * Add menu option to find the definition block for this call.
         * @param {!Array} (options as any) List of menu (options as any) to add to.
         * @this {Blockly.Block}
         */
        customContextMenu: function (options) {
            if (!this.workspace.isMovable()) {
                // If we center on the block and the workspace isn't movable we could
                // loose blocks at the edges of the workspace.
                return;
            }
            var option = { enabled: true };
            option.text = Blockly.Msg['PROCEDURES_HIGHLIGHT_DEF'];
            var name = this.getProcedureCall();
            var workspace = this.workspace;
            option.callback = function () {
                var def = Blockly.Procedures.getDefinition(name, workspace);
                if (def) {
                    workspace.centerOnBlock(def.id);
                    def.select();
                }
            };
            options.push(option);
        },
        defType_: 'procedures_defnoreturn'
    };
    Blockly.Blocks['procedures_callreturn'] = {
        /**
         * Block for calling a procedure with a return value.
         * @this {Blockly.Block}
         */
        init: function () {
            this.appendDummyInput('TOPROW')
                .appendField('', 'NAME');
            this.setOutput(true);
            this.setStyle('procedure_blocks');
            // Tooltip is set in domToMutation.
            this.setHelpUrl(Blockly.Msg['PROCEDURES_CALLRETURN_HELPURL']);
            this.arguments_ = [];
            this.quarkConnections_ = {};
            this.quarkIds_ = null;
            this.previousEnabledState_ = true;
        },
        getProcedureCall: Blockly.Blocks['procedures_callnoreturn'].getProcedureCall,
        renameProcedure: Blockly.Blocks['procedures_callnoreturn'].renameProcedure,
        setProcedureParameters_: Blockly.Blocks['procedures_callnoreturn'].setProcedureParameters_,
        updateShape_: Blockly.Blocks['procedures_callnoreturn'].updateShape_,
        mutationToDom: Blockly.Blocks['procedures_callnoreturn'].mutationToDom,
        domToMutation: Blockly.Blocks['procedures_callnoreturn'].domToMutation,
        getVars: Blockly.Blocks['procedures_callnoreturn'].getVars,
        getVarModels: Blockly.Blocks['procedures_callnoreturn'].getVarModels,
        onchange: Blockly.Blocks['procedures_callnoreturn'].onchange,
        customContextMenu: Blockly.Blocks['procedures_callnoreturn'].customContextMenu,
        defType_: 'procedures_defreturn'
    };
    Blockly.Blocks['procedures_ifreturn'] = {
        /**
         * Block for conditionally returning a value from a procedure.
         * @this {Blockly.Block}
         */
        init: function () {
            this.appendValueInput('CONDITION')
                .setCheck('Boolean')
                .appendField(Blockly.Msg['CONTROLS_IF_MSG_IF']);
            this.appendValueInput('VALUE')
                .appendField(Blockly.Msg['PROCEDURES_DEFRETURN_RETURN']);
            this.setInputsInline(true);
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setStyle('procedure_blocks');
            this.setTooltip(Blockly.Msg['PROCEDURES_IFRETURN_TOOLTIP']);
            this.setHelpUrl(Blockly.Msg['PROCEDURES_IFRETURN_HELPURL']);
            this.hasReturnValue_ = true;
        },
        /**
         * Create XML to represent whether this block has a return value.
         * @return {!Element} XML storage element.
         * @this {Blockly.Block}
         */
        mutationToDom: function () {
            var container = Blockly.utils.xml.createElement('mutation');
            container.setAttribute('value', this[Number("hasReturnValue_")]);
            return container;
        },
        /**
         * Parse XML to restore whether this block has a return value.
         * @param {!Element} xmlElement XML storage element.
         * @this {Blockly.Block}
         */
        domToMutation: function (xmlElement) {
            var value = xmlElement.getAttribute('value');
            this.hasReturnValue_ = (value == 1);
            if (!this.hasReturnValue_) {
                this.removeInput('VALUE');
                this.appendDummyInput('VALUE')
                    .appendField(Blockly.Msg['PROCEDURES_DEFRETURN_RETURN']);
            }
        },
        /**
         * Called whenever anything on the workspace changes.
         * Add warning if this flow block is not nested inside a loop.
         * @param {!Blockly.Events.Abstract} _e Change event.
         * @this {Blockly.Block}
         */
        onchange: function (_e) {
            if (!this.workspace.isDragging || this.workspace.isDragging()) {
                return; // Don't change state at the start of a drag.
            }
            var legal = false;
            // Is the block nested in a procedure?
            var block = this;
            do {
                if (this.FUNCTION_TYPES.indexOf(block.type) != -1) {
                    legal = true;
                    break;
                }
                block = block.getSurroundParent();
            } while (block);
            if (legal) {
                // If needed, toggle whether this block has a return value.
                if (block.type == 'procedures_defnoreturn' && this.hasReturnValue_) {
                    this.removeInput('VALUE');
                    this.appendDummyInput('VALUE')
                        .appendField(Blockly.Msg['PROCEDURES_DEFRETURN_RETURN']);
                    this.hasReturnValue_ = false;
                }
                else if (block.type == 'procedures_defreturn' &&
                    !this.hasReturnValue_) {
                    this.removeInput('VALUE');
                    this.appendValueInput('VALUE')
                        .appendField(Blockly.Msg['PROCEDURES_DEFRETURN_RETURN']);
                    this.hasReturnValue_ = true;
                }
                this.setWarningText(null);
                if (!this.isInFlyout) {
                    this.setEnabled(true);
                }
            }
            else {
                this.setWarningText(Blockly.Msg['PROCEDURES_IFRETURN_WARNING']);
                if (!this.isInFlyout && !this.getInheritedDisabled()) {
                    this.setEnabled(false);
                }
            }
        },
        /**
         * List of block types that are functions and thus do not need warnings.
         * To add a new function type add this to your code:
         * Blockly.Blocks['procedures_ifreturn'].FUNCTION_TYPES.push('custom_func');
         */
        FUNCTION_TYPES: ['procedures_defnoreturn', 'procedures_defreturn']
    };
});
//# sourceMappingURL=nepo.procedures.js.map