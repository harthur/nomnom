var nomnom = require("../lib/nomnom");


var config = {
  commands: {
    "new": {
      help: "Create new project",
      options: {
        appPath: {
          position: 1,
          help: "application path",
          metavar: "APP_PATH",
          required: true
        },
        buildPath: {
          abbr: "o",
          help: "build path",
          metavar: "DIRECTORY",
          full: "output"
        }
      },
      callback: function(options) {
        return "callback called";
      }
    },
    generate: {
      help: "Generate model, view or route for current project",
      options: {
        generator: {
          position: 1,
          help: "generator type",
          metavar: "GENERATOR",
          choices: ["collection", "model", "router", "style", "template", "view"],
          required: true
        },
        name: {
          position: 2,
          help: "generator class name / filename",
          metavar: "NAME",
          required: true
        }
      },
      callback: function(options) {
        return "generate called";
      }
    }
  },
  options: {
    version: {
      abbr: "v",
      help: "display app version",
      flag: true,
      callback: function() {
        return "version called";
      }
    }
  },
  script: "app"
};

var generateParser = function(test, expected) {
  return nomnom().parseConfig(config).printer(function(string) {
    test.equal(string, expected);
  });
};


exports.testConfig = function(test) {
  test.expect(2);

  parser = generateParser(test, config.options.version.callback());
  parser.parse(["--version"]);

  parser = generateParser(test, config.commands["new"].callback());
  parser.parse(["new", "--appPath", "."]);
  test.done();
};
