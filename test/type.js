var assert = require("assert"),
    nomnom = require("../nomnom");
    
    
var options = nomnom.opts({
   num1 : {
      position: 0
   },
   num2: {
      position: 1,
      type: "string"
   },
   num3: {
      string: "-n count",
      type: "string"
   }
}).parseArgs(["3", "4", "-n", "8"]);

assert.strictEqual(options.num1, 3);
assert.strictEqual(options.num2, "4");
assert.strictEqual(options.num3, "8")