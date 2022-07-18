const axios = require('axios');
const base64 = require('base64-js');
const fs = require('fs');
const open = require('open');

function encodeAuthorization(user, apiKey) {
    // Encode Authorization header to Base64
    const utf8Encode = new TextEncoder();
    const authCreds =  base64.fromByteArray(utf8Encode.encode(`${user}:${apiKey}`));
    return authCreds;
}

function fetchActiveSprintMetaDataFor(boardId, encodedAuth) {
    // GET metadata for the active sprint
    return axios
        .get(`https://arthrex.atlassian.net/rest/agile/1.0/board/${boardId}/sprint?state=active`, {
            headers: {
                Authorization: `Basic ${encodedAuth}`
            }
        })
        .then((response) => {
            //console.log('Retrieving active sprint data . . .');
            //console.log(`Response status code: ${response.status}`);
            let data = JSON.stringify(response.data);
            fs.writeFileSync('./data/activeSprintMetaData.json', data, error => {
                if (error) {
                    console.log(error);
                }
            });
        })
        .catch(error => {
            console.error(error);
        });
}

function fetchActiveSprintIssuesDataFor(boardId, encodedAuth) {
    let activeSprintId = JSON.parse(fs.readFileSync('./data/activeSprintMetaData.json')).values[0].id;

    // GET issues data for the active sprint
    return axios
        .get(`https://arthrex.atlassian.net/rest/agile/1.0/board/${boardId}/sprint/${activeSprintId}/issue`, {
            headers: {
                Authorization: `Basic ${encodedAuth}`
            }
        })
        .then((response) => {
            //console.log('Retrieving active sprint issues data . . .');
            //console.log(`Reponse status code: ${response.status}`);
            let data = JSON.stringify(response.data);
            fs.writeFileSync('./data/activeSprintIssuesData.json', data, error => {
                if (error) {
                    console.log(error);
                }
            });
        })
        .catch(error => {
            console.error(error);
        });
}

function constructReport() {
    // Get the relevant data needed for the SQA report
    let activeSprintMetaData = JSON.parse(fs.readFileSync('./data/activeSprintMetaData.json'));
    let activeSprintIssuesData = JSON.parse(fs.readFileSync('./data/activeSprintIssuesData.json'));
    let activeSprintName = activeSprintMetaData.values[0].name;
    let issuesData = {}; // Contains the data needed for the report
    activeSprintIssuesData.issues.forEach(issue => {
        // create issuesData object properties
        if (!(issue.fields.project.key in issuesData)) {
            issuesData[issue.fields.project.key] = [];
        }

        // insert issue data into issuesData object
        issuesData[issue.fields.project.key].push(`${issue.key} ${issue.fields.subtasks.length} subtasks ${issue.fields.summary}`);
    });
    
    // Construct the SQA report text file with the relevant data
    let reportPath = './reports/SQAReport.txt';
    fs.writeFileSync(reportPath, ''); // create the initial report .txt file
    for (let key in issuesData) {
        fs.writeFileSync(reportPath, `${activeSprintName}\n`, { flag: 'a' });
        issuesData[key].forEach(issue => fs.writeFileSync(reportPath, `${issue}\n`, { flag: 'a' }));
        fs.writeFileSync(reportPath, '\n', { flag: 'a' });
    }
    
    console.log('The report was constructed successfully!')
}

async function getReport(boardId, user, apiKey) {
    // Encode authentication to Base64
    let authCreds = encodeAuthorization(user, apiKey);

    // Get active sprint metadata
    await fetchActiveSprintMetaDataFor(boardId, authCreds);

    // Get active sprint issues data
    await fetchActiveSprintIssuesDataFor(boardId, authCreds);

    // Construct the SQA report
    constructReport();

    // Open the SQA report GUI
    open('./reports/SQAReport.txt')
}

module.exports = {
    getReport
};