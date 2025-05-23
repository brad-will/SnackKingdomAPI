import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  REFRESH_TOKEN
} = process.env;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Initialize the My Business API client (version v4)
const mybusiness = google.mybusiness({ version: 'v4', auth: oauth2Client });

app.get('/reviews', async (req, res) => {
  try {
    // 1. List accounts
    const accountsResponse = await mybusiness.accounts.list();
    const accounts = accountsResponse.data.accounts;
    if (!accounts || accounts.length === 0) {
      return res.status(404).json({ error: 'No accounts found' });
    }

    const accountName = accounts[0].name; // format: accounts/{accountId}

    // 2. List locations under the account
    const locationsResponse = await mybusiness.accounts.locations.list({
      parent: accountName
    });
    const locations = locationsResponse.data.locations;
    if (!locations || locations.length === 0) {
      return res.status(404).json({ error: 'No locations found' });
    }

    const locationName = locations[0].name; // format: accounts/{accountId}/locations/{locationId}

    // 3. List reviews for the location
    const reviewsResponse = await mybusiness.accounts.locations.reviews.list({
      parent: locationName
    });

    const reviews = reviewsResponse.data.reviews || [];

    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
