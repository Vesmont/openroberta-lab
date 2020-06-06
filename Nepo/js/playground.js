define(["require", "exports", "blockly", "ajv", "nepo.schema.robot", "nepo.theme.classic", "nepo.schema.common", "nepo.blockly", "nepo.variables"], function (require, exports, Blockly, Ajv, schemaRobot, nepoThemeClassic, schemaCommon, nepo_blockly_1, Variables) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = void 0;
    //import "nepo.procedures";
    var $blocklyArea = $("#blocklyArea");
    var $bricklyArea = $("#bricklyArea");
    var $blocklyDiv = $("#blocklyDiv");
    var $bricklyDiv = $("#bricklyDiv");
    var blocklyWorkspace;
    var bricklyWorkspace;
    var ajv = new Ajv();
    var commonJSONBlockDescription;
    var robotJSONBlockDescription;
    //(window as any).LOG = true;
    function init() {
        var Export = document.getElementById("export");
        var Import = document.getElementById("import");
        Export.onclick = function () {
            toXml();
        };
        Import.onclick = function () {
            fromXml();
        };
        $.getJSON('../OpenRobertaRobot/src/main/resources/nepoBlocks.json', function (result) {
            if (validateSchema(result, schemaCommon.schema)) {
                commonJSONBlockDescription = result;
            }
        }).always(function () {
            $.getJSON('../RobotRaspberryPi/src/main/resources/nepoBlocks.json', function (result) {
                if (validateSchema(result, schemaRobot.schema)) {
                    robotJSONBlockDescription = result;
                }
            }).always(function () {
                initBlockly();
            });
        });
    }
    exports.init = init;
    function initBlockly() {
        if (!(commonJSONBlockDescription && robotJSONBlockDescription)) {
            console.assert(commonJSONBlockDescription && robotJSONBlockDescription ? true : false, "error Beate");
            return;
        }
        var $toolbox = $('#toolbox-categories')[0];
        nepo_blockly_1.Nepo.defineDatatypes(robotJSONBlockDescription);
        var commonBlocks = nepo_blockly_1.Nepo.initCommonBlocks(commonJSONBlockDescription['blocks']);
        nepo_blockly_1.Nepo.defineCommonBlocks(commonBlocks);
        nepo_blockly_1.Nepo.inject("blocklyDiv");
        nepoThemeClassic.setTheme();
        blocklyWorkspace = Blockly.inject('blocklyDiv', { "toolbox": $toolbox });
        bricklyWorkspace = Blockly.inject('bricklyDiv', { "toolbox": $toolbox });
        blocklyWorkspace.setTheme(Blockly["Themes"]["NepoClassic"]);
        blocklyWorkspace.registerToolboxCategoryCallback('NEPO_VARIABLE', Variables.nepoVariablesFlyoutCallback);
        //blocklyWorkspace.addChangeListener(function(event) {console.log(event) });
        resizeAll();
    }
    function resizeAll() {
        function resizeDiv($div, $area) {
            var x = $area.offset().left;
            var y = $area.offset().top;
            $div.offset({ top: y, left: x });
            $div.width($area.width());
            $div.height($area.height());
        }
        resizeDiv($blocklyDiv, $blocklyArea);
        resizeDiv($bricklyDiv, $bricklyArea);
        Blockly.svgResize(blocklyWorkspace);
        Blockly.svgResize(bricklyWorkspace);
    }
    ;
    function validateSchema(json, schema) {
        var validate = ajv.compile(schema);
        var valid = validate(json);
        if (!valid) {
            console.error(validate.errors);
        }
        else {
            console.log("validation against schema " + schema.title + " succeded");
        }
        ;
        return valid;
    }
    function toXml() {
        var output = document.getElementById('importExport');
        var xml = Blockly.Xml.workspaceToDom(blocklyWorkspace);
        output.value = Blockly.Xml.domToPrettyText(xml);
        output.focus();
        output.select();
    }
    function fromXml() {
        var input = document.getElementById('importExport');
        if (!input.value) {
            return;
        }
        var xml = Blockly.Xml.textToDom(input.value);
        Blockly.Xml.domToWorkspace(xml, blocklyWorkspace);
    }
    $(window).on('resize', function () {
        resizeAll();
    });
});
//# sourceMappingURL=playground.js.map