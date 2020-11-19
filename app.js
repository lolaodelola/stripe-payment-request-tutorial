require('dotenv').config();
const express = require('express');
const path = require('path');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_API_KEY);

const app = express();

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Starting server at ${port}`);
});

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
