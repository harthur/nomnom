# nomnom
nomnom is an option parser for node and CommonJS. It noms your args and gives them back to you in a hash.

```javascript
var options = require("nomnom")
    .opts({
        debug : {
            abbr: 'd',
            help: 'Print debugging info'
        },
        version: {
            help: 'print version and exit',
            callback: function() {
                return "version 1.2.4";
            }
        },
        config: {
            abbr: 'c',
            default: 'config.json',
            help: 'JSON file with tests to run'
        }
    })
    .parseArgs();

if(options.debug)
    // do stuff
```
	
You don't have to specify anything if you don't want to:

```javascript
var options = require("nomnom").parseArgs();

var url = options[0];      // get the first positional arg
var debug = options.debug  // see if --debug was specified
var verbose = options.v    // see if -v was specified
var extras = options._     // get an array of the unmatched, positional args
```

# Install
for [node.js](http://nodejs.org/) and [npm](http://github.com/isaacs/npm):

	npm install nomnom

# More Details
Nomnom supports args like `-d`, `--debug`, `--no-debug`, `--file=test.txt`, `--file test.txt`, `-f test.txt`, `-xvf`, and positionals. Positionals are arguments that don't fit the `-a` or `--atomic` format and aren't attached to an option.

Values are JSON parsed, so `--debug=true --count=3 --file=log.txt` would give you:

```
{
    "debug": true,
    "count": 3,
    "file": "log.txt"
}
```

# Commands
Nomnom supports command-based interfaces (e.g. with git: `git add -p` and `git rebase -i` where `add` and `rebase` are the commands):

```javascript
var parser = require("nomnom");

parser.command('browser')
    .callback(runBrowser)
    .help("run browser tests");

parser.command('sanity')
    .opts({
        filename: {
            position: 1,
            help: 'test file to run'
        },
        config: {
            abbr: 'c',
            metavar: 'FILE',
            default: 'config.json',
            help: 'json file with tests to run'
        }
    })
    .callback(function(options) {
         runSanity(options.filename);
    })
    .help("run the sanity tests")

parser.parseArgs();
```

Each command generates its own usage message when `-h` or `--help` is specified with the command.

# Usage
Nomnom prints out a usage message if `--help` or `-h` is an argument. Usage for these options in `test.js`:

```javascript
var options = require("nomnom")
    .scriptName("runtests")
    .opts({
        path: {
            position: 0,
            help: "Test file to run",
            list: true
        },
        config: {
            abbr: 'c',
            metavar: 'FILE',
            help: "Config file with tests to run"
        },
        debug: {
            abbr: 'd',
            help: "Print debugging info"
        }
    }).parseArgs();
```

...would look like this:

	usage: runtests <path>... [options]

	path     Test file to run

	options:
	   -c FILE, --config=FILE   Config file with tests to run
	   -d, --debug              Print debugging info

# Options hash
The options hash that is passed to `nomnom.opts()` is a hash keyed on option name. Each option specification can have the following fields:

#### abbr, full, and metavar
`abbr` is the single character string to match to this option, `full` is the full-length string (defaults to the name of the option). `metavar` is used in the usage printout and specifies that the option expects a value, `expectsValue` can also be set to `true` for this purpose (default is `false`).

This option matches `-d` and `--debug` on the command line:

```javascript
debug: {
  abbr: 'd'
}
```

This option matches `-n 3`, `--num-lines 12` on the command line:

```javascript
numLines: {
   abbr: 'n',
   full: 'num-lines',
   expectsValue: true
}
```

as does:

```javascript
numLines: {
   abbr: 'n',
   full: 'num-lines',
   metavar: "NUM"
}
```

#### string

A shorthand for `abbr`, `full`, and `metavar`. For example, to attach an options to `-c` and `--config` and require an argument use a `string: "-c FILE, --config=FILE"`

#### help

A string description of the option for the usage printout.

#### default

The value to give the option if it's not specified in the arguments.

#### callback

A callback that will be executed as soon as the option is encountered. If the callback returns a string it will print the string and exit:

```javascript

count: {
    expectsValue: true,
    callback: function(count) {
        if(count != parseInt(count))
            return "count must be an integer";
    }
}
```

#### position

The position of the option if it's a positional argument. If the option should be matched to the first positional arg use position `0`

#### list

Specifies that the option is a list. Appending can be achieved by specifying the arg more than once on the command line:

	node test.js --file=test1.js --file=test2.js

If the option has a `position` and `list` is `true`, all positional args including and after `position` will be appended to the array.

#### required

If this is set to `true` and the option isn't in the args, a message will be printed and the program will exit.

#### choices

A list of the possible values for the option (e.g. `['run', 'test', 'open']`). If the parsed value isn't in the list a message will be printed and the program will exit.

#### type

If you don't want the option JSON-parsed, specify type `"string"`.

#### hidden

Option won't be printed in the usage


# Parser interface
`require("nomnom")` will give you the option parser. You can also make an instance of a parser with `require("nomnom")()`. You can chain any of these functions off of a parser:

#### opts

The options hash.

#### usage

The string that will override the default generated usage message.

#### help

A string that is appended to the usage.

#### scriptName

Nomnom can't detect the alias used to run your script. You can use `scriptName` to provide the correct name instead of e.g. `node test.js`.

#### printFunc

Overrides the usage printing function.

#### command

Takes a command name and gives you a command object on which you can chain command options.

#### callback

A callback that will be called with the parsed options. If a command is expected, this is the fallback callback when no command is specified.

#### globalOpts

The global options when commands are specified. Any options in here will be included in the usage string for any command.

#### parseArgs

Parses node's `process.argv` and returns the parsed options hash. You can also provide argv:

```javascript
var options = nomnom.parseArgs(["-xvf", "--atomic=true"])
```

# Command interface
A command is specified with `nomnom.command('name')`. All these functions can be chained on a command:

#### opts

The options for this command.

#### callback

A callback that will be called with the parsed options when the command is used.

#### help

A help string describing the function of this command.

#### usage

Override the default generated usage string for this command.
