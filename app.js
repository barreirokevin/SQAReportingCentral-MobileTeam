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
        }
    })
    .help()
    .argv;
let command = argv._[0];

if (command == 'report') {
    console.log(`Constructing report . . .`);
    // username: "kevin.barreiro@arthrex.com"
    // password: "j7bkb3IQYSiaFJ5sHa8D02E9"
    // board id (A-Team bopard id) = 286
    report.getReport(argv.boardid, argv.username, argv.apikey);
} else {
    console.log('Command not recognized');
}