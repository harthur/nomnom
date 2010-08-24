var argparse = require("argparse"),
    sys = require("sys"),
    assert = require("assert");

function strip(str) {
  return str.replace(/\s+/g, '');  
};

var opts = [
  { name: 'config',
    string: '-c',
    long: '--config=PATH',
    default: 'config.json',
    help: 'JSON config with test info'},

  { name: 'logfile',
    string: '-l LOG'}
];
var parser = new argparse.ArgParser(opts);
assert.equal(strip(parser.helpString()), strip("usage:<script>[options]\
    options:-c,--config=PATHJSONconfigwithtestinfo-lLOG"));

var opts = [
  { name: 'aname0',
    position: 0},
    
  { name: 'aname2',
    position: 2},

  { name: 'debug',
    string: '-d'},

  { name: 'aname1',
    position: 1}
];

var parser = new argparse.ArgParser(opts);
assert.equal(strip(parser.helpString()), strip("usage: <script> aname0\
    aname1 aname2 [options]options:-d"));