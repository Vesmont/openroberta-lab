export const enumDatatypes = ["Number", "Boolean", "String", "Connection", "Image", "Byte"];

export const schema = {
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
				"enum": enumDatatypes,
				"minItems": 1,
				"uniqueItems": true
			}
		},
		"listTypes": {
			"type": "array",
			"items": {
				"enum": enumDatatypes,
				"uniqueItems": true
			}
		},
		"sensors": {
			"type": "array"
		}
	},
	"required": ["robot", "robotGroup", "dataTypes", "listTypes", "sensors"]
};