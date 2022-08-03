const fs = require('fs');
const _ = require('lodash');
const { demand } = require('yargs');
const yargs = require('yargs');
const prompt = require('prompt-sync')({sigint: true});
const report = require('./report');

const argv = yargs
    .command('report', 'Construct the SQA report', {
        username: {
            describe: 'Username for Jira',
            demand: true,
            alias: 'u'
        },
        apikey: {
            describe: 'Jira API key (located in Jira settings)',
            demand: true,
            alias: 'k'
        },
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
    let filters = ["DEV:", "Development"];
    // construct the SQA report
    console.log(`Constructing report . . .`);
    report.getReport(argv.boardid, argv.username, argv.apikey, filters);
} else {
    console.log('Command not recognized');
}