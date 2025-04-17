import express from 'express';
import Stripe from 'stripe';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.get('/connection-token', async (req, res) => {
    try {
        const connectionToken = await stripe.terminal.connectionTokens.create();
        return res.status(200).json({ secret: connectionToken.secret });
    } catch (error) {
        console.error('Error creating connection token:', error);
        return res.status(500).json({ error: 'Failed to create connection token' });
    }
});

router.post('/create-payment-intent', async (req, res) => {
    const { amount, currency = 'eur', description = 'POS Payment' } = req.body;

    // Validate amount (must be <= $1,000 for offline mode)
    if (!amount || amount > 100000) {
        return res.status(400).json({ error: 'Amount must be <= 1000 EUR for offline mode' });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            payment_method_types: ['card_present'],
            capture_method: 'manual', // Required for Terminal payments
            description,
            offline: {
                enabled: true // Enable offline mode (up to $1,000 per transaction)
            }
        });

        return res.status(200).json({
            client_secret: paymentIntent.client_secret,
            id: paymentIntent.id
        });
    } catch (error) {
        console.error('Error creating PaymentIntent:', error);
        return res.status(500).json({ error: 'Failed to create PaymentIntent' });
    }
});

export default router