var nomnom = require("../nomnom"),
    sys = require("sys"),
    assert = require("assert");

function strip(str) {
  return str.replace(/\s+/g, '');  
};

var opts = {
  config: {
    string: '-c, --config=PATH',
    default: 'config.json',
    help: 'JSON config with test info'
  },
  logfile : {
    string: '-l LOG'
  },
  pos0: {
    position: 0,
    string: '<files>'
  },
  pos1: {
    position: 1
  }
};

var parser = nomnom();
parser.parseArgs(opts, {script: 'test.js', printHelp: false});

assert.equal(strip(parser.getUsage()), strip("usage:test.js<files><pos1>[options]<files>pos1options:-c,--config=PATHJSONconfigwithtestinfo-lLOG"));
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

parser = nomnom();
parser.parseArgs(opts, {script: 'test.js', printHelp: false});

assert.equal(strip(parser.getUsage()), strip("usage:test.js<aname0><aname1><aname2>[options]aname0aname1aname2options:-d"));
