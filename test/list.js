var nomnom = require("../nomnom"),
    assert = require("assert");
    
    
var options = nomnom().opts({
    file: {
      string: "--file=FILE",
      list: true
    },
    counts: {
      string: "-c X",
      list: true
    }
  })
  .parseArgs(["--file=f1", "-c", "3", "--file=f2", "-c", "4"]);

assert.deepEqual(options.file, ["f1", "f2"]);
assert.deepEqual(options.counts, [3, 4]);

var options = nomnom().opts({
    files : {
      position: 1,
      list: true
    }
  })
  .parseArgs(["f1", "-d", "f2", "f3"]);
  
assert.deepEqual(options.files, ["f2", "f3"]);