(function() {
  var ArgumentParser, argumentParser, colorize, colors, extend, getColor, i, isEmptyObject, method, parseArgument, parseOption, path, spaces;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  path = require('path');
  colors = {
    black: 30,
    red: 31,
    green: 32,
    brown: 33,
    blue: 34,
    purple: 35,
    cyan: 36,
    gray: 37,
    none: '',
    reset: 0
  };
  getColor = function(color) {
    return colors[color.toString()] || colors.none;
  };
  colorize = function(text, color) {
    return "\033[" + (getColor(color)) + "m" + text + "\033[" + (getColor('reset')) + "m";
  };
  spaces = function(count) {
    return ((function() {
      var _results;
      _results = [];
      while (count--) {
        _results.push(' ');
      }
      return _results;
    })()).join('');
  };
  extend = function(obj) {
    var key, source, val, _i, _len, _ref;
    _ref = [].slice.call(arguments, 1);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      source = _ref[_i];
      for (key in source) {
        val = source[key];
        obj[key] = val;
      }
    }
    return obj;
  };
  isEmptyObject = function(object) {
    var key;
    for (key in object) {
      if (object.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  };
  parseArgument = function(str) {
    var abbrRegex, charMatch, chars, full, fullMatch, fullRegex, isValue, valRegex, value;
    abbrRegex = /^\-(\w+?)$/;
    fullRegex = /^\-\-(no\-)?(.+?)(?:=(.+))?$/;
    valRegex = /^[^\-].*/;
    charMatch = abbrRegex.exec(str);
    chars = charMatch && charMatch[1].split('');
    fullMatch = fullRegex.exec(str);
    full = fullMatch && fullMatch[2];
    isValue = (str != null) && (str === '' || valRegex.test(str));
    if (isValue) {
      value = str;
    } else if (full) {
      value = fullMatch[1] ? false : fullMatch[3];
    }
    return {
      str: str,
      chars: chars,
      full: full,
      value: value,
      isValue: isValue
    };
  };
  parseOption = function(opt) {
    var abbr, full, matches, metavar, name, string, strings, _i, _len;
    strings = (opt.string || '').split(',');
    for (_i = 0, _len = strings.length; _i < _len; _i++) {
      string = strings[_i];
      string = string.trim();
      if (matches = string.match(/^\-([^-])(?:\s+(.*))?$/)) {
        abbr = matches[1];
        metavar = matches[2];
      } else if (matches = string.match(/^\-\-(.+?)(?:[=\s]+(.+))?$/)) {
        full = matches[1];
        metavar = metavar || matches[2];
      }
    }
    matches = matches || [];
    abbr = opt.abbr || abbr;
    full = opt.full || full;
    metavar = opt.metavar || metavar;
    if (opt.string) {
      string = opt.string;
    } else if (!(opt.position != null)) {
      string = '';
      if (abbr) {
        string += "-" + abbr;
        if (metavar) {
          string += " " + metavar;
        }
        string += ', ';
      }
      string += "--" + (full || opt.name);
      if (metavar) {
        string += " " + metavar;
      }
    }
    name = opt.name || full || abbr;
    return extend(opt, {
      name: name,
      string: string,
      abbr: abbr,
      full: full,
      metavar: metavar,
      matches: function(arg) {
        return (arg === opt.full || arg === opt.abbr || arg === opt.position || arg === opt.name) || (opt.list && arg >= opt.position);
      }
    });
  };
  ArgumentParser = (function() {
    function ArgumentParser() {
      if (!(this instanceof ArgumentParser)) {
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return typeof result === "object" ? result : child;
        })(ArgumentParser, arguments, function() {});
      }
      this.commands = {};
      this.specs = {};
    }
    ArgumentParser.prototype.command = function(name) {
      var chain, command;
      if (name) {
        command = this.commands[name] = {
          name: name,
          specs: {}
        };
      } else {
        command = this.fallback = {
          specs: {}
        };
      }
      chain = {
        options: function(specs) {
          command.specs = specs;
          return chain;
        },
        option: function(name, spec) {
          command.specs[name] = spec;
          return chain;
        },
        callback: function(cb) {
          command.cb = cb;
          return chain;
        },
        help: function(help) {
          command.help = help;
          return chain;
        },
        usage: function(usage) {
          command._usage = usage;
          return chain;
        },
        opts: function(specs) {
          return this.options(specs);
        }
      };
      return chain;
    };
    ArgumentParser.prototype.nocommand = function() {
      return this.command();
    };
    ArgumentParser.prototype.options = function(specs) {
      this.specs = specs;
      return this;
    };
    ArgumentParser.prototype.option = function(name, spec) {
      this.specs[name] = spec;
      return this;
    };
    ArgumentParser.prototype.usage = function(usage) {
      this._usage = usage;
      return this;
    };
    ArgumentParser.prototype.printer = function(print) {
      this.print = print;
      return this;
    };
    ArgumentParser.prototype.script = function(scr) {
      this._script = scr;
      return this;
    };
    ArgumentParser.prototype.help = function(help) {
      this._help = help;
      return this;
    };
    ArgumentParser.prototype.nom = function(argv) {
      return this.parse(argv);
    };
    ArgumentParser.prototype.colors = function() {
      this._withColors = true;
      return this;
    };
    ArgumentParser.prototype.printHelpOnNoCommands = function(value) {
      this._printHelpOnNoCommands = !!value;
      return this;
    };
    ArgumentParser.prototype._colorize = function(text, color) {
      if (this._withColors) {
        return colorize(text, color);
      } else {
        return text;
      }
    };
    ArgumentParser.prototype.getUsage = function() {
      var command, indent, longest, name, options, pos, posStr, positionals, str, visible, _i, _j, _len, _len2, _ref;
      if (this.command && this.command._usage) {
        return this.command._usage;
      }
      if (this.fallback && this.fallback._usage) {
        return this.fallback._usage;
      }
      if (this._usage) {
        return this._usage;
      }
      indent = function(str) {
        return spaces(2) + str;
      };
      str = "Usage: " + this._script;
      positionals = this.specs.filter(function(opt) {
        return opt.position != null;
      }).sort(function(left, right) {
        return left.position > right.position;
      });
      options = this.specs.filter(function(opt) {
        return !(opt.position != null);
      });
      if (positionals.length) {
        for (_i = 0, _len = positionals.length; _i < _len; _i++) {
          pos = positionals[_i];
          str += ' ';
          posStr = pos.string;
          if (!posStr) {
            posStr = '<' + (pos.name || 'arg' + pos.position) + '>';
            if (pos.list) {
              posStr += '...';
            }
          }
          str += posStr;
        }
      } else if (this._printAllCommands) {
        str += ' [command] [options]';
        str += '\n\nPossible commands are:\n';
        _ref = this.commands;
        for (name in _ref) {
          command = _ref[name];
          str += indent("" + this._script + " " + command.name);
          if (command.help) {
            str += ": " + command.help;
          }
          str += '\n';
        }
        str += "\nTo get help on individual command, execute `" + this._script + " <command> --help`";
      }
      if (options.length) {
        str += this._colorize(' [options]', 'blue');
      }
      if (options.length || positionals.length) {
        str += '\n\n';
      }
      longest = positionals.reduce((function(max, pos) {
        return Math.max(max, pos.name.length);
      }), 0);
      for (_j = 0, _len2 = positionals.length; _j < _len2; _j++) {
        pos = positionals[_j];
        posStr = pos.string || pos.name;
        str += posStr + spaces(longest - posStr.length + 5);
        str += this._colorize(pos.help || '', 'gray');
        str += '\n';
      }
      if (positionals.length && options.length) {
        str += '\n';
      }
      if (options.length) {
        visible = function(opt) {
          return !opt.hidden;
        };
        str += this._colorize('Options:\n', 'blue');
        longest = options.filter(visible).reduce((function(max, opt) {
          return Math.max(max, opt.string.length);
        }), 0);
        str += options.filter(visible).map(__bind(function(opt) {
          var help, indentation;
          indentation = spaces(longest - opt.string.length);
          help = this._colorize(opt.help || '', 'gray');
          return indent("" + opt.string + " " + indentation + " " + help);
        }, this)).join('\n');
      }
      if (this._help) {
        str += "\n\nDescription:\n" + (indent(this._help));
      }
      return str;
    };
    ArgumentParser.prototype.parse = function(argv) {
      var arg, args, command, commandExpected, index, key, message, opt, options, pos, positionals, value, _i, _len, _len2, _ref, _ref2;
      this.print = this.print || function(str) {
        console.log(str);
        return process.exit(0);
      };
      this._help = this._help || '';
      this._script = this._script || process.argv[0] + ' ' + path.basename(process.argv[1]);
      this.specs = this.specs || {};
      if (this._printHelpOnNoCommands && !process.argv[2]) {
        process.argv[2] = '--help';
      }
      argv = argv || process.argv.slice(2);
      arg = parseArgument(argv[0]).isValue && argv[0];
      command = arg && this.commands[arg];
      commandExpected = !isEmptyObject(this.commands);
      if (commandExpected) {
        if (command) {
          extend(this.specs, command.specs);
          this._script += ' ' + command.name;
          if (command.help) {
            this._help = command.help;
          }
          this.command = command;
        } else if (arg) {
          return this.print("" + this._script + ": no such command '" + arg + "'");
        } else {
          this._printAllCommands = true;
          if (this.fallback) {
            extend(this.specs, this.fallback.specs);
            this._help = this.fallback.help;
          }
        }
      }
      if (!this.specs.length) {
        this.specs = (function() {
          var _ref, _results;
          _ref = this.specs;
          _results = [];
          for (key in _ref) {
            value = _ref[key];
            value.name = key;
            _results.push(value);
          }
          return _results;
        }).call(this);
      }
      this.specs = this.specs.map(parseOption);
      if (__indexOf.call(argv, '--help') >= 0 || __indexOf.call(argv, '-h') >= 0) {
        return this.print(this.getUsage());
      }
      options = {};
      args = argv.map(parseArgument).concat(parseArgument());
      positionals = [];
      args.reduce(__bind(function(arg, val) {
        var ch, last, _i, _len, _ref;
        if (arg.isValue) {
          positionals.push(arg.value);
        } else if (arg.chars) {
          last = arg.chars.pop();
          _ref = arg.chars;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            ch = _ref[_i];
            this.setOption(options, ch, true);
          }
          if (this.opt(last).flag) {
            this.setOption(options, last, true);
          } else if (val.isValue) {
            this.setOption(options, last, val.value);
            return parseArgument();
          } else {
            this.print("'-" + (this.opt(last).name || last) + "' expects a value\n\n" + (this.getUsage()));
          }
        } else if (arg.full) {
          value = arg.value;
          if (value == null) {
            if (this.opt(arg.full).flag) {
              value = true;
            } else if (val.isValue) {
              this.setOption(options, arg.full, val.value);
              return parseArgument();
            } else {
              this.print("'--" + (this.opt(arg.full).name || arg.full) + "' expects a value\n\n" + (this.getUsage()));
            }
          }
          this.setOption(options, arg.full, value);
        }
        return val;
      }, this));
      for (index = 0, _len = positionals.length; index < _len; index++) {
        pos = positionals[index];
        this.setOption(options, index, pos);
      }
      options._ = positionals;
      _ref = this.specs;
      for (_i = 0, _len2 = _ref.length; _i < _len2; _i++) {
        opt = _ref[_i];
        if (!(options[opt.name] != null)) {
          if (opt["default"] != null) {
            options[opt.name] = opt["default"];
          } else if (opt.required) {
            this.print("" + opt.name + " argument is required\n\n " + (this.getUsage()));
          }
        }
      }
      if ((command != null ? command.cb : void 0) != null) {
        message = command.cb(options);
        if (typeof message === 'string') {
          this.print(message);
        }
      } else if (((_ref2 = this.fallback) != null ? _ref2.cb : void 0) != null) {
        this.fallback.cb(options);
      }
      return options;
    };
    ArgumentParser.prototype.opt = function(arg) {
      var match, opt, _i, _len, _ref;
      match = parseOption({});
      _ref = this.specs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        opt = _ref[_i];
        if (opt.matches(arg)) {
          match = opt;
        }
      }
      return match;
    };
    ArgumentParser.prototype.setOption = function(options, arg, value) {
      var message, name, option, _ref;
      option = this.opt(arg);
      if (option.callback) {
        message = option.callback(value);
        if (typeof message === 'string') {
          this.print(message);
        }
      }
      if (option.type !== 'string') {
        try {
          value = JSON.parse(value);
        } catch (_e) {}
      }
      name = option.name || arg;
      if (option.choices && __indexOf.call(option.choices, value) < 0) {
        this.print("" + name + " must be one of: " + (option.choices.join(', ')));
      }
      if (option.list) {
                if ((_ref = options[name]) != null) {
          _ref;
        } else {
          options[name] = [];
        };
        return options[name].push(value);
      } else {
        return options[name] = value;
      }
    };
    ArgumentParser.prototype.parseArgs = function() {
      return this.parse.apply(this, arguments);
    };
    ArgumentParser.prototype.scriptName = function() {
      return this.script.apply(this, arguments);
    };
    ArgumentParser.prototype.globalOpts = function() {
      return this.options.apply(this, arguments);
    };
    ArgumentParser.prototype.opts = function() {
      return this.options.apply(this, arguments);
    };
    ArgumentParser.prototype.parseConfig = function(config) {
      var attrName, attrValue, command, commandData, commandName, data, name;
      for (name in config) {
        data = config[name];
        switch (name) {
          case 'commands':
            for (commandName in data) {
              commandData = data[commandName];
              command = this.command(commandName);
              for (attrName in commandData) {
                attrValue = commandData[attrName];
                command[attrName](attrValue);
              }
            }
            break;
          default:
            try {
              if (typeof data === 'function') {
                data = data(this);
              }
              this[name](data);
            } catch (error) {

            }
        }
      }
      return this;
    };
    return ArgumentParser;
  })();
  argumentParser = new ArgumentParser;
  for (i in argumentParser) {
    method = argumentParser[i];
    if (typeof method === 'function') {
      ArgumentParser[i] = method.bind(argumentParser);
    }
  }
  module.exports = ArgumentParser;
}).call(this);
