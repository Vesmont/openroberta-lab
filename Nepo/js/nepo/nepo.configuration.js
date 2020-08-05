define(["require", "exports", "blockly", "utils/nepo.logger"], function (require, exports, Blockly, nepo_logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Configuration = void 0;
    nepo_logger_1.Log;
    var Configuration = /** @class */ (function () {
        function Configuration(conf, robot, robotGroup) {
            this.init = function () {
                this.type = this.conf["category"].toLowerCase() + "_" + this.conf["name"].toLowerCase();
                this.typeUpper = this.type.toUpperCase();
                this.setStyle(this.conf.category + "_blocks");
                var thisConf = this;
                var validateName = function (name) {
                    var block = this.sourceBlock_;
                    name = name.replace(/[\s\xa0]+/g, '').replace(/^ | $/g, '');
                    // no name set -> invalid
                    if (name === '')
                        return null;
                    if (!name.match(/^[a-zA-Z][a-zA-Z_$0-9]*$/))
                        return null;
                    // Ensure two identically-named variables don't exist.
                    // TODO name = Blockly.RobConfig.findLegalName(name, block);
                    // TODO: Blockly.RobConfig.renameConfig(this.sourceBlock_, block.nameOld, name, Blockly.Workspace.getById("blocklyDiv"));
                    block.nameOld = name;
                    return name;
                };
                // var msg = Blockly.Msg[type + this.conf.name + "_" + this.workspace.device.toUpperCase()] || Blockly.Msg[type + this.conf.name];
                // TODO var name = Blockly.RobConfig.findLegalName(msg.charAt(0).toUpperCase() || Blockly.Msg[type + this.conf.name]
                //	|| U.checkMsgKey('CONFIGURATION_PORT'), this);
                this.nameOld = name;
                var nameField = new Blockly.FieldTextInput(name, validateName);
                this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT).appendField(Blockly.Msg[this.typeUpper + this.robotGroup.toUpperCase()]
                    || Blockly.Msg[this.typeUpper] || this.typeUpper, this.conf.category.toUpperCase()).appendField(nameField, 'NAME');
                if (this.conf.bricks) {
                    var container = Blockly.Workspace.getById("bricklyDiv");
                    if (container) {
                        var topBlocks = Blockly.getMainWorkspace().getTopBlocks(true);
                        var variableList = [];
                        for (var i = 0; i < topBlocks.length; i++) {
                            var block = topBlocks[i];
                            if (block.type.indexOf('robBrick_') !== -1) {
                                if (block.getVarDecl) {
                                    variableList.push([block.getVarDecl()[0], block.getVarDecl()[0]]);
                                }
                            }
                        }
                    }
                    if (variableList.length == 0) {
                        variableList.push([['INVALID_NAME', 'INVALID_NAME']]);
                    }
                    var brickName = new Blockly.FieldDropdown(variableList);
                    this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT).appendField(Blockly.Msg['BRICKNAME_' + this.workspace.device.toUpperCase()]).appendField(brickName, 'VAR');
                    this.getVars = function () {
                        return [this.getFieldValue('VAR')];
                    };
                    this.renameVar = function (oldName, newName) {
                        if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
                            this.setFieldValue(newName, 'VAR');
                        }
                    };
                }
                /**
                 * Checking for generic block parts like text inputs or dropdowns
                 */
                if (this.conf.inputs) {
                    for (var i = 0; i < this.conf.inputs.length; i++) {
                        var textFieldName = this.conf.inputs[i][0];
                        var textField = new Blockly.FieldTextInput(this.conf.inputs[i][1]);
                        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT).appendField(Blockly.Msg[this.conf.inputs[i][0]]).appendField(textField, textFieldName);
                    }
                }
                if (this.conf.dropdowns) {
                    for (var i = 0; i < this.conf.dropdowns.length; i++) {
                        var dropDownName = Blockly.Msg[this.conf.dropdowns[i][0]];
                        var fieldDropDown = new Blockly.FieldDropdown(this.conf.dropdowns[i][1]);
                        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT).appendField(dropDownName).appendField(fieldDropDown, dropDownName);
                    }
                }
                var portList = [];
                if (this.conf.ports) {
                    for (var i = 0; i < this.conf.ports.length; i++) {
                        portList.push([Blockly.Msg[this.conf.ports[i][0]] || this.conf.ports[i][0], this.conf.ports[i][1]]);
                    }
                    //ports = new Blockly.FieldDropdown(portList);
                }
                else {
                    //ports = new HiddenField();
                }
                if (this.conf.pins) {
                    for (var i = 0; i < portList.length; i++) {
                        var pins = [];
                        for (var j = 0; j < this.conf.pins.length; j++) {
                            pins.push(this.conf.pins[j]);
                        }
                        var pinsDropdown = new Blockly.FieldDropdown(pins);
                        if (this.conf.standardPins) {
                            pinsDropdown.setValue(this.conf.standardPins[i]);
                        }
                        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT).appendField(portList[i][0]).appendField(pinsDropdown, portList[i][1]);
                    }
                }
                if (this.conf.fixedPorts) {
                    for (var i = 0; i < this.conf.fixedPorts.length; i++) {
                        var dropDown = new Blockly.FieldDropdown([[this.conf.fixedPorts[i][1], this.conf.fixedPorts[i][1]]]);
                        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT).appendField(this.conf.fixedPorts[i][0]).appendField(dropDown);
                    }
                }
                var that = this;
                this.setTooltip(function () {
                    return Blockly.Msg[thisConf.type + '_TOOLTIP_' + thisConf.robotGroup] || Blockly.Msg[thisConf.type + '_TOOLTIP']
                        || thisConf.type + '_TOOLTIP';
                });
                this.getConfigDecl = function () {
                    return {
                        'type': thisConf.name.toLowerCase(),
                        'name': that.getFieldValue('NAME')
                    };
                };
                this.onDispose = function () {
                    //Blockly.RobConfig.disposeConfig(this);
                };
            };
            this.robot = robot;
            this.robotGroup = robotGroup;
            this.conf = conf;
        }
        return Configuration;
    }());
    exports.Configuration = Configuration;
});
//# sourceMappingURL=nepo.configuration.js.map