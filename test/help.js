var argparse = require("argparse"),
    sys = require("sys"),
    assert = require("assert");

var opts = [
  { name: 'config',
    string: '-c',
    full: '--config=PATH',
    default: 'config.json',
    help: 'JSON config with test info'},

  { name: 'logfile',
    string: '-l LOG'}
];

var parser = new argparse.ArgParser(opts);

function strip(str) {
  return str.replace(/\s+/g, '');  
};

assert.equal(strip(parser.helpString()), strip("-c, --config=PATH	JSON config with test info-l LOG"))
