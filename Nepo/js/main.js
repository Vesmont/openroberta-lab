require.config({
    paths: {
        'blockly': '../node_modules/blockly/blockly_compressed',
        'blockly-msg': '../node_modules/blockly/msg/en',
        'jquery': '../node_modules/jquery/dist/jquery.min',
        'ajv': '../node_modules/ajv/dist/ajv.bundle',
        'playground': '../js/playground',
        'blockly-msg': '../node_modules/blockly/msg/en'
    },
    shim: {
        'blockly-msg': {
            deps: ['blockly'],
            exports: 'Blockly'
        }
    }
});
require(['require', 'exports', 'blockly-msg', 'jquery', 'ajv', 'playground'], function (require, exports, Blockly, $, ajv, playground) {
    //var Blockly = require("blockly");
    $(document).ready(function () {
        //var Blockly = require("blockly");
        playground.init();
    });
});
//# sourceMappingURL=main.js.map