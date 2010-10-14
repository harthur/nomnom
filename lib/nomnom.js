var sys = require("sys");
ArgParser = function(options, parserOpts) {  
  parserOpts = parserOpts || {};
  this.print = parserOpts.printFunc || this.print;
  this.script = parserOpts.script;
  this.printHelp = parserOpts.printHelp;
  if(this.printHelp == undefined)
    this.printHelp = true;

  this.options = (options || []).map(function(opt) {
    return new Option(opt)
  });
}

ArgParser.prototype = {
  print : function(str) {
    require("sys").puts(str);
    process.exit(0);
  },
  
  getOption : function(arg) {
    var match = new Option({});
    this.options.forEach(function(option) {
      if(option.matches(arg))
        match = option;
    });
    return match;
  },
  
  getOptName : function(arg) {
    var option = this.getOption(arg);
    return this.getOption(arg).name || arg;
  },
  
  getDefault : function(arg) {
    return this.getOption(arg).default || true;
  },
  
  expectsValue : function(arg) {
    return this.getOption(arg).expectsValue();
  },
  
  parse : function(args) {
    args = args || process.argv.slice(2);

    if(this.printHelp && (args.indexOf("--help") != -1
         || args.indexOf("-h") != -1))
      this.print(this.helpString());
  
    var ret = {};
    this.options.forEach(function(option) {
      ret[option.name] = option.default;
    }, this);
    
    args = args.concat([""]).map(function(arg) {
      return new Arg(arg);
    });
    var positionals = [];
    var that = this;
    
    args.reduce(function(arg, val) {
      /* word */
      if(arg.isValue()) {
        positionals.push(arg.getValue());
      }
      /* -c */
      else if(arg.isShort()) {
        /* -cfv */
        (arg.getChars()).forEach(function(ch) {
          ret[this.getOptName(ch)] = this.getDefault(ch);
        }, that);
        /* -c 3 */
        if(val.isValue()) {
          var value = val.getValue();
          var last = arg.lastChar();
          if(that.expectsValue(last)) {
            ret[that.getOptName(last)] = value;
            return new Arg(""); // skip next turn - swallow arg
          }
        }
      }
      /* --config=tests.json */
      else if(arg.isLong()) {
        var key = arg.getKey()
        var value = arg.getValue()
        /* --debug */
        if(value == undefined)
          value = that.getDefault(key)
        ret[that.getOptName(key)] = value;
      }
      return val;
    });

    positionals.forEach(function(pos, index) {
      ret[this.getOptName(index)] = pos;
    }, this);

    return ret;
  },
  
  helpString : function() {
    var str = "usage: " + (this.script || "<script>");

    var positionals = this.options.filter(function(opt) {
      return opt.position != undefined;
    }).sort(function(opt1, opt2) {
      return opt1.position > opt2.position;
    });
    // assume there are no gaps in the specified pos. args
    positionals.forEach(function(pos) {
      str += " " + (pos.name || "arg" + pos.position); 
    });
    str += " [options]\n\noptions:\n"
    
    this.options.forEach(function(option) {
      if(option.position == undefined)
        str += option.string + "\t" + (option.help || "") + "\n";
    });
    return str;
  }
}

Option = function(opt) {
  // 0 - str, 1 - char, 2 - metavar, 3 - key, 3 - metavar
  this.string = opt.string || (opt.name ? "--" + opt.name : "");
  var matches = /^(?:\-(\w+?)(?:\s+([^-][^\s]*))?)?\,?\s*(?:\-\-(.+?)(?:=(.+))?)?$/
                .exec(this.string);
  this.short = matches[1];
  this.metavar = matches[2] || matches[4]
  this.long = matches[3];

  this.name = opt.name || this.long || this.short;
  this.default = opt.default;
  this.help = opt.help;
  this.position = opt.position;
}

Option.prototype = {
  matches : function(arg) {
    return this.long == arg || this.short == arg || this.position == arg;
  },
  
  expectsValue : function() {
    return this.metavar || this.default;
  }
}

Arg = function(str) {
  // "-l", "log.txt", or "--logfile=log.txt"
  this.str = str;
}

Arg.prototype = {
  shortRegex : /^\-(\w+?)(?:\s+(.*))?$/,
  
  longRegex : /^\-\-(.+?)(?:=(.+))?$/,
  
  isShort : function() {
    return this.shortRegex.test(this.str);
  },
  
  isValue : function() {
    return this.str && !this.isShort() && !this.isLong();
  },
  
  isLong : function() {
    return this.longRegex.test(this.str);
  },
  
  getChars : function() {
    if(this.isShort())
      return this.shortRegex.exec(this.str)[1].split("");
  },
  
  lastChar : function() {
    return this.str[this.str.length - 1];
  },
  
  getKey : function() {
    if(this.isLong())
      return this.longRegex.exec(this.str)[1];
  },
  
  getValue : function() {
    var val = this.isValue() ? this.str : this.longRegex.exec(this.str)[2];
    try { // try to infer type by JSON parsing the string
      val = JSON.parse(val)
    } catch(e) {}
    return val;
  },
}

exports.ArgParser = ArgParser;
exports.parseArgs = function(opts, parserOpts, args) {
  return (new ArgParser(opts, parserOpts)).parse(args);
};