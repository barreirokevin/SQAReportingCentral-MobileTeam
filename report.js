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
    var issuesData = {}; // Contains the data needed for the report

    // populate issuesData with project id's as keys
    activeSprintIssuesData.issues.forEach(issue => {
        issuesData[issue.fields.project.key] = [];
    });

    // populate each project id with ticket data
    activeSprintIssuesData.issues.forEach(issue => {
        let parentData = issue.fields.parent;

        if (parentData !== undefined) { 
            let issueData = `${parentData.key} ${parentData.fields.summary}`;
            Object.keys(issuesData).forEach(projectId => {
                if (parentData.key.includes(projectId)) {
                    issuesData[projectId].push(issueData);
                }
            });
        }
    });

    Object.keys(issuesData).forEach(projectId => {
        // remove duplicate ticket data
        issuesData[projectId] = new Set(issuesData[projectId]);
// TODO: remove ticket data with "DEV:" 
    });
    
    // Construct the SQA report text file with the relevant data
    let reportPath = './reports/SQAReport.txt';
    fs.writeFileSync(reportPath, ''); // create the initial report .txt file
    Object.keys(issuesData).forEach(projectId => {
        // write the active sprint name and date to the file
        fs.writeFileSync(reportPath, `${activeSprintName}\n`, { flag: 'a' });
        // write each ticket to the file
        issuesData[projectId].forEach(ticket => {
            fs.writeFileSync(reportPath, `${ticket}\n`, { flag: 'a' });
        });
        fs.writeFileSync(reportPath, '\n', { flag: 'a' });
    });
    
    console.log('The report was constructed successfully!');
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
    open('./reports/SQAReport.txt');
}

module.exports = {
    getReport
};