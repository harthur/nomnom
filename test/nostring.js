var nomnom = require("../nomnom"),
    assert = require("assert");

var opts = {
  logfile : {
    string: '-l FILE'
  },
  version: {
    string: '-v, --version'
  },
  config: {
    string: '-c FILE, --config=FILE'
  },
  numLines: {
    string: '--num-lines=NUM, -n NUM'
  }
};

var opts2 = {
  logfile : {
    abbr: 'l',
    metavar: 'FILE'
  },
  version: {
    abbr: 'v',
  },
  config: {
    abbr: 'c',
    full: 'config',
    metavar: 'FILE'
  },
  numLines: {
     abbr: 'n',
     full: 'num-lines',
     expectsValue: true
  }
};

var argv = ["--logfile", "log.txt", "--num-lines=4", "-v", "--config=test.js"];
var options = nomnom().opts(opts).parseArgs(argv);
var options2 = nomnom().opts(opts2).parseArgs(argv);

assert.equal(options.logfile, "log.txt");
assert.equal(options.numLines, 4);
assert.equal(options.config, "test.js");
assert.ok(options.version);

assert.deepEqual(options, options2);
