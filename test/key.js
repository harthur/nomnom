var argparse = require("../lib/argparse"),
    assert = require("assert"),
    sys = require("sys");

opts = [
  { name: 'aname',
    flag: '-a'
  },
  { name: 'cname',
    full: '--config=PATH'
  }
];

var parser = new argparse.ArgParser(opts);
var options = parser.parse(["-a", "--config"]);

assert.ok(options.aname);
assert.ok(options.cname);
assert.ok(!options.a);
assert.ok(!options.config);
