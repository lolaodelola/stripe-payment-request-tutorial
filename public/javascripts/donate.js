const stripe = Stripe('pk_test_qw1GN1EHv140IRz7N9Q6QcyX');
// const stripe = Stripe('YOUR STRIPE PUBLISHABLE KEY');
const elements = stripe.elements();

function convertAmountToPence(amount){
    return amount * 100;
}

function constructPaymentRequest(amount){
    const paymentRequest = stripe.paymentRequest({
        country: 'GB',
        currency: 'gbp',
        total: {
            label: 'Donation',
            amount: amount,
        },
        requestPayerName: true,
        requestPayerEmail: true
    });
    return paymentRequest;
}

function constructPRButton(paymentRequest){
    const paymentReqButton = elements.create('paymentRequestButton', {
        paymentRequest,
    });
    return paymentReqButton;
}

async function mountPRButton(paymentRequest, paymentReqButton){
    await paymentRequest.canMakePayment().then(() => {
        paymentReqButton.mount('#payment-request-button');
    }).catch(() => {
        document.getElementById('payment-request-button').style.display = 'none';
    })
}

async function fetchPaymentIntentClientSecret(amount){
    const fetchedPaymentIntentCS = await fetch(`/fetchPaymentIntent/${amount}`);
    const clientSecretObj = await fetchedPaymentIntentCS.json();

    return clientSecretObj.clientSecret;
}

async function confirmPayment(paymentRequest, clientSecret){
    paymentRequest.on('paymentmethod', async (ev) => {
        const {error} = await stripe.confirmCardPayment(
            clientSecret,
            {payment_method: ev.paymentMethod.id},
            {handleActions: false}
        );

        if (error) {
            console.log(error)
            ev.complete('fail');
        } else {
            ev.complete('success');
        }
    });
}


let amount = 0;

const pr = constructPaymentRequest(amount);
const prBtn = constructPRButton(pr);
mountPRButton(pr, prBtn);

document.getElementById("donationAmount").addEventListener('input', () => {
    amount = convertAmountToPence(document.getElementById("donationAmount").value)
    pr.update({
        total: {
            label: 'donation',
            amount: amount,
        }
    })
    fetchPaymentIntentClientSecret(amount).then((clientSecret) => {
        confirmPayment(pr, clientSecret);
    }).catch((err) => {
        console.log(err);
    });
})