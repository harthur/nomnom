var nomnom = require("../lib/nomnom"),
    sys = require("sys"),
    assert = require("assert");

function strip(str) {
  return str.replace(/\s+/g, '');  
};

var opts = [
  { name: 'config',
    string: '-c, --config=PATH',
    default: 'config.json',
    help: 'JSON config with test info'},

  { name: 'logfile',
    string: '-l LOG'}
];
var parser = new nomnom.ArgParser(opts);
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

var parser = new nomnom.ArgParser(opts);
assert.equal(strip(parser.helpString()), strip("usage: <script> <aname0>\
    <aname1> <aname2> [options] aname0 aname1 aname2 options:-d"));
    
parser = new nomnom.ArgParser(opts, {script: 'test.js'});
assert.equal(strip(parser.helpString()), strip("usage: test.js <aname0>\
        <aname1> <aname2> [options] aname0 aname1 aname2 options:-d"));
