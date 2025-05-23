import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // add this if you're using fetch

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

app.get('/', (req, res) => {
  res.send('Snack Kingdom API is running.');
});

app.get('/reviews', async (req, res) => {
  try {
    const { token } = await oauth2Client.getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    // Get accounts
    const accRes = await fetch('https://mybusinessbusinessinformation.googleapis.com/v1/accounts', { headers });
    const accData = await accRes.json();
    console.log("Accounts:", accData);

    const account = accData.accounts?.[0];
    if (!account) throw new Error('No business accounts found');

    // Get locations
    const locRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`, { headers });
    const locData = await locRes.json();
    console.log("Locations:", locData);

    const location = locData.locations?.[0];
    if (!location) throw new Error('No locations found for account');

    // Get reviews
    const revRes = await fetch(`https://mybusiness.googleapis.com/v4/${location.name}/reviews`, { headers });
    const revData = await revRes.json();
    console.log("Reviews:", revData);

    res.json(revData);
  } catch (err) {
    console.error("Detailed error:", err);
    res.status(500).send('Error fetching reviews');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
