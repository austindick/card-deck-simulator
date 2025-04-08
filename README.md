# Card Deck Simulator

A React application for simulating a custom deck of cards, with the ability to update card data from Google Sheets.

## Features

- Load cards from Google Sheets
- Draw cards randomly from the deck
- Reset the deck
- Display card details including images and attributes
- Responsive design for different screen sizes

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Google Sheets:
   - Create a new Google Sheet
   - Add the following columns to your sheet:
     - name (required)
     - description (required)
     - imageUrl (optional)
     - Add any additional columns for card attributes
   - Make sure the first row contains the column headers

4. Set up Google Sheets API:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Google Sheets API
   - Create credentials (API key)
   - Copy your API key

5. Update the configuration:
   - Open `src/App.tsx`
   - Replace `YOUR_SPREADSHEET_ID` with your Google Sheet ID (found in the sheet's URL)
   - Replace `YOUR_API_KEY` with your Google Sheets API key
   - Adjust the `range` if your data is in a different sheet or range

6. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. The application will load cards from your Google Sheet
2. Click "Draw Card" to draw a random card from the deck
3. Click "Reset Deck" to return all drawn cards to the deck
4. The number of remaining cards is displayed above the deck

## Google Sheet Format

Your Google Sheet should be formatted as follows:

| name | description | imageUrl | attribute1 | attribute2 | ... |
|------|-------------|----------|------------|------------|-----|
| Card 1 | Description 1 | https://... | value1 | value2 | ... |
| Card 2 | Description 2 | https://... | value3 | value4 | ... |

## Contributing

Feel free to submit issues and enhancement requests!
