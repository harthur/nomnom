var argparse = require("../lib/argparse"),
    assert = require("assert"),
    sys = require("sys");


var parser = new argparse.ArgParser();
var options = parser.parse(["--atomic"]);

assert.ok(options.atomic);


opts = [
  { name: 'atomic',
    string: '--atomic'
  },
  { name: 'config',
    full: '--config=PATH'
  },
];

var parser = new argparse.ArgParser(opts);
var options = parser.parse(["--atomic","--config"]);

assert.ok(options.atomic);
assert.ok(options.config);

options = parser.parse(["--atomic=3", "--config=tests.json"]);
assert.equal(options.atomic, 3);
assert.equal(options.config, "tests.json");

