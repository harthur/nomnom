var nomnom = require("../nomnom");

exports.testVersion = function(test) {
   test.expect(1);
   
   nomnom().opts({
      date: {
         callback: function(date) {
            test.equal(date, "2010-02-03", "date should match value")
         }
      }
   }).parseArgs(["--date=2010-02-03"]);

   test.done();
}

exports.testReturnString = function(test) {
   test.expect(1);

   nomnom().opts({
      version: {
         flag: true,
         callback: function() {
            return "v0.3";
         }
      }
   })
   .printFunc(function(string) { 
      test.equal(0, string.indexOf("v0.3"))
      test.done();
   })
   .parseArgs(["--version"]);
}