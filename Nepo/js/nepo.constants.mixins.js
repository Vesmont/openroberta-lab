define(["require", "exports", "blockly", "nepo.mutator.minus", "nepo.variables", "utils/nepo.logger"], function (require, exports, Blockly, nepo_mutator_minus_1, Variables, nepo_logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.INTERNAL_VARIABLE_DECLARATION_MIXIN = exports.COMMON_TYPE_MIXIN = exports.VARIABLE_MIXIN = exports.VARIABLE_DECLARATION_MIXIN = exports.COMMENTS_IMAGE_MIXIN = exports.TEXT_JOIN_MUTATOR_MIXIN = exports.QUOTE_IMAGE_MIXIN = exports.IS_DIVISIBLEBY_MUTATOR_MIXIN = exports.CONTROLS_WAIT_FOR_MUTATOR_MIXIN = exports.CONTROLS_IF_MUTATOR_MIXIN = exports.VARIABLE_PLUS_MUTATOR_MIXIN = void 0;
    var LOG = new nepo_logger_1.Log();
    LOG;
    exports.VARIABLE_PLUS_MUTATOR_MIXIN = {
        declare_: false,
        /**
     * Create XML to represent whether a statement list of variable declarations
     * should be present.
     *
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
        mutationToDom: function () {
            if (!this.declare_ === undefined) {
                return false;
            }
            var container = document.createElement('mutation');
            container.setAttribute('declare', (this.declare_ == true).toString());
            return container;
        },
        /**
         * Parse XML to restore the statement list.
         *
         * @param {!Element}
         *            xmlElement XML storage element.
         * @this Blockly.Block
         */
        domToMutation: function (xmlElement) {
            this.declare_ = (xmlElement.getAttribute('declare') != 'false');
            if (this.declare_) {
                var variableDeclareStatement = new Blockly.Input(Blockly.NEXT_STATEMENT, "DECL", this, this.makeConnection_(Blockly.NEXT_STATEMENT));
                this.inputList.splice(1, 0, variableDeclareStatement);
                // making sure only declarations can connect to the statement list
                this.getInput("DECL").connection.setCheck('declaration_only');
                this.declare_ = true;
            }
        },
        /**
         * Update the shape according, if declarations exists.
         *
         * @param {Number}
         *            number 1 add a variable declaration, -1 remove a variable
         *            declaration.
         * @this Blockly.Block
         */
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
        // scope extension
        onchange: function (e) {
            // no need to check scope for global vars (start block) nor for blocks in the toolbox's flyout'
            if (this.type.indexOf("start") >= 0 || this.isInFlyout) {
                return;
            }
            else if (e.blockId == this.id && e.type == Blockly.Events.BLOCK_MOVE) {
                Variables.checkScope(this);
            }
        }
    };
    exports.CONTROLS_IF_MUTATOR_MIXIN = {
        elseifCount_: 0,
        elseCount_: 0,
        /**
         * Don't automatically add STATEMENT_PREFIX and STATEMENT_SUFFIX to generated
         * code.  These will be handled manually in this block's generators.
         */
        suppressPrefixSuffix: true,
        /**
         * Create XML to represent the number of else-if and else inputs.
         * @return {Element} XML storage element.
         * @this {Blockly.Block}
         */
        mutationToDom: function () {
            if (!this.elseifCount_ && !this.elseCount_) {
                return null;
            }
            var container = Blockly.utils.xml.createElement('mutation');
            if (this.elseifCount_) {
                container.setAttribute('elseif', this.elseifCount_);
            }
            if (this.elseCount_) {
                container.setAttribute('else', 1);
            }
            return container;
        },
        /**
         * Parse XML to restore the else-if and else inputs.
         * @param {!Element} xmlElement XML storage element.
         * @this {Blockly.Block}
         */
        domToMutation: function (xmlElement) {
            this.elseifCount_ = parseInt(xmlElement.getAttribute('elseif'), 10) || 0;
            this.elseCount_ = parseInt(xmlElement.getAttribute('else'), 10) || 0;
            for (var x = 1; x <= this.elseifCount_; x++) {
                this.appendValueInput('IF' + x).appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF).setCheck('Boolean');
                this.appendStatementInput('DO' + x).appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
            }
            if (this.elseifCount_ >= 1) {
                this.setMutator(new nepo_mutator_minus_1.MutatorMinus());
            }
            if (this.elseCount_ > 0) {
                this.appendStatementInput('ELSE').appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSE']);
            }
        },
        /**
         * Update the shape according to the input
         * @param {Number} number +1 add at the end, -1 remove last.
         * @this Blockly.Block
         */
        updateShape_: function (num) {
            var elseStatementConnection;
            if (this.getInput('ELSE')) {
                elseStatementConnection = this.getInput('ELSE').connection.targetConnection;
                this.removeInput("ELSE");
            }
            if (num == 1) {
                this.elseifCount_++;
                this.appendValueInput('IF' + this.elseifCount_).appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF).setCheck('Boolean');
                this.appendStatementInput('DO' + this.elseifCount_).appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
            }
            else if (num == -1) {
                var target = this.getInput('IF' + this.elseifCount_).connection.targetConnection;
                if (target) {
                    target.disconnect();
                }
                this.removeInput('DO' + this.elseifCount_, true);
                this.removeInput('IF' + this.elseifCount_), true;
                this.elseifCount_--;
            }
            if (this.elseifCount_ >= 1) {
                if (this.elseifCount_ == 1) {
                    this.setMutator(new nepo_mutator_minus_1.MutatorMinus());
                    this.render();
                }
            }
            else {
                this.mutatorMinus.dispose();
                this.mutatorMinus = null;
                this.render();
            }
            if (this.elseCount_ > 0) {
                this.appendStatementInput('ELSE').appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSE']);
                if (elseStatementConnection != undefined) {
                    Blockly.Mutator.reconnect(elseStatementConnection, this, 'ELSE');
                }
            }
        }
    };
    exports.CONTROLS_WAIT_FOR_MUTATOR_MIXIN = {
        waitCount_: 0,
        /**
         * Don't automatically add STATEMENT_PREFIX and STATEMENT_SUFFIX to generated
         * code.  These will be handled manually in this block's generators.
         */
        suppressPrefixSuffix: true,
        /**
         * Create XML to represent the number of else-if and else inputs.
         * @return {Element} XML storage element.
         * @this {Blockly.Block}
         */
        mutationToDom: function () {
            if (!this.waitCount_ && !this.elseCount_) {
                return null;
            }
            var container = Blockly.utils.xml.createElement('mutation');
            if (this.waitCount_) {
                container.setAttribute('wait', this.waitCount_);
            }
            return container;
        },
        /**
         * Parse XML to restore the else-if and else inputs.
         * @param {!Element} xmlElement XML storage element.
         * @this {Blockly.Block}
         */
        domToMutation: function (xmlElement) {
            this.waitCount_ = parseInt(xmlElement.getAttribute('wait'), 10) || 0;
            if (this.waitCount_ >= 1) {
                this.setMutator(new nepo_mutator_minus_1.MutatorMinus());
                this.appendStatementInput('DO' + x).appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
            }
            for (var x = 1; x <= this.waitCount_; x++) {
                this.appendValueInput('WAIT' + x).appendField(Blockly.Msg.CONTROLS_WAIT_FOR_OR).setCheck('Boolean');
                this.appendStatementInput('DO' + x).appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
            }
        },
        /**
         * Update the shape according to the number of wait inputs.
         * @param {Number} number of else inputs.
         * @this Blockly.Block
         */
        updateShape_: function (num) {
            if (num == 1) {
                this.waitCount_++;
                if (this.waitCount_ == 1) {
                    this.appendStatementInput('DO0').appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
                }
                this.appendValueInput('WAIT' + this.waitCount_).appendField(Blockly.Msg.CONTROLS_WAIT_FOR_OR).setCheck('Boolean');
                this.appendStatementInput('DO' + this.waitCount_).appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
            }
            else if (num == -1) {
                var target = this.getInput('WAIT' + this.waitCount_).connection.targetConnection;
                if (target) {
                    target.disconnect();
                }
                this.removeInput('DO' + this.waitCount_, true);
                this.removeInput('WAIT' + this.waitCount_, true);
                if (this.waitCount_ == 1) {
                    this.removeInput('DO0', true);
                }
                this.waitCount_--;
            }
            if (this.waitCount_ == 1) {
                this.setMutator(new nepo_mutator_minus_1.MutatorMinus());
                this.render();
            }
            if (this.waitCount_ == 0) {
                this.mutatorMinus.dispose();
                this.mutatorMinus = null;
                this.render();
            }
        }
    };
    exports.IS_DIVISIBLEBY_MUTATOR_MIXIN = {
        /**
         * Create XML to represent whether the 'divisorInput' should be present.
         * @return {!Element} XML storage element.
         * @this {Blockly.Block}
         */
        mutationToDom: function () {
            var container = Blockly.utils.xml.createElement('mutation');
            var divisorInput = (this.getFieldValue('PROPERTY') == 'DIVISIBLE_BY');
            container.setAttribute('divisor_input', divisorInput);
            return container;
        },
        /**
         * Parse XML to restore the 'divisorInput'.
         * @param {!Element} xmlElement XML storage element.
         * @this {Blockly.Block}
         */
        domToMutation: function (xmlElement) {
            var divisorInput = (xmlElement.getAttribute('divisor_input') == 'true');
            this.updateShape_(divisorInput);
        },
        /**
         * Modify this block to have (or not have) an input for 'is divisible by'.
         * @param {boolean} divisorInput True if this block has a divisor input.
         * @private
         * @this {Blockly.Block}
         */
        updateShape_: function (divisorInput) {
            // Add or remove a Value Input.
            var inputExists = this.getInput('DIVISOR');
            if (divisorInput) {
                if (!inputExists) {
                    this.appendValueInput('DIVISOR')
                        .setCheck('Number');
                }
            }
            else if (inputExists) {
                this.removeInput('DIVISOR');
            }
        }
    };
    exports.QUOTE_IMAGE_MIXIN = {
        /**
         * Image data URI of an LTR opening double quote (same as RTL closing double quote).
         * @readonly
         */
        QUOTE_IMAGE_LEFT_DATAURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAA' +
            'n0lEQVQI1z3OMa5BURSF4f/cQhAKjUQhuQmFNwGJEUi0RKN5rU7FHKhpjEH3TEMtkdBSCY' +
            '1EIv8r7nFX9e29V7EBAOvu7RPjwmWGH/VuF8CyN9/OAdvqIXYLvtRaNjx9mMTDyo+NjAN1' +
            'HNcl9ZQ5oQMM3dgDUqDo1l8DzvwmtZN7mnD+PkmLa+4mhrxVA9fRowBWmVBhFy5gYEjKMf' +
            'z9AylsaRRgGzvZAAAAAElFTkSuQmCC',
        /**
         * Image data URI of an LTR closing double quote (same as RTL opening double quote).
         * @readonly
         */
        QUOTE_IMAGE_RIGHT_DATAURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAA' +
            'qUlEQVQI1z3KvUpCcRiA8ef9E4JNHhI0aFEacm1o0BsI0Slx8wa8gLauoDnoBhq7DcfWhg' +
            'gONDmJJgqCPA7neJ7p934EOOKOnM8Q7PDElo/4x4lFb2DmuUjcUzS3URnGib9qaPNbuXvB' +
            'O3sGPHJDRG6fGVdMSeWDP2q99FQdFrz26Gu5Tq7dFMzUvbXy8KXeAj57cOklgA+u1B5Aos' +
            'lLtGIHQMaCVnwDnADZIFIrXsoXrgAAAABJRU5ErkJggg==',
        /**
         * Pixel width of QUOTE_IMAGE_LEFT_DATAURI and QUOTE_IMAGE_RIGHT_DATAURI.
         * @readonly
         */
        QUOTE_IMAGE_WIDTH: 12,
        /**
         * Pixel height of QUOTE_IMAGE_LEFT_DATAURI and QUOTE_IMAGE_RIGHT_DATAURI.
         * @readonly
         */
        QUOTE_IMAGE_HEIGHT: 12,
        /**
         * Inserts appropriate quote images before and after the named field.
         * @param {string} fieldName The name of the field to wrap with quotes.
         * @this {Blockly.Block}
         */
        quoteField_: function (fieldName) {
            for (var i = 0, input; (input = this.inputList[i]); i++) {
                for (var j = 0, field; (field = input.fieldRow[j]); j++) {
                    if (fieldName == field.name) {
                        input.insertFieldAt(j, this.newQuote_(true));
                        input.insertFieldAt(j + 2, this.newQuote_(false));
                        return;
                    }
                }
            }
            console.warn('field named "' + fieldName + '" not found in ' + this.toDevString());
        },
        /**
         * A helper function that generates a FieldImage of an opening or
         * closing double quote. The selected quote will be adapted for RTL blocks.
         * @param {boolean} open If the image should be open quote (“ in LTR).
         *                       Otherwise, a closing quote is used (” in LTR).
         * @return {!Blockly.FieldImage} The new field.
         * @this {Blockly.Block}
         */
        newQuote_: function (open) {
            var isLeft = this.RTL ? !open : open;
            var dataUri = isLeft ?
                this.QUOTE_IMAGE_LEFT_DATAURI :
                this.QUOTE_IMAGE_RIGHT_DATAURI;
            return new Blockly.FieldImage(dataUri, this.QUOTE_IMAGE_WIDTH, this.QUOTE_IMAGE_HEIGHT, isLeft ? '\u201C' : '\u201D');
        }
    };
    exports.TEXT_JOIN_MUTATOR_MIXIN = {
        itemCount_: 1,
        /**
         * Create XML to represent number of text inputs.
         * @return {!Element} XML storage element.
         * @this {Blockly.Block}
         */
        mutationToDom: function () {
            var container = Blockly.utils.xml.createElement('mutation');
            container.setAttribute('items', this.itemCount_);
            return container;
        },
        /**
         * Parse XML to restore the text inputs.
         * @param {!Element} xmlElement XML storage element.
         * @this {Blockly.Block}
         */
        domToMutation: function (xmlElement) {
            this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
            for (var x = 2; x <= this.itemCount_; x++) {
                this.appendValueInput('ADD' + x).setCheck('Boolean');
            }
        },
        updateShape_: function (num) {
            if (num == 1) {
                this.itemCount_++;
                this.appendValueInput('ADD' + this.itemCount_);
            }
            else if (num == -1) {
                var target = this.getInput('ADD' + this.itemCount_).connection.targetConnection;
                if (target) {
                    target.disconnect();
                }
                this.removeInput('ADD' + this.itemCount_, true);
                this.itemCount_--;
            }
            if (this.itemCount_ > 1) {
                if (this.itemCount_ == 2) {
                    this.setMutator(new nepo_mutator_minus_1.MutatorMinus());
                    this.render();
                }
            }
            else {
                this.mutatorMinus.dispose();
                this.mutatorMinus = null;
                this.render();
            }
        }
    };
    exports.COMMENTS_IMAGE_MIXIN = {
        /**
         * Image data URI of an LTR opening double quote (same as RTL closing double quote).
         * @readonly
         */
        COMMENTS_IMAGE_LEFT: 'data:image/svg+xml;charset=UTF-8,<svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events" width="32" height="32" viewBox="0 0 32 32" fill="%23ffffff" ><path d="M24 8h-17.333c-2.2 0-4 1.8-4 4v9.333c0 2.2 1.8 4 4 4h1.333v4l4-4h12c2.2 0 4-1.8 4-4v-9.333c0-2.2-1.8-4-4-4zM25.333 21.333c0 0.723-0.611 1.333-1.333 1.333h-17.333c-0.723 0-1.333-0.611-1.333-1.333v-9.333c0-0.723 0.611-1.333 1.333-1.333h17.333c0.723 0 1.333 0.611 1.333 1.333v9.333zM9.333 19.333c-1.472 0-2.667-1.195-2.667-2.667s1.195-2.667 2.667-2.667 2.667 1.195 2.667 2.667-1.195 2.667-2.667 2.667zM9.333 15.333c-0.736 0-1.333 0.597-1.333 1.333s0.597 1.333 1.333 1.333 1.333-0.597 1.333-1.333-0.597-1.333-1.333-1.333zM15.333 19.333c-1.472 0-2.667-1.195-2.667-2.667s1.195-2.667 2.667-2.667 2.667 1.195 2.667 2.667-1.195 2.667-2.667 2.667zM15.333 15.333c-0.736 0-1.333 0.597-1.333 1.333s0.597 1.333 1.333 1.333 1.333-0.597 1.333-1.333-0.597-1.333-1.333-1.333zM21.333 19.333c-1.472 0-2.667-1.195-2.667-2.667s1.195-2.667 2.667-2.667 2.667 1.195 2.667 2.667-1.195 2.667-2.667 2.667zM21.333 15.333c-0.736 0-1.333 0.597-1.333 1.333s0.597 1.333 1.333 1.333 1.333-0.597 1.333-1.333-0.597-1.333-1.333-1.333z"></path></svg>',
        COMMENTS_IMAGE_RIGHT: 'data:image/svg+xml;charset=UTF-8,<svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events" width="32" height="32" viewBox="-32 0 32 32" fill="%23ffffff"><path transform="scale(-1,1)" d="M24 8h-17.333c-2.2 0-4 1.8-4 4v9.333c0 2.2 1.8 4 4 4h1.333v4l4-4h12c2.2 0 4-1.8 4-4v-9.333c0-2.2-1.8-4-4-4zM25.333 21.333c0 0.723-0.611 1.333-1.333 1.333h-17.333c-0.723 0-1.333-0.611-1.333-1.333v-9.333c0-0.723 0.611-1.333 1.333-1.333h17.333c0.723 0 1.333 0.611 1.333 1.333v9.333zM9.333 19.333c-1.472 0-2.667-1.195-2.667-2.667s1.195-2.667 2.667-2.667 2.667 1.195 2.667 2.667-1.195 2.667-2.667 2.667zM9.333 15.333c-0.736 0-1.333 0.597-1.333 1.333s0.597 1.333 1.333 1.333 1.333-0.597 1.333-1.333-0.597-1.333-1.333-1.333zM15.333 19.333c-1.472 0-2.667-1.195-2.667-2.667s1.195-2.667 2.667-2.667 2.667 1.195 2.667 2.667-1.195 2.667-2.667 2.667zM15.333 15.333c-0.736 0-1.333 0.597-1.333 1.333s0.597 1.333 1.333 1.333 1.333-0.597 1.333-1.333-0.597-1.333-1.333-1.333zM21.333 19.333c-1.472 0-2.667-1.195-2.667-2.667s1.195-2.667 2.667-2.667 2.667 1.195 2.667 2.667-1.195 2.667-2.667 2.667zM21.333 15.333c-0.736 0-1.333 0.597-1.333 1.333s0.597 1.333 1.333 1.333 1.333-0.597 1.333-1.333-0.597-1.333-1.333-1.333z"></path></svg>',
        COMMENTS_IMAGE_WIDTH: 18,
        /**
         * Pixel height of QUOTE_IMAGE_LEFT_DATAURI and QUOTE_IMAGE_RIGHT_DATAURI.
         * @readonly
         */
        COMMENTS_IMAGE_HEIGHT: 18,
        /**
         * Inserts appropriate quote images before and after the named field.
         * @param {string} fieldName The name of the field to wrap with quotes.
         * @this {Blockly.Block}
         */
        commentField_: function (fieldName) {
            for (var i = 0, input; (input = this.inputList[i]); i++) {
                for (var j = 0, field; (field = input.fieldRow[j]); j++) {
                    if (fieldName == field.name) {
                        input.insertFieldAt(j, this.newComment_(true));
                        input.insertFieldAt(j + 2, this.newComment_(false));
                        return;
                    }
                }
            }
            console.warn('field named "' + fieldName + '" not found in ' + this.toDevString());
        },
        /**
         * A helper function that generates a FieldImage of an opening or
         * closing double quote. The selected quote will be adapted for RTL blocks.
         * @param {boolean} open If the image should be open quote (“ in LTR).
         *                       Otherwise, a closing quote is used (” in LTR).
         * @return {!Blockly.FieldImage} The new field.
         * @this {Blockly.Block}
         */
        newComment_: function (open) {
            var isLeft = this.RTL ? !open : open;
            var dataUri = isLeft ?
                this.COMMENTS_IMAGE_LEFT :
                this.COMMENTS_IMAGE_RIGHT;
            return new Blockly.FieldImage(dataUri, this.COMMENTS_IMAGE_WIDTH, this.COMMENTS_IMAGE_HEIGHT, isLeft ? '\u201C' : '\u201D');
        }
    };
    exports.VARIABLE_DECLARATION_MIXIN = {
        /**
       * Create XML to represent variable declaration insides.
       * @return {Element} XML storage element.
       * @this Blockly.Block
       */
        mutationToDom: function () {
            if (this.next_ === undefined || this.dataType_ === undefined) {
                return false;
            }
            var container = document.createElement('mutation');
            container.setAttribute('next', this.next_);
            container.setAttribute('dataType', this.dataType_);
            container.setAttribute('varType', this.varType_);
            return container;
        },
        /**
         * Parse XML to restore variable declarations.
         * @param {!Element} xmlElement XML storage element.
         * @this Blockly.Block
         */
        domToMutation: function (xmlElement) {
            this.next_ = xmlElement.getAttribute('next') == 'true';
            if (this.next_) {
                this.setNextStatement(this.next_, "declaration_only");
            }
            this.dataType_ = xmlElement.getAttribute('dataType');
            if (this.dataType_) {
                this.getInput('VALUE').setCheck(this.dataType_);
            }
            this.varType_ = xmlElement.getAttribute("varType");
            if (this.varType_) {
                this.setVarType(this.varType_);
            }
        },
        getVariable: function () {
            return this.variable_;
        },
        setVariable: function (variable) {
            this.variable_ = variable;
        },
        getScopeId: function () {
            return this.scopeId_;
        },
        getDataType: function () {
            return this.dataType_;
        },
        getVarName: function () {
            return this.getField("VAR").getValue();
        },
        updateShape_: function (num) {
            if (num == -1) {
                // remove this variable declaration
                this.workspace.deleteVariableById(this.id);
                // check if the user confirmed the deletion
                var variableTmp = this.workspace.getVariableById(this.id);
                if (!variableTmp) {
                    var surroundParent = this.getSurroundParent();
                    var parent_1 = this.getParent();
                    var nextBlock = this.getNextBlock();
                    this.unplug(true, true);
                    if (parent_1 === surroundParent && !nextBlock) {
                        parent_1.updateShape_(num);
                    }
                    else if (!nextBlock) {
                        parent_1.setNextStatement(false);
                    }
                    this.dispose();
                }
            }
        },
        updateDataType: function (dataType) {
            var variableMap = this.workspace.getVariableMap().variableMap_;
            var variableList = variableMap[this.dataType_];
            for (var i = 0, tempVar; (tempVar = variableList[i]); i++) {
                if (tempVar.getId() == this.variable_.getId()) {
                    variableList.splice(i, 1);
                }
            }
            var variables = variableMap[dataType] || [];
            variables.push(this.variable_);
            variableMap[dataType] = variables;
            this.dataType_ = dataType;
            this.variable_.type = dataType;
            this.getInput("VALUE").setCheck(dataType);
        },
        setVarType: function (varType) {
            this.varType_ = varType;
            Variables.setStyle(this, this.varType_);
        },
        dispose: function (healStack, animate) {
            if (this.variable_ && this.workspace.getVariableById(this.variable_.getId())) {
                this.workspace.deleteVariableById(this.variable_.getId());
                LOG.warn("delete variable", this);
            }
            Blockly.BlockSvg.prototype.dispose.call(this, !!healStack, animate);
        }
    };
    exports.VARIABLE_MIXIN = {
        onchange: function () {
            if (this.isInFlyout) {
                return;
            }
            var id = this.getFieldValue("VAR");
            var thisVariable = Blockly.Variables.getVariable(this.workspace, id);
            // correct the type checker of this instance, only necessary, if there are more than one variable with the same name
            if (this.type.indexOf("nepo_variables") >= 0) {
                var dataTypes = [];
                var varList = Variables.getVariablesByName(this.workspace, thisVariable.name);
                for (var variable in varList) {
                    dataTypes.push(varList[variable].type);
                }
                ;
                this.updateDataType(dataTypes);
                LOG.info(dataTypes);
            }
            var tmpVariable;
            this.setWarningText(null);
            // allow not connected instances of this (no code generation for this anyway)
            if (this.type === "nepo_variables_get" && !this.outputConnection) {
                return;
            }
            if (this.type === "nepo_variables_set" && !this.getNextBlock() && !this.getPreviousBlock()) {
                return;
            }
            var valid = false;
            var surroundParent = this.getSurroundParent();
            if (surroundParent) {
                var surrVarDeclList = Variables.getSurrScopeList(this.getSurroundParent());
                tmpVariable = Object.values(surrVarDeclList).find(function (variable) { return variable.getId() === thisVariable.getId(); });
                if (tmpVariable === undefined) {
                    var varNameList = Variables.getVariablesByName(this.workspace, thisVariable.name);
                    var _loop_1 = function (a) {
                        tmpVariable = Object.values(surrVarDeclList).find(function (variable) { return variable.getId() === a.getId(); });
                        if (tmpVariable !== undefined) {
                            this_1.getField("VAR").doValueUpdate_(tmpVariable.getId());
                            valid = true;
                            this_1.updateDataType(tmpVariable.type);
                            return "break";
                        }
                    };
                    var this_1 = this;
                    for (var _i = 0, _a = Object.values(varNameList); _i < _a.length; _i++) {
                        var a = _a[_i];
                        var state_1 = _loop_1(a);
                        if (state_1 === "break")
                            break;
                    }
                    ;
                }
                else {
                    valid = true;
                    this.updateDataType(tmpVariable.type);
                }
            }
            if (!valid) {
                this.setWarningText(Blockly.Msg.VARIABLES_SCOPE_WARNING);
            }
        },
        updateDataType: function (dataType) {
            this.dataType_ = dataType;
            if (this.outputConnection) {
                this.outputConnection.setCheck(dataType);
            }
            else {
                for (var i = 0, input; (input = this.inputList[i]); i++) {
                    if (input.connection) {
                        input.connection.setCheck(dataType);
                    }
                }
            }
        },
        customContextMenu: function (options) {
            // Getter blocks have the option to create a setter block, and vice versa.
            if (!this.isInFlyout) {
                var opposite_type;
                var contextMenuMsg;
                var id = this.getFieldValue('VAR');
                var variableModel = this.workspace.getVariableById(id);
                var varType = variableModel.type;
                if (this.type == 'nepo_variables_get') {
                    opposite_type = 'nepo_variables_set';
                    contextMenuMsg = Blockly.Msg['VARIABLES_GET_CREATE_SET'];
                }
                else {
                    opposite_type = 'nepo_variables_get';
                    contextMenuMsg = Blockly.Msg['VARIABLES_SET_CREATE_GET'];
                }
                var option = { enabled: this.workspace.remainingCapacity() > 0 };
                var name = this.getField('VAR').getText();
                option["text"] = contextMenuMsg.replace('%1', name);
                var xmlField = Blockly.utils.xml.createElement('field');
                xmlField.setAttribute('name', 'VAR');
                xmlField.setAttribute('variabletype', varType);
                xmlField.appendChild(Blockly.utils.xml.createTextNode(name));
                var xmlBlock = Blockly.utils.xml.createElement('block');
                xmlBlock.setAttribute('type', opposite_type);
                xmlBlock.appendChild(xmlField);
                option["callback"] = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
                options.push(option);
            }
        }
    };
    exports.COMMON_TYPE_MIXIN = {
        mutationToDom: function () {
            var container = document.createElement('mutation');
            if (this.dataType_) {
                container.setAttribute('dataType', this.dataType_);
                return container;
            }
        },
        domToMutation: function (xmlElement) {
            var dataType = xmlElement.getAttribute('dataType');
            if (dataType) {
                this.updateDataType(dataType);
            }
        },
        updateDataType: function (dataType) {
            this.dataType_ = dataType;
            if (this.outputConnection) {
                this.outputConnection.setCheck(dataType);
            }
            else {
                for (var i = 0, input; (input = this.inputList[i]); i++) {
                    if (input.connection) {
                        input.connection.setCheck(dataType);
                    }
                }
            }
        }
    };
    exports.INTERNAL_VARIABLE_DECLARATION_MIXIN = {
        getVariable: function () {
            return this.variable_;
        },
        getScopeId: function () {
            return this.scopeId_;
        },
        getDataType: function () {
            return this.dataType_;
        },
        getVarName: function () {
            return this.getField("VAR").getValue();
        },
        mutationToDom: function () {
            var container = document.createElement('mutation');
            var variable = (this.variable_ && this.variable_.getId());
            container.setAttribute('var_decl', variable);
            return container;
        },
        domToMutation: function (xmlElement) {
            var varDecl = xmlElement.getAttribute('var_decl');
            if (varDecl && this.workspace.getVariableById(varDecl)) {
                this.variable_ = this.workspace.getVariableById(varDecl);
            }
            else {
                var name_2 = Variables.getUniqueName(this, [], Blockly.Msg["VARIABLES_LOOP_DEFAULT_NAME"]);
                this.variable_ = this.workspace.createVariable(name_2, "Number", this.id);
                this.getField("VAR").setValue(name_2);
            }
        },
        onchange: function (e) {
            if (this.isInFlyout) {
                return;
            }
            else if (e.blockId === this.id && e.type === Blockly.Events.BLOCK_MOVE) {
                Variables.checkScope(this);
            }
        },
        dispose: function (healStack, animate) {
            if (healStack && this.variable_ && this.workspace.getVariableById(this.variable_.getId())) {
                this.workspace.deleteVariableById(this.variable_.getId());
                LOG.warn("delete loop variable", this);
            }
            Blockly.BlockSvg.prototype.dispose.call(this, !!healStack, animate);
        }
    };
});
//# sourceMappingURL=nepo.constants.mixins.js.map