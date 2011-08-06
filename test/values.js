var nomnom = require("../nomnom");

var opts = {
   debug: {
      flag: true
   },
   verbose: {
      flag: true,
      default: true
   },
   list1: {
      list: true
   },
   list2: {
      list: true
   },
   num1: {
      type: "string"
   },
   def1: {
      default: "val1"
   },
   def2: {
      default: "val1"
   }
}

var parser = nomnom().opts(opts);

exports.testFlag = function(test) {
   var options = parser.parseArgs(["--debug", "pos0", "--no-verbose"]);

   test.strictEqual(options.debug, true);
   test.strictEqual(options.verbose, false);
   test.equal(options[0], "pos0");
   test.equal(options._[0], "pos0");
   test.done();
}

exports.testList = function(test) {
   var options = parser.parseArgs(["--list1=val0", "--list2", "val1",
     "--list2", "val2"]);
  
   test.deepEqual(options.list1, ["val0"]);
   test.deepEqual(options.list2, ["val1", "val2"]);
   test.done();
}

exports.testString = function(test) {
   var options = parser.parseArgs(["--num1", "4"]);

   test.strictEqual(options.num1, "4");
   test.done();
}

exports.testDefault = function(test) {
   var options = parser.parseArgs(["--def2", "val2", "--def3", "val3"]);

   test.strictEqual(options.def1, "val1");
   test.strictEqual(options.def2, "val2");
   test.strictEqual(options.def3, "val3");
   test.done();
}


