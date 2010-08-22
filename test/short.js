var argparse = require("../lib/argparse"),
    assert = require("assert"),
    sys = require("sys");

var parser = new argparse.ArgParser();
var options = parser.parse(["-cxf"]);

assert.ok(options.c);
assert.ok(options.x);
assert.ok(options.f);
assert.ok(!options.k);

