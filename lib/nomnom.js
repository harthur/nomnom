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
      if(typeof message == "string"){
        parser.print(message);
      }
    }
    options[option.name || arg] = value;
  };
  
  var parser = {
    commands : {},    
    specs: [],

    command : function(name) {
      var command = parser.commands[name] = {
        name: name,
        specs: {}
      };

      // facilitates command('name').opts().callback().help()
      return new (function(){
        this.opts = function(specs) {
          command.specs = specs;
          return this;
        };
        this.callback = function(callback) {
          command.callback = callback;
          return this;
        };
        this.help = function(help) {
          command.help = help;
          return this;
        };
      });
    },
    
    opts : function(specs) {
      parser.specs = specs;
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
        parser.specs = argv;

        parserOpts = parserOpts || {};
        parser.script = parserOpts.script;
        parser.print = parserOpts.pringFunc;
        printHelp = parserOpts.printHelp;
        if(printHelp == undefined)
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
          // no command but command expected e.g. 'git --version'
          parser.specs.command = {
            position: 0,
            help: 'one of: ' + _(parser.commands).keys().join(", ")
          }
        }
        else {
          // command specified e.g. 'git add -p'
          var command = parser.commands[commandName];
          if(!command)
            parser.print(parser.script + ": no such command '" + commandName + "'");  
          parser.specs = _(command.specs).extend(parser.specs);  
          parser.script += " " + command.name;
          if(command.help)
            parser.helpString = command.help;  
        }
      }

      if(parser.specs.length == undefined) {
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
      parser.specs.forEach(function(opt) {
        options[opt.name] = opt.default;
      });

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
          /* -cfv */
          (arg.chars).forEach(function(ch) {
            setOption(options, ch, true);
          });
          /* -c 3 */
          if(val.isValue) {
            var expectsValue = opt(arg.lastChar).expectsValue();
            if(expectsValue) {
              setOption(options, arg.lastChar, val.value);
              return Arg(""); // skip next turn - swallow arg
            }
          }
        }
        /* --config=tests.json or --debug */
        else if(arg.lg) {
          var value = arg.value;
          /* --debug */
          if(value == undefined)
            value = true;
          setOption(options, arg.lg, value);
        }
        return val;
      });

      positionals.forEach(function(pos, index) {
        setOption(options, index, pos);
      });

      // exit if required arg isn't present
      parser.specs.forEach(function(opt) {
        if(opt.required && !options[opt.name])
          parser.print(opt.name + " argument is required");
      });
    
      if(command && command.callback)
        command.callback(options);
      return options;
    },

    getUsage : function() {
      if(parser.usageString)
        return parser.usageString;

      var str = "Usage: " + parser.script;

      var positionals = parser.specs.filter(function(opt) {
        return opt.position != undefined;
      }).sort(function(opt1, opt2) {
        return opt1.position > opt2.position;
      });
      
      var options = parser.specs.filter(function(opt) {
        return opt.position == undefined;
      });

      // assume there are no gaps in the specified pos. args
      positionals.forEach(function(pos) {
        str += " <" + (pos.name || "arg" + pos.position) + ">"; 
      });
      if(options.length)
        str += " [options]\n\n";

      positionals.forEach(function(pos) {
        str += "<" + pos.name + ">\t\t" + (pos.help || "") + "\n"; 
      });
      if(options.length)
        str += "\noptions:\n"

      options.forEach(function(opt) {
        str += opt.string + "\t\t" + (opt.help || "") + "\n";
      });
      return str + "\n" + (parser.helpString || "");
    }
  }

  return parser;
};

/* an opt is what's specified by the user in opts hash */
Opt = function(opt) {
  var string = opt.string || (opt.name ? "--" + opt.name : "");
  var matches = /^(?:\-(\w+?)(?:\s+([^-][^\s]*))?)?\,?\s*(?:\-\-(.+?)(?:=(.+))?)?$/
                .exec(string);
  var sh = matches[1],   // e.g. v from -v
      lg = matches[3], // e.g. verbose from --verbose
      metavar = matches[2] || matches[4];   // e.g. PATH from '--config=PATH'
  
  opt = _(opt).extend({
    name: opt.name || lg || sh,
    string: string,
    sh: sh,
    lg: lg,
    metavar: metavar,
    matches: function(arg) {
      return opt.lg == arg || opt.sh == arg || opt.position == arg;
    },
    expectsValue: function() {
      return opt.metavar || opt.default;
    }
  });
  
  return opt;
}

/* an arg is an item that's actually parsed from the command line 
   e.g. "-l", "log.txt", or "--logfile=log.txt" */
Arg = function(str) {  
  var shRegex = /^\-(\w+?)$/,
      lgRegex = /^\-\-(.+?)(?:=(.+))?$/,
      valRegex = /^[^\-].*/;
      
  var chars = shRegex.exec(str);
  chars = chars && chars[1].split("");
  
  var lg = lgRegex.exec(str);
  lg = lg && lg[1];
  
  var val = valRegex.exec(str);
  val = val && str;
  var value = val || (lg && lgRegex.exec(str)[2]);
  try { // try to infer type by JSON parsing the string
    value = JSON.parse(value)
  } catch(e) {}
  
  return {
    chars: chars,
    lg: lg,
    value: value,
    lastChar: str[str.length - 1],
    isValue: str && valRegex.test(str)
  }
}