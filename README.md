# argparse
argparse is a small option parser for CommonJS. Currently it does not print out 'help'.

# Install
for [node.js](http://nodejs.org/) and [npm](http://github.com/isaacs/npm):
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
	
by default, argparse parses [node.js](http://nodejs.org/)'s `process.argv`. You can also pass in the argv to override this:
	var options = parser.parse(["-xvf", "--atomic=true"])
