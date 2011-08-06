var nomnom = require("../nomnom");

function strip(str) {
  return str.replace(/\s+/g, '');  
};

var opts = {
   apple: {
      abbr: 'a',
      help: 'how many apples'
   },
   
   banana: {
      full: "b-nana"
   },
   
   carrot: {
      string: '-c NUM, --carrots=NUM'
   },
   
   dill: {
      metavar: 'PICKLE'
   },
   
   egg: {
      position: 0,
      help: 'robin'
   }
}

var parser = nomnom().opts(opts).help("all the best foods").scriptName("test");

var expected = "usage:test<egg>[options]eggrobinoptions:-a,--applehowmanyapples--b-nana-cNUM,--carrots=NUM--dillPICKLEallthebestfoods"

exports.testH = function(test) {
   test.expect(1);

   parser.printFunc(function(string) {
      test.equal(strip(string), expected)
      test.done();
   })
   .parseArgs(["-h"]);
}

exports.testHelp = function(test) {
   test.expect(1);

   parser.printFunc(function(string) {
      test.equal(strip(string), expected)
      test.done();
   })
   .parseArgs(["--help"]);
}

exports.testScriptName = function(test) {
   test.expect(1);

   nomnom()
     .scriptName("test")
     .printFunc(function(string) {
        test.equal(strip(string),"usage:test")
        test.done();
     })
     .parseArgs(["-h"]);
}

exports.testUsage = function(test) {
   test.expect(1);

   parser
      .usage("test usage")
      .printFunc(function(string) {
         test.equal(string, "test usage")
         test.done();
      })
      .parseArgs(["--help"]);   
}

exports.testHidden = function(test) {
   test.expect(1);

   nomnom().opts({
      file: {
         hidden: true
      }
   })
   .scriptName("test")
   .printFunc(function(string) {
      test.equal(strip("usage:test[options]options:"), strip(string))
      test.done();
   })
   .parseArgs(["-h"]);
}
