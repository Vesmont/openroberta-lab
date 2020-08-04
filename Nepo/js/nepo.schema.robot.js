define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.schema = exports.enumDatatypes = void 0;
    exports.enumDatatypes = ["Number", "Boolean", "String", "Connection", "Image", "Byte"];
    exports.schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "http://open-roberta.org/robot.schema.json",
        "title": "Robot",
        "description": "A robot",
        "type": "object",
        "properties": {
            "robot": { "type": "string" },
            "robotGroup": {
                "type": "string",
            },
            "dataTypes": {
                "type": "array",
                "items": {
                    "enum": exports.enumDatatypes,
                    "minItems": 1,
                    "uniqueItems": true
                }
            },
            "listTypes": {
                "type": "array",
                "items": {
                    "enum": exports.enumDatatypes,
                    "uniqueItems": true
                }
            },
            "sensors": {
                "type": "array"
            }
        },
        "required": ["robot", "robotGroup", "dataTypes", "listTypes", "sensors"]
    };
});
//# sourceMappingURL=nepo.schema.robot.js.map