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

app.get('/fetchPaymentIntent/:amount', async(req, res)=> {

    const amount = req.params.amount;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'gbp',
        payment_method_types: ['card']
    });

    res.send({clientSecret: paymentIntent.client_secret});
})

module.exports = app;
