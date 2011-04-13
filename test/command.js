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

var browserOpts = {
  port: {
    string: "-p PORT, --port=PORT",
    default: 3000,
    help: "port to run test server on"
  }
}
parser.command('browser', browserOpts, function(options) {
  assert.ok(false, "shouldn't call callback for 'browser' command")
});

var nodeOpts = {
  filename: {
    position: 1,
    help: "test file to run in node"
  },
  config: {
    string: "-c FILE, --config=FILE",
    default: 'config.json',
    help: "json file with tests to run"
  }
};

parser.command('node', nodeOpts, function(options) {
  assert.equal(options.filename, "test.js");
  assert.equal(options.config, "test.json");
  assert.ok(options.debug, "should pick up global arg");
}, "** Run all the node tests **");

parser.parseArgs(["node", "test.js", "-c", "test.json"]);