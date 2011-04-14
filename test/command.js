var nomnom = require("../lib/nomnom"),
    assert = require('assert'),
    sys = require('sys');

var opts = {
  version: {
    string: "-v, --version",
    help: "print version info"
  },
  debug: {
    string: '-d, --debug',
    default: true
  }
}
var parser = nomnom(opts);


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
    sys.puts('in node command');
    assert.equal(options.filename, "test.js");
    assert.equal(options.config, "test.json");
    assert.ok(options.debug, "should pick up global arg");
  })
  .help("** Run all the node tests **");

parser.parseArgs(["node", "test.js", "-c", "test.json"]);