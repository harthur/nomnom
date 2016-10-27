var nomnom = require("../nomnom");

var opts = {
  file: {
    position: 0,
    required: true
  }
}

var parser = nomnom().options(opts);

exports.testFlag = function(test) {
  test.expect(1);

  nomnom().options({
    file: {
      position: 0,
    }
  })
  .printer(function(string) {
    test.equal(0, string.indexOf("'--key1' expects a value"))
    test.done();
  })
  .parse(["--key1"]);
}

exports.testRequired = function(test) {
  test.expect(1);

  nomnom().options({
    file: {
      required: true
    }
  })
  .printer(function(string) {
    test.equal(0, string.trim().indexOf("file argument is required"))
    test.done();
  })
  .nocolors()
  .parse([]);
}

exports.testChoices = function(test) {
  test.expect(2);

  var parser = nomnom().options({
    color: {
      choices: ['green', 'blue']
    }
  })
  .printer(function(string) {
    test.equal(0, string.indexOf("color must be one of: green, blue"))
  });

  parser.parse(['--color', 'red']);

  var options = parser.parse(['--color', 'green']);
  test.equal(options.color, 'green');
  test.done();
}

exports.testInterspersedCommand = function (test) {
  test.expect(6);

  var parser = function (printer) {
    var parser = nomnom().options({
      foo: {
        flag: true,
        help: 'bar'
      }
    }).nocolors();
    parser.command('cmd')
      .help('fixes all the things')
      .options({
        bar: {
          abbr: 'b',
          flag: true,
          help: 'foo'
        }
      });
    if (printer) {
      parser.printer(printer);
    }
    return parser;
  };

  var options = undefined;

  test.throws(function() {
    parser(function (string) {
      debugger
      test.equal(0, string.indexOf('commands can not be interspersed with arguments'));
      throw new Error()
    }).parse(['--foo', 'cmd', '-b']);
  }, Error)
  test.throws(function() {
    parser(function (string) {
      test.equal(1, string.indexOf('command argument is required'));
      throw new Error()
    }).parse(['--foo', '-b', 'cmd']);
  }, Error)

  options = parser().parse(['cmd', '--foo', '-b']);
  test.ok(options.foo);
  test.ok(options.bar);
  test.done();
}
