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

      var flagOpt = new Arg(option.flag);
      if(flagOpt.isFlag() && flagOpt.getFlags() == arg)
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
      if(arg.isFlag()) {
        wu(arg.getFlags()).each(function(flag) {
          ret[this.getOptName(flag)] = this.getDefault(flag);
        }, this);
        /* -c 4 */
        if(val.isValue()) {
          var value = val.getValue(val.val);
          ret[this.getOptName(arg.lastFlag())] = value;
        }
      }
      /* --config=tests.json */
      if(arg.isFull()) {
        var key = arg.getKey()
        var value = arg.getValue()
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
  flagRegex : /^\-(\w+)/,
  
  fullRegex : /^\-\-(.+?)(?:=(.+))?$/,
  
  isFlag : function() {
    return this.flagRegex.test(this.val);
  },
  
  isValue : function() {
    return this.val && !this.isFlag() && !this.isFull();
  },
  
  isFull : function() {
    return this.fullRegex.test(this.val);
  },
  
  getFlags : function() {
    return this.flagRegex.exec(this.val)[1];
  },
  
  lastFlag : function() {
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