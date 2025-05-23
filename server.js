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

const myBusiness = google.businessprofile({ version: 'v1', auth: oauth2Client });

app.get('/', async (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/business.manage'],
  });
  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const accounts = await myBusiness.accounts.list();
  const account = accounts.data.accounts[0];

  const locations = await myBusiness.accounts.locations.list({
    parent: account.name,
  });

  const location = locations.data.locations[0];

  const reviews = await myBusiness.accounts.locations.reviews.list({
    parent: location.name,
  });

  res.send(reviews.data);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
