var nomnom = require("../lib/nomnom"),
    assert = require("assert");

var options = nomnom.parseArgs([], {}, ["-cxf"]);

assert.ok(options.c);
assert.ok(options.x);
assert.ok(options.f);
assert.ok(!options.k);


var opts = [
  { name: 'logfile',
    string: '-l FILE'}
];

var options = nomnom.parseArgs(opts, {}, ["-l"]);

assert.ok(options.logfile);
assert.ok(!options.F);