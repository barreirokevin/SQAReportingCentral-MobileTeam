# Construct the SQA Report App
1. On the Terminal, go to the project directory.
2. Execute `git pull` to get the latest code.  
3. Execute `npm install` to get all the dependencies.
4. Create a file called `loginCredentials.json` and place your Jira credentials inside that file in the following manner:
    ```
    {
        "user": "".
        "key": ""
    }
    ```
5. NOTE: The key is an API key you can get from your Jira account settings.
6. If necessary, set the proper `boardId` in the `package.json` file
7. Execute `npm run report` to get the SQA report.

## Notes:
- If you would like to filter out certain tickets from the report:
    1. Go to the app.js file.
    2. On line 32, append a `String` to the array that contains a substring in the ticket
        - For example, if you want to exclude a ticket that has the data 'RAI-783 DEV: add something to the api', you can include "DEV:" in the array on line 32 of app.js to exclude the ticket from the SQA Report.
