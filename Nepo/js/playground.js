define(["require", "exports", "blockly", "ajv", "nepo.schema.robot", "nepo.theme.classic", "nepo.schema.common", "nepo.blockly", "nepo.variables", "nepo.procedures"], function (require, exports, Blockly, Ajv, schemaRobot, nepoThemeClassic, schemaCommon, nepo_blockly_1, Variables, Procedures) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = void 0;
    var $blocklyArea = $("#blocklyArea");
    var $bricklyArea = $("#bricklyArea");
    var $blocklyDiv = $("#blocklyDiv");
    var $bricklyDiv = $("#bricklyDiv");
    var ajv = new Ajv();
    var commonJSONBlockDescription;
    var robotJSONBlockDescription;
    window.LOG = true;
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
            $.getJSON('../RobotMbed/src/main/resources/calliope/nepoBlocks.json', function (result) {
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
        var programToolbox = $('#program-toolbox')[0];
        var configToolbox = $('#config-toolbox')[0];
        // TODO: call this somewhere in the Open Roberta Lab static resources whenever a new plugin is chosen. Make sure you got the correct files from a rest call.
        nepo_blockly_1.Nepo.defineBlocks(robotJSONBlockDescription, commonJSONBlockDescription);
        nepo_blockly_1.Nepo.inject("blocklyDiv");
        nepoThemeClassic.setTheme();
        window.blocklyWorkspace = Blockly.inject('blocklyDiv', {
            "toolbox": programToolbox, zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            },
            trashcan: true
        });
        ;
        window.bricklyWorkspace = Blockly.inject('bricklyDiv', { "toolbox": configToolbox });
        blocklyWorkspace.setTheme(Blockly["Themes"]["NepoClassic"]);
        bricklyWorkspace.setTheme(Blockly["Themes"]["NepoClassic"]);
        blocklyWorkspace.registerToolboxCategoryCallback('NEPO_VARIABLE', Variables.flyoutCallback);
        blocklyWorkspace.registerToolboxCategoryCallback('NEPO_PROCEDURE', Procedures.flyoutCallback);
        // add default start block
        var xml = Blockly.Xml.textToDom("<xml xmlns='https://developers.google.com/blockly/xml'>" +
            "<block type='controls_start' id='mm;%5J+ugrVfS:/UE}.G' x='200' y='56'>" +
            "<mutation xmlns='http://www.w3.org/1999/xhtml' declare='false'></mutation>" +
            "</block>" +
            "</xml>");
        Blockly.Xml.domToWorkspace(xml, blocklyWorkspace);
        //blocklyWorkspace.addChangeListener(function(event) { console.log(event) });
        resizeAll();
        Blockly.svgResize(blocklyWorkspace);
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