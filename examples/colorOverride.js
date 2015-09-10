var chalk = require('chalk');

var parser = require("../nomnom")
    .script("runtests")
    .setColors({
        usageHeadingColor: chalk.green,
        usageStringColor: chalk.bgCyan,
        positionalHelpColor: chalk.red,
        optionsHeaderColor: chalk.cyan,
        helpColor: chalk.bgCyan,
        requiredArgColor: chalk.magenta
    })
    .options({
        path: {
            position: 0,
            help: "Test file to run",
            list: true
        },
        config: {
            abbr: 'c',
            metavar: 'FILE',
            help: "Config file with tests to run"
        },
        debug: {
            abbr: 'd',
            flag: true,
            help: "Print debugging info"
        }
    });


var opts = parser.parse();

console.log('\nopts:\n', JSON.stringify(opts, undefined, 4));
