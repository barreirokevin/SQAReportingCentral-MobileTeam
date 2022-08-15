const _ = require('lodash');
const yargs = require('yargs');
const reportService = require('./reportService');
const login = require("./loginCredentials.json");

const argv = yargs
    .command('report', 'Construct the SQA report', {
        boardid: {
            describe: 'A-Team board ID (located in Jira URL)',
            demand: true,
            alias: 'b'
        }
    })
    .help()
    .argv;
let command = argv._[0];

if (command == 'report') {
    // filter out any tickets containing the values in the filters list
    let filters = [];
    // construct the SQA report
    console.log(`Constructing report . . .`);
    reportService.getReport(argv.boardid, login.user, login.key, filters);
} else {
    console.log('Command not recognized');
}