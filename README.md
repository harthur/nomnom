# argparse
argparse is a small option parser for CommonJS.

# Install
for [node.js](http://nodejs.org/) and [npm](http://github.com/isaacs/npm):
	git clone http://github.com/harthur/argparse
	cd argparse
	npm install .

# Usage
	var argparse = require("argparse");
	
	var opts = [
	  { name: 'config',
	    string: '-c PATH',
	    full: '--config=PATH',
	    default: 'config.json',
	    help: 'JSON file with tests to run'},
	
	  { name: 'debug',
	    string: '-d'}
	];
	
	var parser = new argparse.ArgParser(opts);
	var options = parser.parse();

	if(options.debug)
	  // do stuff
	
by default, argparse parses [node.js](http://nodejs.org/)'s `process.argv`. You can also pass in the argv:
	var options = parser.parse(["-xvf", "--atomic=true"])
	
you can get a help string for the options:
	var msg = parser.helpString();
