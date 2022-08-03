# Construct the SQA Report App
1. Run 'npm install' before creating the report to get all the dependencies.
2. Set the proper arguments for the "report" script in the package.json file
3. Run 'npm run report' to get the SQA report.

## Notes:
- If you would like to filter out certain tickets from the report:
    1. Go to the app.js file.
    2. On line 32, append a String to the array that contains a substring in the ticket
        - For example, if you want to exclude a ticket that has the data 'RAI-783 DEV: add something to the api', you can include "DEV:" in the array on line 32 of app.js to exclude the ticket from the SQA Report.
