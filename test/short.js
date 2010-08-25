var nomnom = require("../lib/nomnom"),
    assert = require("assert");

var parser = new nomnom.ArgParser();
var options = parser.parse(["-cxf"]);

assert.ok(options.c);
assert.ok(options.x);
assert.ok(options.f);
assert.ok(!options.k);

var opts = [
  { name: 'logfile',
    string: '-l FILE'
  }
];

parser = new nomnom.ArgParser(opts);
var options = parser.parse(["-l"]);

assert.ok(options.logfile);
assert.ok(!options.F);