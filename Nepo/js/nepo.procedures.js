define(["require", "exports", "blockly", "utils/nepo.logger"], function (require, exports, Blockly, nepo_logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flyoutCallback = void 0;
    var LOG = new nepo_logger_1.Log();
    LOG;
    function flyoutCallback(workspace) {
        workspace;
        var xmlList = [];
        if (Blockly.Blocks['procedures_defnoreturn']) {
            // <block type="procedures_defnoreturn" gap="16">
            //     <field name="NAME">do something</field>
            // </block>
            var block = Blockly.utils.xml.createElement('block');
            block.setAttribute('type', 'procedures_defnoreturn');
            block.setAttribute('gap', "16");
            var nameField = Blockly.utils.xml.createElement('field');
            nameField.setAttribute('name', 'NAME');
            nameField.appendChild(Blockly.utils.xml.createTextNode(Blockly.Msg['PROCEDURES_DEF_PROCEDURE']));
            block.appendChild(nameField);
            xmlList.push(block);
        }
        if (Blockly.Blocks['procedures_defreturn']) {
            // <block type="procedures_defreturn" gap="16">
            //     <field name="NAME">do something</field>
            // </block>
            var block = Blockly.utils.xml.createElement('block');
            block.setAttribute('type', 'procedures_defreturn');
            block.setAttribute('gap', "16");
            var nameField = Blockly.utils.xml.createElement('field');
            nameField.setAttribute('name', 'NAME');
            nameField.appendChild(Blockly.utils.xml.createTextNode(Blockly.Msg['PROCEDURES_DEF_PROCEDURE']));
            block.appendChild(nameField);
            xmlList.push(block);
        }
        //	if (Blockly.Blocks['procedures_ifreturn']) {
        //		// <block type="procedures_ifreturn" gap="16"></block>
        //		var block = Blockly.utils.xml.createElement('block');
        //		block.setAttribute('type', 'procedures_ifreturn');
        //		block.setAttribute('gap', "16");
        //		xmlList.push(block);
        //	}
        if (xmlList.length) {
            // Add slightly larger gap between system blocks and user calls.
            xmlList[xmlList.length - 1].setAttribute('gap', "24");
        }
        function populateProcedures(procedureList, templateName) {
            for (var i = 0; i < procedureList.length; i++) {
                var name = procedureList[i][0];
                var args = procedureList[i][1];
                // <block type="procedures_callnoreturn" gap="16">
                //   <mutation name="do something">
                //     <arg name="x" dataType="Number" varId="idxyz"></arg>
                //   </mutation>
                // </block>
                var block = Blockly.utils.xml.createElement('block');
                block.setAttribute('type', templateName);
                block.setAttribute('gap', "16");
                var mutation = Blockly.utils.xml.createElement('mutation');
                mutation.setAttribute('name', name);
                block.appendChild(mutation);
                for (var j = 0; j < args.length; j++) {
                    var variable = workspace.getVariableById(args[j]);
                    var arg = Blockly.utils.xml.createElement('arg');
                    arg.setAttribute('name', variable.name);
                    arg.setAttribute('dataType', variable.type);
                    //arg.setAttribute('varId', args[j].getId());
                    mutation.appendChild(arg);
                }
                xmlList.push(block);
            }
        }
        var tuple = Blockly.Procedures.allProcedures(workspace);
        console.log(tuple);
        LOG.info("all procedures: ", tuple);
        populateProcedures(tuple[0], 'procedures_callnoreturn');
        populateProcedures(tuple[1], 'procedures_callreturn');
        return xmlList;
    }
    exports.flyoutCallback = flyoutCallback;
});
//# sourceMappingURL=nepo.procedures.js.map