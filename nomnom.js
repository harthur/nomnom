var _ = require("underscore")._;

module.exports = ArgParser;

// for nomnom.parseArgs()
var argParser = ArgParser();
for(var i in argParser) {
  if(typeof argParser[i] == "function")
    ArgParser[i] = argParser[i];
}

function ArgParser() {

  function opt(arg) {
    // get the specified opt for this parsed arg
    var match = Opt({});
    parser.specs.forEach(function(opt) {
      if(opt.matches(arg))
        match = opt;
    });
    return match;
  };
  
  function setOption(options, arg, value) {
    var option = opt(arg);
    if(option.callback) {
      var message = option.callback(value);
      if(typeof message == "string") {
        parser.print(message);
      }
    }
    var name = option.name || arg;
    if(option.list) {
      if(!options[name])
        options[name] = [value];
      else
        options[name].push(value);
    }
    else
      options[name] = value;
  };
  
  var parser = {
    commands : {},    
    specs: {},

    command : function(name) {
      var command = parser.commands[name] = {
        name: name,
        specs: {}
      };

      // facilitates command('name').opts().callback().help()
      var chain = {
        opts : function(specs) {
          command.specs = specs;
          return chain;
        },
        callback : function(callback) {
          command.callback = callback;
          return chain;
        },
        help : function(help) {
          command.help = help;
          return chain;
        }
      };
      return chain;
    },
    
    globalOpts : function(specs) {
      parser.globalSpecs = specs;
      return parser;
    },
    
    opts : function(specs) {
      parser.specs = specs;
      return parser;
    },
    
    callback : function(fallbackCb) {
      parser.fallbackCb = fallbackCb;
      return parser;
    },
    
    usage : function(usageString) {
      parser.usageString = usageString;
      return parser;
    },
    
    printFunc : function(print) {
      parser.print = print;
      return parser;
    },
    
    scriptName : function(script) {
      parser.script = script;
      return parser;
    },
  
    help : function(helpString) {
      parser.helpString = helpString;
      return parser;
    },
  
    parseArgs : function(argv, parserOpts) {
      var printHelp = true;
      if(argv && (!argv.length || typeof argv[0] != "string")) {
        // using old API
        parserOpts = parserOpts || {};
        parser.specs = argv;
        parser.script = parserOpts.script;
        parser.print = parserOpts.pringFunc;
        printHelp = parserOpts.printHelp;
        if(printHelp === undefined)
          printHelp = true;
        argv = parserOpts.argv;
      }
      parser.print = parser.print || function(str) {
        require("sys").puts(str);
        process.exit(0);
      };
      parser.helpString = parser.helpString || "";
      parser.script = parser.script || process.argv[0] + " "
            + require('path').basename(process.argv[1]);
      
      parser.specs = parser.specs || {};
      var argv = argv || process.argv.slice(2);

      var commandName;
      if(JSON.stringify(parser.commands) != "{}") {
        if(argv.length && Arg(argv[0]).isValue)
          commandName = argv[0];

        if(!commandName) {
          // no command but command expected e.g. 'git -h'
          parser.specs.command = {
            position: 0,
            help: 'one of: ' + _(parser.commands).keys().join(", ")
          }
          _(parser.specs).extend(parser.globalSpecs);
        }
        else {
          // command specified e.g. 'git add -p'
          var command = parser.commands[commandName];
          if(!command)
            parser.print(parser.script + ": no such command '" + commandName + "'");  
          parser.specs = _(command.specs).extend(parser.globalSpecs);  
          parser.script += " " + command.name;
          if(command.help)
            parser.helpString = command.help;
        }
      }

      if(parser.specs.length === undefined) {
        // specs is a hash not an array
        parser.specs = _(parser.specs).map(function(opt, name) {
          opt.name = name;
          return opt;
        });
      }
      parser.specs = parser.specs.map(function(opt) {
        return Opt(opt);
      });

      /* parse the args */
      if(printHelp && (argv.indexOf("--help") != -1
           || argv.indexOf("-h") != -1))
        parser.print(parser.getUsage());

      var options = {};
      args = argv.concat([""]).map(function(arg) {
        return Arg(arg);
      });
      var positionals = [];

      args.reduce(function(arg, val) {
        /* word */
        if(arg.isValue) {
          positionals.push(arg.value);
        }
        /* -c */
        else if(arg.chars) {
          var lastChar = arg.chars.pop();
          
          /* -cfv */
          (arg.chars).forEach(function(ch) {
            setOption(options, ch, true);
          });

          /* -c 3 */
          if(val.isValue && opt(lastChar).expectsValue) {
            setOption(options, lastChar, val.value);
            return Arg(); // skip next turn - swallow arg
          }
          else {
            setOption(options, lastChar, true);
          }
        }
        /* --config=tests.json or --debug */
        else if(arg.full) {
          var value = arg.value;
          /* --debug */
          if(value === undefined)
            value = true;
          setOption(options, arg.full, value);
        }
        return val;
      });

      positionals.forEach(function(pos, index) {
        setOption(options, index, pos);
      });
      
      parser.specs.forEach(function(opt) {
        if(typeof options[opt.name] == "undefined")
          options[opt.name] = opt.default;
      });

      // exit if required arg isn't present
      parser.specs.forEach(function(opt) {
        if(opt.required && options[opt.name] === undefined)
          parser.print(opt.name + " argument is required");
      });
    
      if(command && command.callback)
        command.callback(options);
      else if(parser.fallbackCb)
        parser.fallbackCb(options);

      return options;
    },

    getUsage : function() {
      if(parser.usageString)
        return parser.usageString;

      // todo: use a template
      var str = "Usage: " + parser.script;

      var positionals = _(parser.specs).select(function(opt) {
        return opt.position != undefined;
      })
      positionals = _(positionals).sortBy(function(opt) {
        return opt.position;
      });      
      var options = _(parser.specs).select(function(opt) {
        return opt.position === undefined;
      });

      // assume there are no gaps in the specified pos. args
      positionals.forEach(function(pos) {
        str += " <" + (pos.name || "arg" + pos.position) + ">";
        if(pos.list)
          str += "..."; 
      });
      if(options.length || positionals.length)
        str += " [options]\n\n";

      positionals.forEach(function(pos) {
        str += pos.name + "\t\t" + (pos.help || "") + "\n"; 
      });
      if(positionals.length && options.length)
        str += "\n";
      if(options.length)
        str += "options:\n"

      options.forEach(function(opt) {
        str += opt.string + "\t\t" + (opt.help || "") + "\n";
      });
      return str + "\n" + (parser.helpString || "") + "\n";
    }
  }

  return parser;
};

/* an opt is what's specified by the user in opts hash */
Opt = function(opt) {
  var matches = /^(?:\-(\w+?)(?:\s+([^-][^\s]*))?)?\,?\s*(?:\-\-(.+?)(?:=(.+))?)?$/
                .exec(opt.string);

  matches = matches || [];
  var abbr = opt.abbr || matches[1],   // e.g. v from -v
      full = opt.full || matches[3] || opt.name, // e.g. verbose from --verbose
      metavar = opt.metavar || matches[2] || matches[4],  // e.g. PATH from '--config=PATH'
      expectsValue = opt.expectsValue || metavar || opt.default;

  var string= "";
  if(abbr) {
    string += "-" + abbr;
    if(metavar)
      string += " " + metavar
    string += ", ";
  }
  if(full) {
    string += "--" + full;
    if(metavar)
      string += "=" + metavar;
  }
  if(opt.string)
    string = opt.string;
  
  opt = _(opt).extend({
    name: opt.name || full || abbr,
    string: string,
    abbr: abbr,
    full: full,
    metavar: metavar,
    matches: function(arg) {
      return opt.full == arg || opt.abbr == arg || opt.position == arg
             || (opt.list && arg >= opt.position);
    },
    expectsValue: expectsValue
  });
  
  return opt;
}

/* an arg is an item that's actually parsed from the command line 
   e.g. "-l", "log.txt", or "--logfile=log.txt" */
Arg = function(str) {  
  var abbrRegex = /^\-(\w+?)$/,
      fullRegex = /^\-\-(no\-)?(.+?)(?:=(.+))?$/,
      valRegex = /^[^\-].*/;

  var charMatch = abbrRegex.exec(str),
      chars = charMatch && charMatch[1].split("");

  var fullMatch = fullRegex.exec(str),
      full = fullMatch && fullMatch[2];

  var isValue = str !== undefined && (str === "" || valRegex.test(str)),
      value;
  if(isValue)
    value = str;
  else if(full)
    value = fullMatch[1] ? false : fullMatch[3];

  try { // try to infer type by JSON parsing the string
    value = JSON.parse(value)
  } catch(e) {}

  return {
    str: str,
    chars: chars,
    full: full,
    value: value,
    isValue: isValue
  }
}