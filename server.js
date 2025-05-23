import express from 'express';
import { google } from 'googleapis';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Set refresh token credentials
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

// Root route for friendly homepage
app.get('/', (req, res) => {
  res.send('🚀 Snack Kingdom API is running!');
});

// Endpoint to list Google Business Profile accounts
app.get('/accounts', async (req, res) => {
  try {
    const { token } = await oauth2Client.getAccessToken();

    const response = await axios.get(
      'https://mybusinessbusinessinformation.googleapis.com/v1/accounts',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('❌ Error fetching accounts:', error.response?.data || error.message);
    res.status(500).send('Error fetching business accounts');
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Snack Kingdom API running at http://localhost:${port}`);
});
