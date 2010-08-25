ArgParser = function(options, parserOpts) {
  this.options = options || [];
  parserOpts = parserOpts || {};
  this.print = parserOpts.printFunc || this.print;
  this.printHelp = parserOpts.printHelp;
  if(this.printHelp == undefined)
    this.printHelp = true;
}

ArgParser.prototype = {
  print : function(str) {
    require("sys").puts(str);
  },
  
  getOption : function(arg) {
    var match = {};
    this.options.forEach(function(option) {
      var longOpt = new Arg(option.long);
      if(longOpt.isLong() && longOpt.getKey() == arg)
        match = option;

      var opt = new Arg(option.string);
      if(opt.isShort() && opt.getChars() == arg
         || opt.isLong() && opt.getKey() == arg)
        match = option;

      if(option.position == arg)
        match = option;
    });
    return match;
  },
  
  getOptName : function(arg) {
    if(typeof arg == "object") {
      // parse the name out of e.g. '--config=example.txt'
      var option = arg;
      return option.name || new Arg(option.string).getKey()
       || new Arg(option.long).getKey();
    }
    return this.getOption(arg).name || arg;
  },
  
  getDefault : function(arg) {
    return this.getOption(arg).default || true;
  },
  
  expectsValue : function(arg) {
    var option = this.getOption(arg);
    return (new Arg(option.string)).expectsValue() || 
      (new Arg(option.long)).expectsValue() || option.default;
  },
  
  parse : function(args) {
    args = args || process.argv.slice(2);

    if(this.printHelp && (args.indexOf("--help") != -1
         || args.indexOf("-h") != -1))
      this.print(this.helpString());
  
    var ret = {};
    this.options.forEach(function(option) {
      ret[this.getOptName(option)] = option.default;
    }, this);
    
    args = args.concat([""]).map(function(arg) {
      return new Arg(arg);
    });
    var positionals = [];
    var that = this;
    
    args.reduce(function(arg, val) {
      /* -cfv */
      if(arg.isValue()) {
        positionals.push(arg.getValue());
      }
      else if(arg.isShort()) {
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
    var str = "usage: <script> ";
    var positionals = this.options.filter(function(opt) {
      return opt.position != undefined;
    }).sort(function(opt1, opt2) {
      return opt1.position > opt2.position;
    });
    // assume there are no gaps in the specified pos. args
    positionals.forEach(function(pos) {
      str += (pos.name || "arg" + pos.position) + " "; 
    });
    str += "[options]\n\noptions:\n"
    
    this.options.forEach(function(option) {
      if(option.position != undefined)
        return;
      var sh = "";
      if((new Arg(option.string)).isShort())
        sh = option.string;
      var lg = "";
      if((new Arg(option.string)).isLong())
        lg = option.string;
      else if((new Arg(option.long)).isLong())
        lg = option.long;
      if(sh && lg)
        sh += ", ";      
      var help = option.help || "";
      
      str += sh + lg + "\t" + help + "\n";
    });
    return str;
  }
}

Arg = function(str) {
  this.str = str ;
}

Arg.prototype = {
  shortRegex : /^\-(\w+?)(?:\s+(\w*))?$/,
  
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
  
  expectsValue : function() {
   if(this.isShort())
     return this.shortRegex.exec(this.str)[2]
   else if(this.isLong())
     return this.longRegex.exec(this.str)[2];
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
exports.parseArgs = function(opts, args, parserOpts) {
  return (new ArgParser(opts, parserOpts)).parse(args);
};