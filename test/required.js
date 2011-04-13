var nomnom = require("../lib/nomnom"),
    assert = require("assert");
    
var opts = {
  filename : {
    position: 0,
    required: true
  }
}

nomnom(opts, {
  printFunc : function(str) {
   assert.equal(str, "filename argument is required");
 }
}).parseArgs([]);

nomnom(opts).parseArgs([]);

assert.ok(false, "program should have exited when required arg wasn't present");