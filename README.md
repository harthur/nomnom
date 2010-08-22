# argparse
argparse is a mainly-correct options parser for [node.js](http://nodejs.org/). It parses `process.argv`. Currently it does not print out 'help'.

# Install
using [npm](http://github.com/isaacs/npm):
	git clone http://github.com/harthur/argparse
	cd argparse
	npm install .

# Usage
	var argparse = require("argparse");
	
	var opts = [
	  { name: 'config',
	    string: '-c',
	    full: '--config=PATH',
	    default: 'config.json'},
	
	  { name: 'debug',
	    string: '-d'}
	];
	
	var parser = new argparse.ArgParser(opts);
	var options = parser.parse();

	if(options.debug)
	  // do stuff