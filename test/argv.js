var argparse = require("argparse"),
    sys = require("sys");

var opts = [
  { name: 'config',
    string: '-c',
    long: '--config=PATH',
    default: 'config.json',
    help: 'JSON config with test info'},

  { name: 'logfile',
    string: '-l LOG'}
];
var parser = new argparse.ArgParser(opts, {printHelp: true, printFunc : function(msg) {
  sys.puts("heeeeeeeeeeeelp" + msg);
}});
parser.parse();