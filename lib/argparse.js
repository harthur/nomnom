var wu = require("wu").wu,
    sys = require("sys");

ArgParser = function(options) {
  this.options = options || [];
}

ArgParser.prototype = {
  getOption : function(arg) {
    var match = {};
    wu(this.options).each(function(option) {
      var fullOpt = new Arg(option.full);
      if(fullOpt.isFull() && fullOpt.getKey() == arg)
        match = option;

      var opt = new Arg(option.string);
      if(opt.isShort() && opt.getChars() == arg
         || opt.isFull() && opt.getKey() == arg)
        match = option;
    });
    return match;
  },
  
  getOptName : function(arg) {
    if(typeof arg == "object") {
      var option = arg;
      return option.name || new Arg(option.string).getKey()
       || new Arg(option.full).getKey();
    }
    return this.getOption(arg).name || arg;
  },
  
  getDefault : function(arg) {
    return this.getOption(arg).default || true;
  },
  
  parse : function(args) {
    args = args || process.argv;
    var ret = {};
    
    wu(this.options).each(function(option) {
      ret[this.getOptName(option)] = option.default;
    }, this);
    
    wu(args.concat([""])).map(function(arg) {
      return new Arg(arg);
    })
    .reduce(function(arg, val) {
      /* -cfv */
      if(arg.isShort()) {
        wu(arg.getChars()).each(function(ch) {
          ret[this.getOptName(ch)] = this.getDefault(ch);
        }, this);
        /* -c 4 */
        if(val.isValue()) {
          var value = val.getValue(val.str);
          ret[this.getOptName(arg.lastChar())] = value;
        }
      }
      /* --config=tests.json */
      if(arg.isFull()) {
        var key = arg.getKey()
        var value = arg.getValue()
        /* --debug */
        if(value == undefined)
          value = this.getDefault(key)
        ret[this.getOptName(key)] = value;
      }
      return val;
    }, undefined, this);
    return ret;
  },
  
  helpString : function() {
    var str = "";
    wu(this.options).each(function(option) {
      var sh = "";
      if((new Arg(option.string)).isShort())
        sh = option.string;

      var full = "";
      if((new Arg(option.string)).isFull())
        full = option.string;
      else if((new Arg(option.full)).isFull())
        full = option.full;
      if(sh && full)
        sh += ", ";
        
      var help = option.help || "";
      
      str += sh + full + "\t" + help + "\n";
    });
    return str;
  }
}

Arg = function(str) {
  this.str = str;
}

Arg.prototype = {
  shortRegex : /^\-(\w+)/,
  
  fullRegex : /^\-\-(.+?)(?:=(.+))?$/,
  
  isShort : function() {
    return this.shortRegex.test(this.str);
  },
  
  isValue : function() {
    return this.str && !this.isShort() && !this.isFull();
  },
  
  isFull : function() {
    return this.fullRegex.test(this.str);
  },
  
  getChars : function() {
    if(this.isShort())
      return this.shortRegex.exec(this.str)[1];
  },
  
  lastChar : function() {
    return this.str[this.str.length - 1];
  },
  
  getKey : function() {
    if(this.isFull())
      return this.fullRegex.exec(this.str)[1];
  },
  
  getValue : function(val) {
    val = val || this.fullRegex.exec(this.str)[2];
    try {
      val = JSON.parse(val)
    } catch(e) {}
    return val;
  },
}

exports.ArgParser = ArgParser;