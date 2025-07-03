# GitHub Update Status Tool

A Node.js application that automatically processes tickets from Google Sheets and creates GitHub issues for engineering bugs.

## Features

- 📊 Reads ticket data from Google Sheets
- 🐛 Automatically creates GitHub issues for EngineeringBug tickets
- 🔄 Updates Google Sheets with issue numbers and status
- 🚀 RESTful API endpoint for processing tickets

## Prerequisites

- Node.js (v14 or higher)
- Google Cloud Service Account
- GitHub Personal Access Token
- Google Sheets API access

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gh-update-status
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables by creating a `.env` file:
```env
GOOGLE_SERVICE_ACCOUNT=path/to/service-account.json
GOOGLE_SHEET_ID=your-google-sheet-id
GITHUB_ISSUE_API_URL=your-github-issue-api-endpoint
```

4. Place your Google Service Account JSON file in the project root and update the path in `.env`.

## Configuration

### Google Sheets Setup
- Create a Google Sheet with the following columns:
  - A: Ticket ID
  - B: Subject
  - C: Content
  - D: Playbook Name
  - E: Status
  - F: Issue Number
  - G: GitHub Status

### GitHub API Setup
- Ensure your GitHub issue creation API endpoint is configured
- The tool expects the API to return issue data in the format:
```json
{
  "issue": {
    "number": 123,
    "state": "open"
  }
}
```

## Usage

1. Start the server:
```bash
node server.js
```

2. The server will run on `http://localhost:3000`

3. Process tickets by making a GET request:
```bash
curl http://localhost:3000/process-tickets
```

## API Endpoints

### GET /process-tickets
Processes all tickets in the Google Sheet and creates GitHub issues for EngineeringBug tickets.

**Response:**
- `200`: Tickets processed successfully
- Error messages for various failure scenarios

## How It Works

1. **Read Data**: Fetches ticket data from Google Sheets (range: Sheet1!A2:H)
2. **Filter Tickets**: Identifies tickets with `playbookName === 'EngineeringBug'` and no existing issue number
3. **Create Issues**: Calls GitHub API to create new issues with ticket subject and content
4. **Update Sheet**: Updates the Google Sheet with:
   - Status: "Triggered"
   - Issue Number: The newly created GitHub issue number
   - GitHub Status: "Open" or "Close" based on issue state

## Dependencies

- `express`: Web framework
- `googleapis`: Google Sheets API integration
- `axios`: HTTP client for API calls
- `dotenv`: Environment variable management

## Project Structure

```
gh-update-status/
├── server.js              # Main application file
├── package.json           # Dependencies and scripts
├── service-account.json   # Google Service Account credentials
├── .env                   # Environment variables (create this)
└── README.md             # This file
```

## Error Handling

The application includes basic error handling for:
- Missing Google Sheets data
- API failures
- Authentication issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC License

## Support

For issues and questions, please create an issue in the repository. 