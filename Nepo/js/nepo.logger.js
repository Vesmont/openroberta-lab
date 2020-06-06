define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Log = void 0;
    var Log = /** @class */ (function () {
        function Log() {
        }
        Log.prototype.error = function (ident, msg) {
            var data = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                data[_i - 2] = arguments[_i];
            }
            this.emitLogMessage("error", ident, msg, data);
            ;
        };
        Log.prototype.warn = function (ident, msg) {
            var data = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                data[_i - 2] = arguments[_i];
            }
            this.emitLogMessage("warn", ident, msg, data);
        };
        Log.prototype.debug = function (ident, msg) {
            var data = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                data[_i - 2] = arguments[_i];
            }
            this.emitLogMessage("debug", ident, msg, data);
        };
        Log.prototype.info = function (ident, msg) {
            var data = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                data[_i - 2] = arguments[_i];
            }
            this.emitLogMessage("info", ident, msg, data);
        };
        Log.prototype.emitLogMessage = function (msgType, ident, msg, data) {
            var logLevel = window.LOG;
            var doLog = false;
            if ((!!logLevel || logLevel === "info") && msgType === "info") {
                doLog = true;
            }
            if (logLevel === "debug" && (msgType === "info" || msgType === "debug")) {
                doLog = true;
            }
            if (logLevel === "warn" && (msgType === "info" || msgType === "debug" || msgType === "warn")) {
                doLog = true;
            }
            if (logLevel === "error" && (msgType === "info" || msgType === "debug" || msgType === "warn" || msgType === "error")) {
                doLog = true;
            }
            if (doLog) {
                if (data.length > 0) {
                    console[msgType]("[" + ident + "] " + msg, data);
                    ;
                }
                else {
                    console[msgType]("[" + ident + "] " + msg);
                }
            }
        };
        return Log;
    }());
    exports.Log = Log;
});
//# sourceMappingURL=nepo.logger.js.map