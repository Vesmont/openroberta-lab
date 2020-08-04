import * as Blockly from "blockly";
import * as Ajv from "ajv";
import * as schemaRobot from "nepo.schema.robot";
import * as nepoThemeClassic from "nepo.theme.classic";
import * as schemaCommon from "nepo.schema.common";
import { Nepo } from "nepo.blockly";
import * as Variables from "nepo.variables";
import * as Procedures from "nepo.procedures";

const $blocklyArea: JQuery = $("#blocklyArea");
const $bricklyArea: JQuery = $("#bricklyArea");
const $blocklyDiv: JQuery = $("#blocklyDiv");
const $bricklyDiv: JQuery = $("#bricklyDiv");
var blocklyWorkspace: any;
var bricklyWorkspace: any;
var ajv = new Ajv();

var commonJSONBlockDescription: object;
var robotJSONBlockDescription: object;

(window as any).LOG = true;

export function init() {
	var Export = document.getElementById("export");
	var Import = document.getElementById("import");
	Export.onclick = function() {
		toXml();
	}
	Import.onclick = function() {
		fromXml();
	}
	$.getJSON('../OpenRobertaRobot/src/main/resources/nepoBlocks.json', function(result) {
		if (validateSchema(result, schemaCommon.schema)) {
			commonJSONBlockDescription = result;
		}
	}).always(function() {
		$.getJSON('../RobotMbed/src/main/resources/calliope/nepoBlocks.json', function(result) {
			if (validateSchema(result, schemaRobot.schema)) {
				robotJSONBlockDescription = result;
			}
		}).always(function() {
			initBlockly();
		});
	});
}

function initBlockly() {
	if (!(commonJSONBlockDescription && robotJSONBlockDescription)) {
		console.assert(commonJSONBlockDescription && robotJSONBlockDescription ? true : false, "error Beate");
		return;
	}
	var $toolbox = $('#toolbox-categories')[0];
	Nepo.defineBlocks(robotJSONBlockDescription);

	let commonBlocks: Object[] = Nepo.initCommonBlocks(commonJSONBlockDescription['blocks']);
	Nepo.defineCommonBlocks(commonBlocks);
	Nepo.inject("blocklyDiv");
	nepoThemeClassic.setTheme();
	blocklyWorkspace = Blockly.inject('blocklyDiv', {
		"toolbox": $toolbox, zoom:
		{
			controls: true,
			wheel: true,
			startScale: 1.0,
			maxScale: 3,
			minScale: 0.3,
			scaleSpeed: 1.2
		},
		trashcan: true
	});
	bricklyWorkspace = Blockly.inject('bricklyDiv', { "toolbox": $toolbox });
	blocklyWorkspace.setTheme(Blockly["Themes"]["NepoClassic"]);
	blocklyWorkspace.registerToolboxCategoryCallback('NEPO_VARIABLE', Variables.flyoutCallback);
	blocklyWorkspace.registerToolboxCategoryCallback('NEPO_PROCEDURE', Procedures.flyoutCallback);
	// add default start block
	var xml = Blockly.Xml.textToDom("<xml xmlns='https://developers.google.com/blockly/xml'>" +
		"<block type='controls_start' id='mm;%5J+ugrVfS:/UE}.G' x='200' y='56'>" +
		"<mutation xmlns='http://www.w3.org/1999/xhtml' declare='false'></mutation>" +
		"</block>" +
		"</xml>");
	Blockly.Xml.domToWorkspace(xml, blocklyWorkspace);
	blocklyWorkspace.addChangeListener(function(event) { console.log(event) });
	resizeAll();
	Blockly.svgResize(blocklyWorkspace);
}

function resizeAll() {
	function resizeDiv($div: JQuery, $area: JQuery) {
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
};

function validateSchema(json: object, schema: any): boolean {
	var validate: any = ajv.compile(schema);
	var valid: boolean = validate(json);
	if (!valid) {
		console.error(validate.errors);
	} else {
		console.log("validation against schema " + schema.title + " succeded");
	};
	return valid;
}
function toXml() {
	var output = document.getElementById('importExport');
	var xml = Blockly.Xml.workspaceToDom(blocklyWorkspace);
	(output as any).value = Blockly.Xml.domToPrettyText(xml);
	output.focus();
	(output as any).select();
}

function fromXml() {
	var input = document.getElementById('importExport');
	if (!(input as any).value) {
		return;
	}
	var xml = Blockly.Xml.textToDom((input as any).value);
	Blockly.Xml.domToWorkspace(xml, blocklyWorkspace);
}

$(window).on('resize', function() {
	resizeAll();
});
