var _ = require("underscore")._;


function ArgParser() {
   this.commands = {};  // expected commands
   this.specs = {};     // option specifications
}

ArgParser.prototype = {
  // add a command to the expected commands
  command : function(name) {
    var command = this.commands[name] = {
      name: name,
      specs: {}
    };

    // facilitates command('name').opts().cb().help()
    var chain = {
      opts : function(specs) {
        command.specs = specs;
        return chain;
      },
      callback : function(cb) {
        command.cb = cb;
        return chain;
      },
      help : function(help) {
        command.help = help;
        return chain;
      },
      usage : function(usage) {
        command.usageStr = usage;
        return chain;
      }
    };
    return chain;
  },
  
  globalOpts : function(specs) {
    this.globalSpecs = specs;
    return this;
  },
  
  opts : function(specs) {
    this.specs = specs;
    return this;
  },
  
  callback : function(cb) {
    this.cb = cb;
    return this;
  },
  
  usage : function(usageString) {
    this.usageStr = usageString;
    return this;
  },
  
  printFunc : function(print) {
    this.print = print;
    return this;
  },
  
  scriptName : function(script) {
    this.script = script;
    return this;
  },

  help : function(helpStr) {
    this.helpStr = helpStr;
    return this;
  },

  parseArgs : function(argv) {
    this.print = this.print || function(str) {
      console.log(str);
      process.exit(0);
    };
    this.helpStr = this.helpStr || "";
    this.script = this.script || process.argv[0] + " "
          + require('path').basename(process.argv[1]);    
    this.specs = this.specs || {};

    var argv = argv || process.argv.slice(2);
    
    var arg = Arg(argv[0]).isValue && argv[0],
        command = arg && this.commands[arg],
        commandExpected = !_(this.commands).isEmpty();
    
    if (commandExpected) {
       if (command) {
          this.specs = _(command.specs).extend(this.globalSpecs);  
          this.script += " " + command.name;
          if (command.help) {
            this.helpStr = command.help;
          }
          this.command = command;
       }
       else if (arg) {
          return this.print(this.script + ": no such command '" + arg + "'");            
       }
       else {
          // no command but command expected e.g. 'git -v'
          this.specs.command = {
            position: 0,
            help: 'one of: ' + _(this.commands).keys().join(", ")
          }
          _(this.specs).extend(this.globalSpecs);            
       }
    }

    if (this.specs.length === undefined) {
      // specs is a hash not an array
      this.specs = _(this.specs).map(function(opt, name) {
        opt.name = name;
        return opt;
      });
    }
    this.specs = this.specs.map(function(opt) {
      return Opt(opt);
    });

    if (argv.indexOf("--help") >= 0 || argv.indexOf("-h") >= 0) {
      return this.print(this.getUsage());        
    }

    var options = {};
    var args = argv.map(function(arg) {
      return Arg(arg);
    })
    .concat(Arg());

    var positionals = [];

    /* parse the args */
    var that = this;
    args.reduce(function(arg, val) {
      /* positional */
      if (arg.isValue) {
        positionals.push(arg.value);
      }
      else if (arg.chars) {
        var lastChar = arg.chars.pop();
        
        /* -cfv */
        (arg.chars).forEach(function(ch) {
          that.setOption(options, ch, true);
        });

        /* -v key */
        if (!that.opt(lastChar).flag) {
           if (val.isValue)  {
              that.setOption(options, lastChar, val.value);
              return Arg(); // skip next turn - swallow arg                
           }
           else {
              that.print("'-" + (this.opt(lastChar).name || lastChar) + "'"
                + " expects a value\n\n" + this.getUsage());
           }
        }
        else {
          /* -v */
          that.setOption(options, lastChar, true);
        }

      }
      else if (arg.full) {
        var value = arg.value;

        /* --key */
        if (value === undefined) {
          /* --key value */
          if (!that.opt(arg.full).flag) {
            if (val.isValue) {
              that.setOption(options, arg.full, val.value);
              return Arg();           
            }
            else {
              that.print("'--" + (that.opt(arg.full).name || arg.full) + "'"
                + " expects a value\n\n" + that.getUsage());                  
            }
          }
          else {
            /* --flag */
            value = true;
          }
        }
        that.setOption(options, arg.full, value);
      }
      return val;
    });

    positionals.forEach(function(pos, index) {
      this.setOption(options, index, pos);
    }, this);
    
    options._ = positionals;
    
    this.specs.forEach(function(opt) {
      if (opt.default !== undefined && options[opt.name] === undefined) {
        options[opt.name] = opt.default;
      }
    }, this);

    // exit if required arg isn't present
    this.specs.forEach(function(opt) {
      if (opt.required && options[opt.name] === undefined) {
         this.print(opt.name + " argument is required\n\n" + this.getUsage());           
      }
    }, this);
  
    if (command && command.cb) {
      command.cb(options);        
    }
    else if (this.cb) {
      this.cb(options);        
    }

    return options;
  },

  getUsage : function() {
    if (this.command && this.command.usageStr) {
      return this.command.usageStr;        
    }
    if (this.usageStr) {
      return this.usageStr;        
    }

    // todo: use a template
    var str = "usage: " + this.script;

    var positionals = _(this.specs).select(function(opt) {
      return opt.position != undefined;
    })
    positionals = _(positionals).sortBy(function(opt) {
      return opt.position;
    });      
    var options = _(this.specs).select(function(opt) {
      return opt.position === undefined;
    });

    // assume there are no gaps in the specified pos. args
    positionals.forEach(function(pos) {
      str += " ";
      var posStr = pos.string;
      if (!posStr) {
        posStr = "<" + (pos.name || "arg" + pos.position) + ">";
        if (pos.list) {
          posStr += "...";            
        }
      }
      str += posStr;
    });

    if (options.length || positionals.length) {
      str += " [options]\n\n";        
    }
  
    function spaces(length) {
      var spaces = "";
      for (var i = 0; i < length; i++) {
        spaces += " ";          
      }
      return spaces;
    }
    var longest = positionals.reduce(function(max, pos) {
      return pos.name.length > max ? pos.name.length : max; 
    }, 0);

    positionals.forEach(function(pos) {
      var posStr = pos.string || pos.name;
      str += posStr + spaces(longest - posStr.length) + "     "
             + (pos.help || "") + "\n"; 
    });
    if (positionals.length && options.length) {
      str += "\n";        
    }

    if (options.length) {
      str += "options:\n";        
    }

    var longest = options.reduce(function(max, opt) {
      return opt.string.length > max && !opt.hidden ? opt.string.length : max; 
    }, 0);

    options.forEach(function(opt) {
      if (!opt.hidden) {
        str += "   " + opt.string + spaces(longest - opt.string.length)
               + "   " + (opt.help || "") + "\n";          
      }
    });
    return str + "\n" + (this.helpStr || "") + "\n";
  }
};

ArgParser.prototype.opt = function(arg) {
  // get the specified opt for this parsed arg
  var match = Opt({});
  this.specs.forEach(function(opt) {
    if (opt.matches(arg)) {
       match = opt;         
    }
  });
  return match;
};

ArgParser.prototype.setOption = function(options, arg, value) {
  var option = this.opt(arg);
  if (option.callback) {
    var message = option.callback(value);

    if (typeof message == "string") {
      this.print(message);
    }
  }

  if (option.type != "string") {
     try {
       // infer type by JSON parsing the string
       value = JSON.parse(value)
     }
     catch(e) {}
  }
  
  var name = option.name || arg;
  if (option.choices && option.choices.indexOf(value) == -1) {
     this.print(name + " must be one of: " + option.choices.join(", "));
  }

  if (option.list) {
    if (!options[name]) {
      options[name] = [value];         
    }
    else {
      options[name].push(value);        
    }
  }
  else {
    options[name] = value;      
  }
};


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

  var isValue = str !== undefined && (str === "" || valRegex.test(str));
  var value;
  if (isValue) {
    value = str;    
  }
  else if (full) {
    value = fullMatch[1] ? false : fullMatch[3];    
  }

  return {
    str: str,
    chars: chars,
    full: full,
    value: value,
    isValue: isValue
  }
}


/* an opt is what's specified by the user in opts hash */
Opt = function(opt) {
  var strings = (opt.string || "").split(","),
      abbr, full, metavar;
  for (var i = 0; i < strings.length; i++) {
    var string = strings[i].trim(),
        matches;
    if (matches = string.match(/^\-([^-])(?:\s+(.*))?$/)) {
      abbr = matches[1];
      metavar = matches[2];
    }
    else if (matches = string.match(/^\-\-(.+?)(?:[=\s]+(.+))?$/)) {
      full = matches[1];
      metavar = metavar || matches[2];
    }
  }

  matches = matches || [];
  var abbr = opt.abbr || abbr,   // e.g. v from -v
      full = opt.full || full, // e.g. verbose from --verbose
      metavar = opt.metavar || metavar;  // e.g. PATH from '--config=PATH'

  var string;
  if (opt.string) {
    string = opt.string;
  }
  else if (opt.position === undefined) {
    string = "";
    if (abbr) {
      string += "-" + abbr;
      if (metavar)
        string += " " + metavar
      string += ", ";
    }
    string += "--" + (full || opt.name);
    if (metavar) {
      string += " " + metavar;      
    }
  }

  opt = _(opt).extend({
    name: opt.name || full || abbr,
    string: string,
    abbr: abbr,
    full: full,
    metavar: metavar,
    matches: function(arg) {
      return opt.full == arg || opt.abbr == arg || opt.position == arg
        || opt.name == arg || (opt.list && arg >= opt.position);
    }
  });
  return opt;
}


var createParser = function() {
  return new ArgParser();
}

var nomnom = createParser();

for (var i in nomnom) {
  if (typeof nomnom[i] == "function") {
     createParser[i] = _(nomnom[i]).bind(nomnom);     
  }
}

module.exports = createParser;
