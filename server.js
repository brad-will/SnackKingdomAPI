import express from 'express';
import { google } from 'googleapis';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

// Setup OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

// Root: basic check
app.get('/', (req, res) => {
  res.send('Snack Kingdom API is running.');
});

// GET /reviews
app.get('/reviews', async (req, res) => {
  try {
    // Get token
    const { token } = await oauth2Client.getAccessToken();

    // Get account ID
    const accountsResponse = await axios.get(
      'https://mybusinessbusinessinformation.googleapis.com/v1/accounts',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const account = accountsResponse.data.accounts?.[0];
    if (!account) return res.status(404).send('No account found');

    // Get locations
    const locationsResponse = await axios.get(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const location = locationsResponse.data.locations?.[0];
    if (!location) return res.status(404).send('No location found');

    // Get reviews
    const reviewsResponse = await axios.get(
      `https://mybusiness.googleapis.com/v4/${location.name}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json(reviewsResponse.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Error fetching reviews');
  }
});

app.listen(port, () => {
  console.log(`Snack Kingdom API running at http://localhost:${port}`);
});
