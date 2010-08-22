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
    return this.getOption(arg).name || arg;
  },
  
  getDefault : function(arg) {
    return this.getOption(arg).default || true;
  },
  
  parse : function(args) {
    args = args || process.argv;
    var ret = {};
    
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
          var value = val.getValue(val.val);
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
  }
}

Arg = function(arg) {
  this.val = arg;
}

Arg.prototype = {
  shortRegex : /^\-(\w+)/,
  
  fullRegex : /^\-\-(.+?)(?:=(.+))?$/,
  
  isShort : function() {
    return this.shortRegex.test(this.val);
  },
  
  isValue : function() {
    return this.val && !this.isShort() && !this.isFull();
  },
  
  isFull : function() {
    return this.fullRegex.test(this.val);
  },
  
  getChars : function() {
    return this.shortRegex.exec(this.val)[1];
  },
  
  lastChar : function() {
    return this.val[this.val.length - 1];
  },
  
  getKey : function() {
    return this.fullRegex.exec(this.val)[1];
  },
  
  getValue : function(val) {
    val = val || this.fullRegex.exec(this.val)[2];
    try {
      val = JSON.parse(val)
    } catch(e) {}
    return val;
  },
}

exports.ArgParser = ArgParser;