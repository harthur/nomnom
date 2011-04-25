var nomnom = require("../nomnom"),
    assert = require('assert');
    
var opts = {
  version: {
    string: '--version',
    callback: function() {
      assert.ok(true, "called version callback");
    }
  },
  date: {
    string: '-d YYYY-MM-DD, --date=YYYY-MM-DD',
    callback: function(date) {
      assert.equal(date, "2010-02-03", "date should match value")
    }
  }
}

var options = nomnom().opts(opts).parseArgs(["--version", "--date=2010-02-03"]);

/* // exits process
nomnom().opts({
  version: {
    string: '--version',
    callback: function() {
      return "called version callback";
    }
  }
}).parseArgs(["--version"]);

assert.ok(false, "should have exited when --version specified");
*/