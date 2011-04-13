var nomnom = require("../lib/nomnom"),
    assert = require("assert");


var options = nomnom().parseArgs(["--atomic"]);

assert.ok(options.atomic);


opts = [
  { name: 'atomic',
    string: '--atomic'
  },
  { name: 'config',
    string: '--config=PATH'
  },
];

var parser = nomnom(opts);
var options = parser.parseArgs(["--atomic","--config"]);

assert.ok(options.atomic);
assert.ok(options.config);

options = parser.parseArgs(["--atomic=3", "--config=tests.json"]);
assert.equal(options.atomic, 3);
assert.equal(options.config, "tests.json");

