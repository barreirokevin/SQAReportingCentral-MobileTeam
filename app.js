const fs = require('fs');
const _ = require('lodash');
const { demand } = require('yargs');
const yargs = require('yargs');
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
        },
        activesprintid: {
            describe: 'Sprint ID for the Active Sprint (located in Jira URL)',
            demand: true,
            alias: 'a'
        }
    })
    .help()
    .argv;
let command = argv._[0];

if (command == 'report') {
    console.log(`Constructing report . . .`);
    // username: "kevinbarreirooo729@gmail.com"
    // password: "eSyJ0ozlw7X3kNEea2xwA69E"
    // board id = 1
    // sprint id = 1
    report.getReport(argv.boardid, argv.activesprintid, argv.username, argv.apikey);
} else {
    console.log('Command not recognized');
}