const express = require('express');
const { google } = require('googleapis');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// Google Sheets setup
async function getSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

// Fetch and process tickets
app.get('/process-tickets', async (req, res) => {
  const sheets = await getSheet();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const range = 'Sheet1!A2:H'; // Adjust as needed

  // 1. Read data
  const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
  const rows = response.data.values;

  if (!rows.length) return res.send('No data found.');

  for (let i = 0; i < rows.length; i++) {
    const [ticketId, subject, content, playbookName, status, issueNumber, ghiStatus] = rows[i];

    if (playbookName === 'EngineeringBug' && !issueNumber) {
      // 2. Create GitHub issue via my github_issue_create API
      const issueRes = await axios.post(process.env.GITHUB_ISSUE_API_URL, {
        owner: "Tanukumar01",
        repo: "Tech-blend",
        title: subject,
        body: content,
      });
      console.log(issueRes.data);

      const newIssueNumber = issueRes.data.issue.number;
      const newGhiStatus = issueRes.data.issue.state === 'open' ? 'Open' : 'Close';

      // 3. Update Google Sheet
      const updateRange = `E${i + 2}:G${i + 2}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: updateRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Triggered', newIssueNumber, newGhiStatus]],
        },
      });
    }
  }

  res.status(200).send('Tickets processed.');
});

app.listen(3000, () => console.log('Server running on port http://localhost:3000'));