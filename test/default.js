var nomnom = require("../nomnom"),
    assert = require("assert");

opts = [
  { name: 'config',
    string: '-c',
    default: 'c.json' 
  },
  { name: 'debug',
    string: '--debug=BOOL',
    default: true
  },
  { name: "aname",
    default: 'adef',
  },
  { string: "--bname",
    default: 'bdef',
  },
  { string: "--cname",
    default: 'cdef',
  }
];

var options = nomnom().opts(opts).parseArgs(["-c", "other.json"]);

assert.equal(options.config, "other.json");
assert.strictEqual(options.debug, true);
assert.equal(options.aname, "adef");
assert.equal(options.bname, "bdef");
assert.equal(options.cname, "cdef");