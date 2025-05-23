import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import open from 'open';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const scopes = ['https://www.googleapis.com/auth/business.manage'];

app.get('/', async (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const businessProfile = google.mybusinessbusinessinformation({
      version: 'v1',
      auth: oauth2Client,
    });

    const accountsRes = await businessProfile.accounts.list();
    const account = accountsRes.data.accounts[0];
    const accountId = account.name; // e.g., 'accounts/123456789'

    const locationsRes = await businessProfile.accounts.locations.list({
      parent: accountId,
    });

    const location = locationsRes.data.locations[0];
    const locationId = location.name; // e.g., 'accounts/123456789/locations/987654321'

    const reviewsRes = await businessProfile.accounts.locations.reviews.list({
      parent: locationId,
    });

    res.json(reviewsRes.data);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).send('An error occurred while fetching reviews.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  open(`http://localhost:${port}`);
});
