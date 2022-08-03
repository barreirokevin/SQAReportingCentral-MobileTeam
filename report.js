const axios = require('axios');
const base64 = require('base64-js');
const fs = require('fs');
const open = require('open');

function encodeAuthorization(user, apiKey) {
    // Encode Authorization header to Base64
    const utf8Encode = new TextEncoder();
    const authCreds = base64.fromByteArray(utf8Encode.encode(`${user}:${apiKey}`));
    return authCreds;
}

function fetchActiveSprintMetaDataFor(boardId, encodedAuth) {
    // GET metadata for the active sprint
    return axios
        // NOTE: endpoint has a query string ?state=active so that only the active sprint metadata is returned
        .get(`https://arthrex.atlassian.net/rest/agile/1.0/board/${boardId}/sprint?state=active`, {
            headers: {
                Authorization: `Basic ${encodedAuth}`
            }
        })
        .then((response) => {
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
        // NOTE: endpoint has a query string ?maxResults=500 so that all issues in the active sprint are returned
        .get(`https://arthrex.atlassian.net/rest/agile/1.0/board/${boardId}/sprint/${activeSprintId}/issue?maxResults=500`, {
            headers: {
                Authorization: `Basic ${encodedAuth}`
            }
        })
        .then((response) => {
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

function constructReport(filters) {
    // Get the data needed for the SQA report
    let activeSprintMetaData = JSON.parse(fs.readFileSync('./data/activeSprintMetaData.json'));
    let activeSprintIssuesData = JSON.parse(fs.readFileSync('./data/activeSprintIssuesData.json'));
    let activeSprintName = activeSprintMetaData.values[0].name;
    var issuesData = {}; // Contains the data needed for the report

    // populate issuesData with project id's as keys
    activeSprintIssuesData.issues.forEach(issue => {
        issuesData[issue.fields.project.key] = [];
    });

    // populate each project id with corresponding ticket data
    activeSprintIssuesData.issues.forEach(issue => {
        let issueData = `${issue.key} ${issue.fields.summary}`;

        // Push issueData local variable into issuesData object
        Object.keys(issuesData).forEach(projectId => {
            if (issue.key.substring(0, issue.key.indexOf('-')) == projectId) {
                issuesData[projectId].push(issueData);
            }
        });
    });

    // clean the data in the issuesData object
    issuesData = cleanData(issuesData, filters);
    console.log(issuesData);

    // Construct the SQA report text file with the data in the issuesData object
    let reportPath = './reports/SQAReport.txt';
    fs.writeFileSync(reportPath, ''); // create the initial SQAReport.txt file
    Object.keys(issuesData).forEach(projectId => {
        // write the active sprint name and date to the SQAReport.txt file
        fs.writeFileSync(reportPath, `${activeSprintName}\n`, { flag: 'a' });
        // write each ticket to the SQAReport.txt file
        issuesData[projectId].forEach(ticket => {
            fs.writeFileSync(reportPath, `${ticket}\n`, { flag: 'a' });
        });
        fs.writeFileSync(reportPath, '\n', { flag: 'a' });
    });

    console.log('The report was constructed successfully!');
}

function cleanData(data, filters) { 
    if (typeof data === 'object' && typeof filters === 'object') {
        Object.keys(data).forEach(projectId => {
            // remove duplicate ticket data
            data[projectId] = new Set(data[projectId]);

            // remove ticket data if it includes any values in filter
            data[projectId].forEach(ticket => {
                filters.forEach(filter => {
                    if (ticket.includes(filter)) {
                        data[projectId].delete(ticket);
                    }
                });
            });
        });

        return data;
    }
}

function getReport(boardId, user, apiKey, filters) {
    // Encode authentication to Base64
    let authCreds = encodeAuthorization(user, apiKey);

    // Get active sprint metadata
    fetchActiveSprintMetaDataFor(boardId, authCreds);

    // Get active sprint issues data
    fetchActiveSprintIssuesDataFor(boardId, authCreds);

    // Construct the SQA report
    constructReport(filters);

    // Open the SQA report GUI
    open('./reports/SQAReport.txt');
}

module.exports = {
    getReport
};