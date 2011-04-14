var _ = require("underscore")._;

ArgParser = function(opts, parserOpts) {  
  parserOpts = parserOpts || {};
  this.print = parserOpts.printFunc || function(str) {
    require("sys").puts(str);
    process.exit(0);
  };
  this.script = parserOpts.script || process.argv[0] + " "
        + require('path').basename(process.argv[1])
  this.printHelp = parserOpts.printHelp;
  this.help = parserOpts.help || "";
  if(this.printHelp == undefined)
    this.printHelp = true;
    
  this.commands = {};

  this.opts = opts || [];
}

ArgParser.prototype = {
  get options() { return this.parseArgs(); },

  command : function(name) {
    var command = this.commands[name] = {
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
  
  parseArgs : function(argv) {
    var argv = argv || process.argv.slice(2);

    var command;
    if(JSON.stringify(this.commands) != "{}") {
      if(argv.length && new Arg(argv[0]).isValue())
        command = argv[0];

      if(!command) {
        // no command but command expected e.g. 'git --version'
        this.opts.command = {
          position: 0,
          help: 'one of: ' + _(this.commands).keys().join(", ")
        }
      }
      else {
        // command specified e.g. 'git add -p'
        command = this.commands[command];    
        this.opts = _(command.opts).extend(this.opts);  
        this.script += " " + command.name;
        if(command.help)
          this.help = command.help;  
      }
    }
    if(this.opts.length == undefined) {
      // opts is a hash not an array
      this.opts = _(this.opts).map(function(opt, name) {
        opt.name = name;
        return opt;
      });
    }
    this.opts = this.opts.map(function(opt) {
      return new Opt(opt);
    });

    var options = this.parse(argv);
    
    if(command && command.callback)
      command.callback(options);
    return options;
  },
  
  parse : function(args) {
    if(this.printHelp && (args.indexOf("--help") != -1
         || args.indexOf("-h") != -1))
      this.print(this.helpString());
  
    var ret = {};
    this.opts.forEach(function(opt) {
      ret[opt.name] = opt.default;
    }, this);
    
    args = args.concat([""]).map(function(arg) {
      return new Arg(arg);
    });
    var positionals = [];
    var that = this;
    
    args.reduce(function(arg, val) {
      /* word */
      if(arg.isValue()) {
        positionals.push(arg.value);
      }
      /* -c */
      else if(arg.chars) {
        /* -cfv */
        (arg.chars).forEach(function(ch) {
          ret[this.optName(ch)] = this.default(ch);
        }, that);
        /* -c 3 */
        if(val.isValue()) {
          if(that.expectsValue(arg.lastChar)) {
            ret[that.optName(arg.lastChar)] = val.value;
            return new Arg(""); // skip next turn - swallow arg
          }
        }
      }
      /* --config=tests.json */
      else if(arg.lg) {
        var value = arg.value;
        /* --debug */
        if(value == undefined)
          value = that.default(arg.lg)
        ret[that.optName(arg.lg)] = value;
      }
      return val;
    });

    positionals.forEach(function(pos, index) {
      ret[this.optName(index)] = pos;
    }, this);

    // exit if required arg isn't present
    this.opts.forEach(function(opt) {
      if(opt.required && !ret[opt.name])
        this.print(opt.name + " argument is required");
    }, this);

    return ret;
  },
  
  helpString : function() {
    var str = "Usage: " + this.script;

    var positionals = this.opts.filter(function(opt) {
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
    
    this.opts.forEach(function(opt) {
      if(opt.position == undefined)
        str += opt.string + "\t\t" + (opt.help || "") + "\n";
    });
    return str + "\n" + this.help;
  },

  opt : function(arg) {
    // get the specified option for this parsed arg
    var match = new Opt({});
    this.opts.forEach(function(opt) {
      if(opt.matches(arg))
        match = opt;
    });
    return match;
  },
  
  optName : function(arg) {
    var opt = this.opt(arg);
    return this.opt(arg).name || arg;
  },
  
  default : function(arg) {
    return this.opt(arg).default || true;
  },
  
  expectsValue : function(arg) {
    return this.opt(arg).expectsValue();
  },
}

/* an opt is what's specified by the user in opts hash */
Opt = function(opt) {
  this.string = opt.string || (opt.name ? "--" + opt.name : "");
  var matches = /^(?:\-(\w+?)(?:\s+([^-][^\s]*))?)?\,?\s*(?:\-\-(.+?)(?:=(.+))?)?$/
                .exec(this.string);
  this.sh = matches[1]; // e.g. -v
  this.metavar = matches[2] || matches[4]; // e.g. PATH from '--config=PATH'
  this.lg = matches[3]; // e.g. --verbose

  this.name = opt.name || this.lg || this.sh;
  this.default = opt.default;
  this.help = opt.help;
  this.position = opt.position;
  this.required = opt.required;
}

Opt.prototype = {
  matches : function(arg) {
    return this.lg == arg || this.sh == arg || this.position == arg;
  },
  
  expectsValue : function() {
    return this.metavar || this.default;
  }
}

/* an arg is an item that's actually parsed from the command line */
Arg = function(str) {
  // "-l", "log.txt", or "--logfile=log.txt"
  this.str = str;
}

Arg.prototype = {
  shRegex : /^\-(\w+?)$/,
  lgRegex : /^\-\-(.+?)(?:=(.+))?$/,
  valRegex : /^[^\-]/,
  
  get chars() {
    var matches = this.shRegex.exec(this.str);
    return matches && matches[1].split("");
  },

  get value() {
    if(this.str) {
      var val = this.valRegex.test(this.str) ? this.str
                  : this.lgRegex.exec(this.str)[2];
      try { // try to infer type by JSON parsing the string
        val = JSON.parse(val)
      } catch(e) {}
      return val;
    }
  },
  
  get lg() {
    var matches = this.lgRegex.exec(this.str);
    return matches && matches[1];
  },

  get lastChar() {
    return this.str[this.str.length - 1];
  },

  isValue : function() {
    return this.str && this.valRegex.test(this.str);
  }
}

module.exports = function(opts, parserOpts) {
  return new ArgParser(opts, parserOpts);
}
