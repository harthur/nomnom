# argparse
argparse is a mainly-correct options parser for [node.js](http://nodejs.org/). It parses `process.argv`. Currently it does not print out 'help'.

# Install
using [npm](http://github.com/isaacs/npm):
	git clone http://github.com/harthur/argparse
	cd argparse
	npm install .

# Usage
	var argparse = require("argparse");
	
	var options = [
	  { name: 'config',
	    flag: '-c',
	    full: '--config=PATH TO CONFIG',
	    default: 'config.json'},
	
	  { name: 'debug',
	    flag: '-d'}
	];
	
	var parser = new argparse.ArgParser(options);
	var options = parser.parse();

	if(options.debug)
	  // do stuff