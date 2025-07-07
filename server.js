const express = require('express');
const { google } = require('googleapis');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'GitHub Update Status Tool is running',
    timestamp: new Date().toISOString()
  });
});

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
  try {
    console.log('Starting ticket processing...');
    
    // Check environment variables
    if (!process.env.GOOGLE_SHEET_ID) {
      console.error('GOOGLE_SHEET_ID environment variable is missing');
      return res.status(500).json({ error: 'GOOGLE_SHEET_ID environment variable is missing' });
    }
    
    const sheets = await getSheet();
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Sheet1!A2:H'; // Adjust as needed

    console.log(`Fetching data from sheet: ${sheetId}, range: ${range}`);

    // 1. Read data
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
    const rows = response.data.values;

    console.log(`Found ${rows ? rows.length : 0} rows of data`);

    if (!rows || !rows.length) return res.json({ result: 'No data found.' });

    for (let i = 0; i < rows.length; i++) {
      const [ticketId, subject, content, playbookName, status, issueNumber, ghiStatus] = rows[i];

      if (playbookName === 'EngineeringBug' && !issueNumber) {
        // 2. Create GitHub issue directly using GitHub API
        const githubApiUrl = `https://api.github.com/repos/Tanukumar01/Tech-blend/issues`;
        const githubToken = process.env.GITHUB_TOKEN;

        const issueRes = await axios.post(
          githubApiUrl,
          {
            title: subject,
            body: content,
          },
          {
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github+json',
              'User-Agent': 'gh-update-status-tool'
            }
          }
        );
        console.log(issueRes.data);

        const newIssueNumber = issueRes.data.number;
        const newGhiStatus = issueRes.data.state === 'open' ? 'Open' : 'Close';

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

    res.status(200).json({ result: 'Tickets processed.' });
  } catch (error) {
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Add POST handler for /process-tickets
app.post('/process-tickets', async (req, res) => {
  try {
    console.log('Starting ticket processing (POST)...');
    // Check environment variables
    if (!process.env.GOOGLE_SHEET_ID) {
      console.error('GOOGLE_SHEET_ID environment variable is missing');
      return res.status(500).json({ error: 'GOOGLE_SHEET_ID environment variable is missing' });
    }
    const sheets = await getSheet();
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Sheet1!A2:H'; // Adjust as needed
    console.log(`Fetching data from sheet: ${sheetId}, range: ${range}`);
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
    const rows = response.data.values;
    console.log(`Found ${rows ? rows.length : 0} rows of data`);
    if (!rows || !rows.length) return res.json({ result: 'No data found.' });
    for (let i = 0; i < rows.length; i++) {
      const [ticketId, subject, content, playbookName, status, issueNumber, ghiStatus] = rows[i];
      if (playbookName === 'EngineeringBug' && !issueNumber) {
        // 2. Create GitHub issue directly using GitHub API
        const githubApiUrl = `https://api.github.com/repos/Tanukumar01/Tech-blend/issues`;
        const githubToken = process.env.GITHUB_TOKEN;

        const issueRes = await axios.post(
          githubApiUrl,
          {
            title: subject,
            body: content,
          },
          {
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github+json',
              'User-Agent': 'gh-update-status-tool'
            }
          }
        );
        console.log(issueRes.data);

        const newIssueNumber = issueRes.data.number;
        const newGhiStatus = issueRes.data.state === 'open' ? 'Open' : 'Close';

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
    res.status(200).json({ result: 'Tickets processed.' });
  } catch (error) {
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));