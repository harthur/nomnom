var argparse = require("../lib/argparse"),
    assert = require("assert"),
    sys = require("sys");

opts = [
  { name: 'config',
    string: '-c',
    default: 'c.json' 
  },
  { name: 'debug',
    full: '--debug=BOOL',
    default: true
  }
];

var parser = new argparse.ArgParser(opts);
var options = parser.parse(["-c", "other.json", "--debug=false"]);

assert.equal(options.config, "other.json");
assert.equal(options.debug, false);


var options = parser.parse(["-c", "--debug"]);

assert.equal(options.config, "c.json");
assert.equal(options.debug, true);