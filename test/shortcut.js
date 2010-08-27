var nomnom = require("../lib/nomnom"),
    assert = require("assert");

var opts = [
  { name: 'logfile',
    string: '-l',
    default: 'log.txt'
  }
];

var args = ["--test=test.js", "-l", "test.log"];

var options = (new nomnom.ArgParser(opts)).parse(args);
var shortOpts = nomnom.parseArgs(opts, {}, args);

assert.equal(JSON.stringify(options), JSON.stringify(shortOpts));