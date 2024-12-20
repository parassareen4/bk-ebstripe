const express = require('express');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Purchase Schema
const PurchaseSchema = new mongoose.Schema({
    email: String,
    transactionId: String,
    date: { type: Date, default: Date.now },
});

const Purchase = mongoose.model('Purchase', PurchaseSchema);

// Stripe Configuration
const stripe = new Stripe('sk_test_51QYEBKLT4FN0XCJaAa9slmgkYQyeEXq1MQBonHYj9Zt4bR3roRjfKoRj4nEcgGJevdt5RhfMlWPOq2sGfvoDMWTm00s1dPaHTV');

app.post('/api/checkout', async (req, res) => {
    const { email } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['paypal'],
            line_items: [
              {
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'My eBook' },
                        unit_amount: 1000, // $10
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
        });

        // Save purchase to DB
        const purchase = new Purchase({
            email,
            transactionId: session.id,
        });
        await purchase.save();

        res.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Error:", error); // Log full error details
        res.status(500).send("Error creating checkout session");
    }
});

// Send eBook via Email
app.post('/api/send-ebook', async (req, res) => {
    const { email } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: "sareenparas2@gmail.com", pass: "parassareen1" },
    });

    const mailOptions = {
        from: "sareenparas2@gmail.com",
        to: email,
        subject: 'Your eBook Purchase',
        text: 'Thank you for your purchase! Here is your eBook.',
        attachments: [{ filename: 'ebook.pdf', path: './ebooks/ebook.pdf' }],
    };

    try {
        await transporter.sendMail(mailOptions);
        res.send("eBook sent successfully");
    } catch (error) {
        res.status(500).send("Error sending eBook");
    }
});

app.listen(5000, () => console.log('Server running on port 5000'));