# nomnom
nomnom is an option parser for node and CommonJS. It noms your args and gives them back to you in a hash.

	var options = require("nomnom")
	  .opts({
	    version: {
	      string: '--version',
	      help: 'print version and exit',
	      callback: function() {
	        return "version 1.2.4";
	      }
	    },
	    debug: {
	      string: '-d, --debug',
	      help: 'Print debugging info'
	    },
	    config: {
	      string: '-c PATH, --config=PATH',
	      default: 'config.json',
	      help: 'JSON file with tests to run'
	    }
	  })
	  .parseArgs();

	if(options.debug)
	  // do stuff
	
You don't have to specify anything if you don't want to:

	var options = require("nomnom").parseArgs();

	var url = options[0]; // get the first positional arg
	var debug = options.debug // see if --debug was specified
	var verbose = options.v // see if -v was specified

# Install
for [node.js](http://nodejs.org/) and [npm](http://github.com/isaacs/npm):

	npm install nomnom

# Commands
Nomnom supports command-based interfaces, e.g. with git: `git add -p` and `git rebase -i` where `add` and `rebase` are the commands:

	var parser = nomnom.globalOpts({
	  version: {
	    string: '-v, --version',
	    help: 'print version and exit',
	    callback: function() { return "1.2.4"; }
	  }
	});

	parser.command('sanity')
	  .opts({
	    filename: {
	      position: 1,
	      help: 'test file to run'
	    },
	    config: {
	      string: '-c FILE, --config=FILE',
	      default: 'config.json',
	      help: 'json file with tests to run'
	    }
	  })
	  .callback(function(options) {
	    runSanity(options.filename);
	  })
	  .help("run the sanity tests")
	
	parser.command('browser')
	  .callback(runBrowser)
	  .help("run browser tests");
	
	parser.parseArgs();

# More Details
Nomnom supports args like `-d`, `--debug`, `--no-debug`, `--file=test.txt`, `-f test.txt`, `-xvf`, and positionals.

By default it parses [node](http://nodejs.org/)'s `process.argv`. You can also pass in the args:

	var options = nomnom.parseArgs(["-xvf", "--atomic=true"])
	
Values are JSON parsed, so `--debug=true --count=3 --file=log.txt` would give you:

	{
	  "debug": true,
	  "count": 3,
	  "file": "log.txt"
	}
	
### positional args
All parsed arguments that don't fit the `-a` or `--atomic` format and aren't attached to an option are positional and can be matched on via the `position`:

	var options = nomnom.opts({
	  filename: {
	    position: 0,
	    help: 'file to edit'
	  }
	}).parseArgs();
	
	console.log(options.filename);
	
### callbacks
You can provide a callback that will be executed as soon as the arg is encountered. If the callback returns a string it will print the string and exit:

	var opts = {
	  version: {
	    string: '--version',
	    callback: function() {
	      return "version 1.2.4";
	    }
	  },
	  date: {
	    string: '-d YYYY-MM-DD, --date=YYYY-MM-DD',
	    callback: function(date) {
	      if(!(/^\d{4}\-\d\d\-\d\d$/).test(date))
	        return "date must be in format yyyy-mm-dd";
	    }
	  }
	}
	
	var options = nomnom.opts(opts).parseArgs();

### printing usage
Nomnom prints out a usage message if `--help` or `-h` is an argument. You can override the usage string with `usage`:

	nomnom.usage("node test.js <filename> --debug");
	
override the printing function with `printFunc`:

	nomnom.printFunc(function(usage) {
	  console.log(usage);
	});

and add a line to the usage with `help`:

	nomnom.help("runtests.js will run all the tests in the current directory");

Usage for these options in `test.js`:

	var options = nomnom.opts({
	  command: {
	    position: 0,
	    help: "either 'test', 'run', or 'xpi'" 
	  },
	  config: {
	    string: '-c FILE, --config=FILE',
	    help: 'json file with tests to run',
	  },
	  debug: {
	    string: '-d, --debug',
	    help: 'use debug mode'
	  }
	}).parseArgs();

...would look like this:

	Usage: node test.js <command> [options]
	
	<command>		either 'test', 'run', or 'xpi'
	
	options:
	-c FILE, --config=FILE		json file with tests to run
	-d, --debug		use debug mode
	
Nomnom can't detect the alias used to run your script. You can use the `scriptName` option to print the correct name instead of e.g. `node test.js`:

	nomnom.scriptName("runtests");
