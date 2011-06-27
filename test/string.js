var nomnom = require("../nomnom"),
    assert = require("assert");

var opts = {
  logfile : {
    string: '-l FILE'
  },
  version: {
    string: '-v, --version'
  },
  config: {
    string: '-c FILE, --config=FILE'
  },
  key: {
    string: '-k val, --key val'
  },
  key2: {
    string: '--key2=val'
  },
  key3: {
    string: '--key3=val, -y val'
  }
};

var argv = ["-l", "log.txt", "-v", "pos0", "--config=test.js", "--key", "aval", "--key2", "80", "--key3=aval"];
var options = nomnom().opts(opts).parseArgs(argv);

assert.equal(options.logfile, "log.txt");
assert.equal(options.version, true);
assert.equal(options[0], "pos0");
assert.equal(options.config, "test.js");
assert.equal(options.key, "aval");
assert.equal(options.key2, 80);
assert.equal(options.key3, "aval")
