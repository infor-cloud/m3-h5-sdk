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
    c.title('Publish a new M3 Odin version');
    updateVersions();
    publish();
    function updateVersions() {
        var version = getVersion();
        if (!version) {
            var message = 'Version parameter missing';
            console.log(message);
            throw new Error(message);
        }
        var command = path.join(__dirname, 'version') + ' ' + version;
        c.execNodeSync(command);
    }
    function publish() {
        var command = path.join(__dirname, 'publish');
        c.execNodeSync(command);
    }
    function getVersion() {
        var argv = process.argv;
        if (argv.length >= 3) {
            return argv[2];
        }
        return null;
    }
});
