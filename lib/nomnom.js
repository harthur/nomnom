var _ = require("underscore")._;

module.exports = ArgParser;

// for nomnom.parseArgs()
var parser = ArgParser();
ArgParser.parseArgs = parser.parseArgs.bind(parser);

function ArgParser() {

  function opt(arg) {
    // get the specified opt for this parsed arg
    var match = Opt({});
    parser.opts.forEach(function(opt) {
      if(opt.matches(arg))
        match = opt;
    });
    return match;
  };

  function optName(arg) {
    return opt(arg).name || arg;
  };
  
  var parser = {
    commands : {},

    command : function(name) {
      var command = parser.commands[name] = {
        name: name,
        opts: {}
      };

      // facilitates command('name').opts().callback().help()
      return new (function(){
        this.opts = function(opts) {
          command.opts = opts;
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
  
    parseArgs : function(opts, parserOpts, argv) {
      parserOpts = parserOpts || {};
      var print = parserOpts.printFunc || function(str) {
        require("sys").puts(str);
        process.exit(0);
      };
      var printHelp = parserOpts.printHelp;
      if(printHelp == undefined)
        printHelp = true;
      parser.help = parserOpts.help || ""; // usage
      parser.script = parserOpts.script || process.argv[0] + " "
            + require('path').basename(process.argv[1]); // usage
      parser.opts = opts || {};

      var argv = parserOpts.argv || process.argv.slice(2);

      var command;
      if(JSON.stringify(parser.commands) != "{}") {
        if(argv.length && Arg(argv[0]).isValue)
          command = argv[0];

        if(!command) {
          // no command but command expected e.g. 'git --version'
          parser.opts.command = {
            position: 0,
            help: 'one of: ' + _(parser.commands).keys().join(", ")
          }
        }
        else {
          // command specified e.g. 'git add -p'
          command = parser.commands[command];    
          parser.opts = _(command.opts).extend(parser.opts);  
          parser.script += " " + command.name;
          if(command.help)
            parser.help = command.help;  
        }
      }
      if(parser.opts.length == undefined) {
        // opts is a hash not an array
        parser.opts = _(parser.opts).map(function(opt, name) {
          opt.name = name;
          return opt;
        });
      }
      parser.opts = parser.opts.map(function(opt) {
        return Opt(opt);
      });

      if(printHelp && (argv.indexOf("--help") != -1
           || argv.indexOf("-h") != -1))
        print(parser.usageString());
  
      var options = {};
      parser.opts.forEach(function(opt) {
        options[opt.name] = opt.default;
      }, parser);
    
      args = argv.concat([""]).map(function(arg) {
        return Arg(arg);
      });
      var positionals = [];
      var that = parser;

      args.reduce(function(arg, val) {
        /* word */
        if(arg.isValue) {
          positionals.push(arg.value);
        }
        /* -c */
        else if(arg.chars) {
          /* -cfv */
          (arg.chars).forEach(function(ch) {
            options[optName(ch)] = true;
          }, that);
          /* -c 3 */
          if(val.isValue) {
            var expectsValue = opt(arg.lastChar).expectsValue();
            if(expectsValue) {
              options[optName(arg.lastChar)] = val.value;
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
          options[optName(arg.lg)] = value;
        }
        return val;
      });

      positionals.forEach(function(pos, index) {
        options[optName(index)] = pos;
      }, parser);

      // exit if required arg isn't present
      parser.opts.forEach(function(opt) {
        if(opt.required && !options[opt.name])
          print(opt.name + " argument is required");
      }, parser);
    
      if(command && command.callback)
        command.callback(options);
      return options;
    },

    usageString : function() {
      var str = "Usage: " + parser.script;
      // underscore
      var positionals = parser.opts.filter(function(opt) {
        return opt.position != undefined;
      }).sort(function(opt1, opt2) {
        return opt1.position > opt2.position;
      });
      // assume there are no gaps in the specified pos. args
      positionals.forEach(function(pos) {
        str += " <" + (pos.name || "arg" + pos.position) + ">"; 
      });
      str += " [options]\n\n";

      positionals.forEach(function(pos) {
        str += "<" + pos.name + ">\t\t" + (pos.help || "") + "\n"; 
      });
      str += "\noptions:\n"
      // underscore
      parser.opts.forEach(function(opt) {
        if(opt.position == undefined)
          str += opt.string + "\t\t" + (opt.help || "") + "\n";
      });
      return str + "\n" + parser.help;
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