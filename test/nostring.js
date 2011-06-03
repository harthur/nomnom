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
  }
};

var opts2 = {
  logfile : {
    abbr: 'l',
    metavar: 'FILE'
  },
  version: {
    abbr: 'v',
    full: 'version'
  },
  config: {
    abbr: 'c',
    full: 'config',
    metavar: 'FILE'
  }
};

var argv = ["-l", "log.txt", "-v", "--config=test.js"];
var options = nomnom().opts(opts).parseArgs(argv);
var options2 = nomnom().opts(opts2).parseArgs(argv);

assert.deepEqual(options, options2);
