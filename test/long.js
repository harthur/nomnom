var nomnom = require("../lib/nomnom"),
    assert = require("assert");


var parser = new nomnom.ArgParser();
var options = parser.parse(["--atomic"]);

assert.ok(options.atomic);


opts = [
  { name: 'atomic',
    string: '--atomic'
  },
  { name: 'config',
    string: '--config=PATH'
  },
];

var parser = new nomnom.ArgParser(opts);
var options = parser.parse(["--atomic","--config"]);

assert.ok(options.atomic);
assert.ok(options.config);

options = parser.parse(["--atomic=3", "--config=tests.json"]);
assert.equal(options.atomic, 3);
assert.equal(options.config, "tests.json");

