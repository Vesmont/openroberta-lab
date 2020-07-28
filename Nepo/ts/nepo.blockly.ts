import * as Blockly from "blockly";
import "nepo.msg";
import "nepo.blockly.overridings";
import "nepo.extensions";
import { Log } from "utils/nepo.logger";

const LOG = new Log();
export abstract class Nepo {
	static dataTypes: Array<string>;
	static dropdownTypes: Array<Array<string>>;

	public static inject(domId: string) {
		domId;
	}

	public static initCommonBlocks(commonBlocks: Array<Blockly.Block>): Array<Object> {
		let b = [];
		for (let block of commonBlocks) {
			let a = {};
			for (let key in block) {
				let keyTmp = key;
				if (key.indexOf("args") >= 0) {
					keyTmp = "args";
				}
				if (key.indexOf("message") >= 0) {
					keyTmp = "message";
				}

				switch (keyTmp) {
					case "type":
					case "output":
					case "mutator":
					case "inputsInline":
					case "style":
					case "extensions":
						a[key] = block[key];
						break;
					case "message":
						this.checkMessages(block, key);
						a[key] = block[key];
						break;
					case "args":
						this.checkOptions(block, key);
						a[key] = block[key];
						break;
					default:
						console.error("error " + keyTmp);
				}
			}
			// define defaults:
			if (!a["output"] && !a["previousStatement"]) {
				a["previousStatement"] = true;
				a["nextStatement"] = true;
			}
			// extensions
			if (!(a["extensions"] instanceof Array)) {
				a["extensions"] = [];
			}
			if (!this.checkExtensionTooltip(a["extensions"])) {
				a["extensions"].push("tooltip_extension");
			}

			b.push(a);
		}
		return b;
	}

	public static defineDatatypes(json: object) {
		this.dataTypes = json["dataTypes"];
		let dropdownTypes: Array<Array<string>> = [];
		Object.values(this.dataTypes).forEach(type => {
			if (!!Blockly.Msg["DATA_TYPE_" + type.toUpperCase()]) {
				dropdownTypes.push([Blockly.Msg["DATA_TYPE_" + type.toUpperCase()], type]);
			} else {
				dropdownTypes.push(["DATA_TYPE_" + type.toUpperCase(), type]);
				LOG.warn("Blockly message does not exists", "DATA_TYPE_" + type.toUpperCase());
			}
		});
		this.dropdownTypes = dropdownTypes;
		LOG.info("defined listTypes", Blockly["listTypes"]);

		Blockly['listTypes'] = json['listTypes'];
		LOG.info("defined listTypes", this.dataTypes);
	}

	public static defineCommonBlocks(commonBlocks: Object[]) {
		let commonBlocksExtended = commonBlocks;
		Blockly.defineBlocksWithJsonArray(commonBlocksExtended);
	}

	static checkExtensionTooltip(extensions: string[]) {
		for (var ex in extensions) {
			if (extensions[ex].indexOf("tooltip") >= 0) {
				return true;
			}
		}
		return false;
	};

	static checkMessages(block: Blockly.Block, key: string) {
		let value = block[key];
		let reg = new RegExp("message" + "(\\d+)");
		let m = key.match(reg);
		let title = "%{BKY_" + block.type.toUpperCase() + "_TITLE}";

		if (m != null) {
			if (m[1] == "0") {
				if (value.indexOf("BKY") >= 0 && !value.startsWith(title)) {
					console.warn("Missing title in " + block.type.toUpperCase() + ": " + value);
					return;
				}
			}
			if (value.indexOf("BKY") >= 0) {
				let mes = value.slice(6, value.indexOf("}"));
				if (Blockly.Msg[mes] == undefined) {
					console.warn("No message for " + value + " defined!");
				} else {
					console.log(mes);
				}
			}
		} else {
			console.warn("Bad key for message: " + key);
			return;
		}
	};

	static checkOptions(block: Blockly.Block, key: string) {
		if (block[key] instanceof Array) {
			block[key].forEach(element => {
				if (element["options"] && element["options"] instanceof Array) {
					element["options"].forEach(option => {
						if (option[0].indexOf("BKY") >= 0) {
							let mes = option[0].slice(6, option[0].indexOf("}"));
							if (Blockly.Msg[mes] == undefined) {
								console.warn("No message for " + option[0] + " defined!");
							} else {
								console.log(mes);
							}
						}
					});
				}
			});
		}
	};
}

