const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

const clientId = 'your-client-id';
const clientSecret = 'your-client-secret';
const refreshToken = 'your-refresh-token'; // Obtain during the initial token request
const tokenEndpoint = 'https://auth.example.com/token';

// Middleware to handle token refresh
app.use(async (req, res, next) => {
    try {
        const newAccessToken = await refreshAccessToken();
        req.accessToken = newAccessToken;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Token refresh failed' });
    }
});

// Example route that requires a valid access token
app.get('/secure-endpoint', (req, res) => {
    res.json({ message: 'Access granted with refreshed token' });
});

// Function to refresh an OAuth 2.0 access token using the Refresh Token Grant Type
const refreshAccessToken = async () => {
    try {
        const response = await axios.post(tokenEndpoint, {
            grant_type: 'refresh_token',
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
        });

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token; // Optional: Some servers may issue a new refresh token

        console.log('New Access Token:', newAccessToken);
        console.log('New Refresh Token:', newRefreshToken);

        return newAccessToken;
    } catch (error) {
        console.error('Error refreshing access token:', error.message);
        throw error;
    }
};

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
