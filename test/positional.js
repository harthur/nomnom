var argparse = require("../lib/argparse"),
    assert = require("assert");


var opts = [
  { name: 'config',
    position: 0
  },
  {
    name: 'test',
    position: 1,
    default: 'def.js'
  }
];

parser = new argparse.ArgParser(opts);
var options = parser.parse(["config.json", "test.js", "-v", "git"]);

assert.equal(options.config, "config.json");
assert.equal(options.test, "test.js");
assert.equal(options.v, "git");

options = parser.parse(["config.json", "-v", "git", "extra"]);

assert.equal(options.config, "config.json");
assert.equal(options.test, "def.js");
assert.equal(options.v, "git");
assert.ok(!options.extra);

// positional that wasn't specified in opts
options = parser.parse(["config.json", "pos1", "pos3"]);
assert.equal(options[2], "pos3");

// make sure we don't parse 'node test/runtests.js'
options = parser.parse();
assert.ok(!options.config);
assert.equal(options.test,"def.js");