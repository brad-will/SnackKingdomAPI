import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';

// Create your Express app
const app = express();
app.use(cors());
app.use(express.json());

// OAuth2 client setup - fill these from your Google Cloud credentials and tokens
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Set the refresh token on the client so it can get access tokens automatically
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Initialize the Business Profile API client
const businessProfile = google.mybusinessbusinessinformation('v1');

app.get('/reviews', async (req, res) => {
  try {
    // List the accounts associated with your business profile
    const accountsResponse = await businessProfile.accounts.list({
      auth: oauth2Client,
    });
    
    const accounts = accountsResponse.data.accounts;
    if (!accounts || accounts.length === 0) {
      return res.status(404).json({ error: 'No Google Business accounts found' });
    }
    
    const accountName = accounts[0].name; // e.g., 'accounts/1234567890'

    // List locations under that account
    const locationsResponse = await businessProfile.accounts.locations.list({
      auth: oauth2Client,
      parent: accountName,
    });

    const locations = locationsResponse.data.locations;
    if (!locations || locations.length === 0) {
      return res.status(404).json({ error: 'No locations found for this account' });
    }

    const locationName = locations[0].name; // e.g., 'accounts/1234567890/locations/987654321'

    // Fetch reviews for that location
    const reviewsResponse = await businessProfile.accounts.locations.reviews.list({
      auth: oauth2Client,
      parent: locationName,
    });

    const reviews = reviewsResponse.data.reviews || [];
    
    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
