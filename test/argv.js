var nomnom = require("../lib/nomnom"),
    sys = require("sys");

var opts = [
  { name: 'config',
    string: '-c, --config=PATH',
    default: 'config.json',
    help: 'JSON config with test info'},

  { name: 'logfile',
    string: '-l LOG'}
];
nomnom(opts, {
  printHelp: true,
  printFunc : function(msg) {
    sys.puts("heeeeeeeeeeeelp" + msg);
  }
}).parseArgs();
