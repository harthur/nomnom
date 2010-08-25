var nomnom = require("../lib/nomnom"),
    assert = require("assert");

opts = [
  { name: 'aname',
    string: '-a'
  },
  { name: 'cname',
    long: '--config=PATH'
  },
  { name: 'bname',
    string: '--bkey'
  }
];

var parser = new nomnom.ArgParser(opts);
var options = parser.parse(["-a", "--config", "--bkey"]);

assert.ok(options.aname);
assert.ok(options.cname);
assert.ok(options.bname);
assert.ok(!options.a);
assert.ok(!options.config);
assert.ok(!options.bkey);
