import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

router.get('/', (req, res) => {
    res.send('Hello World');
});

router.get('/connection-token', async (req, res) => {
    try {
        const connectionToken = await stripe.terminal.connectionTokens.create();
        return res.status(200).json({ secret: connectionToken.secret });
    } catch (error) {
        console.error('Error creating connection token:', error.message);
        return res.status(500).json({ error: 'Failed to create connection token' });
    }
});

router.post('/create-payment-intent', async (req, res) => {
    let { amount, currency = 'usd', description = 'POS Payment' } = req.body;
    amount = parseInt(amount);
    amount = amount * 100;
    if (!amount || amount > 1000000) {
        return res.status(400).json({
            error: 'Amount must be provided and <= 1,000 USD',
        });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(amount), // Amount should already be in cents
            currency,
            description,
            payment_method_types: ['card'],
            capture_method: 'manual', // Required for Terminal payments
            confirmation_method: 'manual', // Required for Terminal payments
        });

        return res.status(200).json({
            client_secret: paymentIntent.client_secret,
            id: paymentIntent.id,
        });
    } catch (error) {
        console.error('Error creating PaymentIntent:', error.message);
        return res.status(500).json({ error: 'Failed to create PaymentIntent' });
    }
});

router.post('/capture-payment-intent', async (req, res) => {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
        return res.status(400).json({ error: 'paymentIntentId is required' });
    }

    try {
        // First retrieve the paymentIntent to check its status
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Check if paymentIntent is ready for capture
        if (paymentIntent.status !== 'requires_capture') {
            return res.status(400).json({
                error: `Cannot capture PaymentIntent with status: ${paymentIntent.status}. Must be 'requires_capture'.`
            });
        }

        // Now capture
        const capturedPaymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

        return res.status(200).json(capturedPaymentIntent);
    } catch (error) {
        console.error('Error capturing PaymentIntent:', error.message);
        return res.status(500).json({ error: 'Failed to capture PaymentIntent' });
    }
});


router.patch('/update-payment-intent', async (req, res) => {
    let { paymentIntentId, amount } = req.body;
    amount = parseInt(amount);
    amount = amount * 100;
    try {
        const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
            amount: parseInt(amount),
        });
        return res.status(200).json(paymentIntent);
    } catch (error) {
        console.error('Error updating PaymentIntent:', error.message);
        return res.status(500).json({ error: 'Failed to update PaymentIntent' });
    }
});

export default router;
