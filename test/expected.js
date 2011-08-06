var nomnom = require("../nomnom");

var opts = {
   file: {
      position: 0,
      required: true
   }  
}

var parser = nomnom().opts(opts);

exports.testFlag = function(test) {
   test.expect(1);

   nomnom().opts({
      file: {
         position: 0,
      }
   })
   .printFunc(function(string) {      
      test.equal(0, string.indexOf("'--key1' expects a value"))
      test.done();
   })
   .parseArgs(["--key1"]);
}

exports.testRequired = function(test) {
   test.expect(1);

   nomnom().opts({
      file: {
         required: true
      }
   })
   .printFunc(function(string) {      
      test.equal(0, string.indexOf("file argument is required"))
      test.done();
   })
   .parseArgs([]);
}

exports.testChoices = function(test) {
   test.expect(1);

   nomnom().opts({
      color: {
         choices: ['green', 'blue']
      }
   })
   .printFunc(function(string) {
      test.equal(0, string.indexOf("color must be one of: green, blue"))
      test.done();
   })
   .parseArgs(['--color', 'red']);
}
