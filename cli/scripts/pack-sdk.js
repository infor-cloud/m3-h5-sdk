(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "path", "./common"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path = require("path");
    var c = require("./common");
    c.title('Pack M3 Odin SDK');
    execute('pack');
    execute('pack-documentation');
    execute('pack-samples');
    function execute(scriptName) {
        var command = path.join(__dirname, scriptName);
        c.execNodeSync(command);
    }
});
