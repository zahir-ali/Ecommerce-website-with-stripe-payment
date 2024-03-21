import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import stripe from 'stripe';

// load variables
dotenv.config();

const app = express();

app.use(express.static('public'));
app.use(express.json());

// Home Route
app.get('/', (req, res) => {
    res.sendFile(path.join("index.html", { root: "public" }));
});
// success
app.get('/success', (req, res) => {
    res.sendFile(path.join("success.html", { root: "public" }));
});
// cancel
app.get('/cancel', (req, res) => {
    res.sendFile(path.join("cancel.html", { root: "public" }));
});
// stripe
let stripeGateway = stripe(process.env.stripe_api);
let DOMAIN = process.env.DOMAIN;

app.post('/stripe-checkout',async(req,res)=>{
    const lineItems = req.body.item.map((item)=>{
        const unitItem = parseInt(item.price.replace(/[^0-9.-]+/g,'')*100);
        console.log("item-price:", item.price);
        console.log("unitAmount:", unitAmount);
        return{
            price_data:{
                currency: 'usd',
                product_data:{
                    name:item.title,
                    images:[item.productImg]
                },
                unit_amount: unitAmount,
            },
            quantity:item.quantity,
        };
    });
    console.log("lineItems:",lineItems);
    // create checkout session
    const session = await stripeGateway.checkout.session.create({
        payment_method_types:['card'],
        mode:'payment',
        sucess_url:`${DOMAIN}/success`,
        cancel_url: `${DOMAIN}/cancel`,
        line_items: lineItems,
        // Asking address in stripe checkout page
        billing_address_collection:'required'
    });
    res.json(session.url);
});

app.listen(5040, (error) => {
    if (error) {
        console.error('Error starting the server:', error);
    } else {
        console.log('Listening on port 5040');
    }
});
 