import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/business.manage'];

app.get('/', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
  try {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);
    res.redirect('/reviews');
  } catch (err) {
    console.error('OAuth Error:', err);
    res.status(500).send('Authentication failed.');
  }
});

app.get('/reviews', async (req, res) => {
  try {
    import { google } from 'googleapis';

const businessProfile = google.businessprofile('v1');


    const accountsRes = await mybusiness.accounts.list();
    const account = accountsRes.data.accounts[0];

    const locationsRes = await mybusiness.accounts.locations.list({
      parent: `accounts/${account.name.split('/')[1]}`,
    });
    const location = locationsRes.data.locations[0];

    const reviewsRes = await mybusiness.accounts.locations.reviews.list({
      parent: location.name,
    });

    res.json(reviewsRes.data.reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).send('An error occurred while fetching reviews.');
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
