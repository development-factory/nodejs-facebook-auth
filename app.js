const express = require('express');
const axios = require('axios');
require('dotenv').config();
const qs = require('qs');

const config = require('./config');

const app = express();
const port = process.env.PORT || 5500;

app.get('/', (req, res) => {
    res.send('Express api for Facebook auth')
});

// Auth endpoint
app.get('/auth', (req, res) => {
    // Redirecting call to Facebook endpoint to get authorization code
    res.redirect(config.auth +
        '?client_id=' + process.env.CLIENT_ID +
        '&redirect_uri=' + encodeURIComponent('http://localhost:5500/auth-callback') +
        '&response_type=code'
    );
});

// Auth callback endpoint
app.get('/auth-callback', async (req, res) => {
    // Retrieving code from querystring
    const code = req.query.code;

    // Building token request
    const data = {
        code: code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:5500/auth-callback',       
    };

    const auth = await axios({
        method: 'post',
        url: config.token,
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(data)
    }).catch(error => console.log(error));

    // Retrieving token from auth response and requesting for user data
    const user = await axios({
        method: 'get',
        url: config.me,
        headers: {
            Authorization: 'Bearer ' + auth.data.access_token,
        }

    }).catch(error => console.log(error));

    // Do something with user data
    res.send(user.data);
});

app.listen(port, () => {
    console.log(`Server started, listening on port ${port}`);
});
