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
	    long: '--config=PATH',
	    default: 'config.json',
	    help: 'JSON file with tests to run'},
	
	  { name: 'debug',
	    string: '-d'}
	];
	
	var parser = new argparse.ArgParser(opts);
	var options = parser.parse();

	if(options.debug)
	  // do stuff

	
By default, argparse parses [node](http://nodejs.org/)'s `process.argv`. You can also pass in the args:
	var options = parser.parse(["-xvf", "--atomic=true"])
	
All parsed arguments that don't follow the form '-a' or '--atomic' and can't be attached to an option are positional and can be matched on via the `position`:
	var opts = [
	  { name: 'filename',
	    position: 0,
	    default: 'test.js'},
	];
	
	var parser = new argparse.ArgParser(opts);
	var options = parser.parse();
	
	sys.puts(options.filename);
	
Argparse prints out a usage message if `--help` or `-h` is an argument. You can disable this with the `printHelp` flag and specify the printing function with `printFunc` if you're not using node:

	var parser = new argparse.ArgParser(opts, {printHelp: false});
