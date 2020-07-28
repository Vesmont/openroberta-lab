define(["require", "exports", "blockly", "utils/nepo.logger", "nepo.msg", "nepo.blockly.overridings", "nepo.extensions"], function (require, exports, Blockly, nepo_logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Nepo = void 0;
    var LOG = new nepo_logger_1.Log();
    var Nepo = /** @class */ (function () {
        function Nepo() {
        }
        Nepo.inject = function (domId) {
            domId;
        };
        Nepo.initCommonBlocks = function (commonBlocks) {
            var b = [];
            for (var _i = 0, commonBlocks_1 = commonBlocks; _i < commonBlocks_1.length; _i++) {
                var block = commonBlocks_1[_i];
                var a = {};
                for (var key in block) {
                    var keyTmp = key;
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
        };
        Nepo.defineDatatypes = function (json) {
            this.dataTypes = json["dataTypes"];
            var dropdownTypes = [];
            Object.values(this.dataTypes).forEach(function (type) {
                if (!!Blockly.Msg["DATA_TYPE_" + type.toUpperCase()]) {
                    dropdownTypes.push([Blockly.Msg["DATA_TYPE_" + type.toUpperCase()], type]);
                }
                else {
                    dropdownTypes.push(["DATA_TYPE_" + type.toUpperCase(), type]);
                    LOG.warn("Blockly message does not exists", "DATA_TYPE_" + type.toUpperCase());
                }
            });
            this.dropdownTypes = dropdownTypes;
            LOG.info("defined listTypes", Blockly["listTypes"]);
            Blockly['listTypes'] = json['listTypes'];
            LOG.info("defined listTypes", this.dataTypes);
        };
        Nepo.defineCommonBlocks = function (commonBlocks) {
            var commonBlocksExtended = commonBlocks;
            Blockly.defineBlocksWithJsonArray(commonBlocksExtended);
        };
        Nepo.checkExtensionTooltip = function (extensions) {
            for (var ex in extensions) {
                if (extensions[ex].indexOf("tooltip") >= 0) {
                    return true;
                }
            }
            return false;
        };
        ;
        Nepo.checkMessages = function (block, key) {
            var value = block[key];
            var reg = new RegExp("message" + "(\\d+)");
            var m = key.match(reg);
            var title = "%{BKY_" + block.type.toUpperCase() + "_TITLE}";
            if (m != null) {
                if (m[1] == "0") {
                    if (value.indexOf("BKY") >= 0 && !value.startsWith(title)) {
                        console.warn("Missing title in " + block.type.toUpperCase() + ": " + value);
                        return;
                    }
                }
                if (value.indexOf("BKY") >= 0) {
                    var mes = value.slice(6, value.indexOf("}"));
                    if (Blockly.Msg[mes] == undefined) {
                        console.warn("No message for " + value + " defined!");
                    }
                    else {
                        console.log(mes);
                    }
                }
            }
            else {
                console.warn("Bad key for message: " + key);
                return;
            }
        };
        ;
        Nepo.checkOptions = function (block, key) {
            if (block[key] instanceof Array) {
                block[key].forEach(function (element) {
                    if (element["options"] && element["options"] instanceof Array) {
                        element["options"].forEach(function (option) {
                            if (option[0].indexOf("BKY") >= 0) {
                                var mes = option[0].slice(6, option[0].indexOf("}"));
                                if (Blockly.Msg[mes] == undefined) {
                                    console.warn("No message for " + option[0] + " defined!");
                                }
                                else {
                                    console.log(mes);
                                }
                            }
                        });
                    }
                });
            }
        };
        ;
        return Nepo;
    }());
    exports.Nepo = Nepo;
});
//# sourceMappingURL=nepo.blockly.js.map