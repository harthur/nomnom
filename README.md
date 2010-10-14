# nomnom
nomnom is a small option parser for node and CommonJS. It just parses your args and gives them back to you in a hash.

	var nomnom = require("nomnom");
	
	var opts = [
	  { name: 'config',
	    string: '-c PATH, --config=PATH',
	    default: 'config.json',
	    help: 'JSON file with tests to run'},
	
	  { name: 'debug',
	    string: '-d'}
	];
	
	var options = nomnom.parseArgs(opts);

	if(options.debug)
	  // do stuff

# Install
for [node.js](http://nodejs.org/) and [npm](http://github.com/isaacs/npm):
	git clone http://github.com/harthur/nomnomargs.git
	cd nomnomargs
	npm install .

# More Details
By default, nomnom parses [node](http://nodejs.org/)'s `process.argv`. You can also pass in the args:
	var options = nomnom.parseArgs(opts, {}, ["-xvf", "--atomic=true"])
	
All parsed arguments that don't fit the `-a` or `--atomic` format and aren't attached to an option are positional and can be matched on via the `position`:
	var opts = [
	  { name: 'filename',
	    position: 0 }
	];
	var options = nomnom.parseArgs(opts);
	
	sys.puts(options.filename);
	
You don't even have to specify anything if you don't want to:
	var options = nomnom.parseArgs();
	
	var url = options[0]; // get the first positional arg
	var debug = options.debug // see if --debug was specified
	
Nomnom prints out a usage message if `--help` or `-h` is an argument. You can disable this with the `printHelp` flag and specify the printing function with `printFunc` if you're not using node:

	nomnom.parseArgs(opts, {printHelp: false});
