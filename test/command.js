var nomnom = require("../lib/nomnom"),
    assert = require('assert'),
    sys = require('sys');

var parser = nomnom();

parser.command('browser')
  .opts({
    port: {
      string: "-p PORT, --port=PORT",
      default: 3000,
      help: "port to run test server on"
    }
  })
  .callback(function(options) {
    assert.ok(false, "shouldn't call callback for 'browser' command");
  });

parser.command('node')
  .opts({
    filename: {
      position: 1,
      help: "test file to run in node"
    },
    config: {
      string: "-c FILE, --config=FILE",
      default: 'config.json',
      help: "json file with tests to run"
    }
  })
  .callback(function(options) {
    assert.equal(options.filename, "test.js");
    assert.equal(options.config, "test.json");
    assert.ok(options.debug, "should pick up global arg");
  })
  .help("** Run all the node tests **");

var globalOpts = {
  debug : {
    string: "--debug",
    default: true
  }
};

parser.parseArgs(globalOpts, { argv: ["node", "test.js", "-c", "test.json"] });

/* 
parser.parseArgs(globalOpts, {
  argv: ["notarealcommand", "test.js", "-c", "test.json"],
  printFunc: function(str) {
    assert.ok(/no such command/.test(str), "should notify if unknown command");
  }
});
*/
