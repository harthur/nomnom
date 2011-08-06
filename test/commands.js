var nomnom = require("../nomnom");

function strip(str) {
  return str.replace(/\s+/g, '');  
}

exports.testCallback = function(test) {
   test.expect(1);

   var parser = nomnom();
   parser.command('run').callback(function(options) {
      test.equal(options.v, 3);
   });
   parser.command('other').callback(function() {
      test.ok(false, "callback for other command shouldn't be called");
   });

   parser.parseArgs(["run","-v", "3"]);
   test.done();
}

exports.testMissingCommand = function(test) {
   test.expect(1);

   var parser = nomnom().scriptName("test");

   parser.command('run');

   parser.printFunc(function(string) {
      test.equal(string, "test: no such command 'other'");
      test.done();
   });

   parser.parseArgs(["other"]);
}

exports.testNoCommand = function(test) {
   test.expect(2);

   var parser = nomnom().opts({
      version: {
         flag: true
      }
   })
   .callback(function(options) {
      test.strictEqual(options.version, true);
   });

   parser.command('run');

   var options = parser.parseArgs(["--version"]);
   
   test.strictEqual(options.version, true);
   test.done();
}

exports.testUsage = function(test) {
   test.expect(3);

   var parser = nomnom().scriptName("test")
      .globalOpts({
         debug: {
            flag: true
         }
      })
      .opts({
         verbose: {
            flag: true
         }
      });
 
   parser.command('run')
     .opts({
        file: {
           help: 'file to run'
        }
     })
     .help("run all");

   parser.command('test').usage("test usage");

   parser.printFunc(function(string) {
      test.equal(strip(string), "usage:test<command>[options]commandoneof:run,testoptions:--verbose--debug");
   });

   parser.parseArgs(["-h"]);

   parser.printFunc(function(string) {
      test.equal(strip(string), "usage:testrun[options]options:--filefiletorun--debugrunall");
   });

   parser.parseArgs(["run", "-h"]);

   parser.printFunc(function(string) {
      test.equal(strip(string), "testusage");
   });

   parser.parseArgs(["test", "-h"]);
   
   test.done();
}