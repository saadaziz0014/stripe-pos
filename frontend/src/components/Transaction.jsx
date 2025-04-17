import React, { useState } from 'react';

const POSInterface = () => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCharge = async () => {
        if (!amount) return alert('Enter an amount');

        setLoading(true);
        try {
            // 1. Get connection token (optional on every charge)
            await fetch(`http://localhost:3000/api/connection-token`);

            // 2. Create payment intent
            const res = await fetch(`http://localhost:3000/api/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(amount) * 100 }), // amount in cents
            });
            const data = await res.json();

            // 3. Here you would use the Terminal SDK on real device
            console.log('Payment Intent:', data);

            alert('Payment Intent Created!');
        } catch (err) {
            console.error(err);
            alert('Something went wrong!');
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border px-4 py-2 rounded text-lg"
            />
            <button
                onClick={handleCharge}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
                {loading ? 'Processing...' : 'Charge'}
            </button>
        </div>
    );
};

export default POSInterface;
