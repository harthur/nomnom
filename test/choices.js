var nomnom = require("../nomnom"),
    assert = require("assert");
    
var opts = {
  command : {
    position: 0,
    choices: ["run", "test"]
  },
  count: {
    string: '-n count',
    choices: [1, 2, 3]
  }
}

nomnom().opts(opts).printFunc(function(str) {
  assert.equal(str, "command must be one of: run, test");
}).parseArgs(["not"]);

nomnom().opts(opts).printFunc(function(str) {
  assert.ok(false);
}).parseArgs(["run"]);


nomnom().opts(opts).printFunc(function(str) {
  assert.equal(str, "count must be one of: 1, 2, 3");
}).parseArgs(["test", "-n", 7]);


nomnom().opts(opts).printFunc(function(str) {
  assert.ok(false);
}).parseArgs(["test", "-n", 3]);
