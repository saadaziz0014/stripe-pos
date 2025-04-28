import React, { useEffect, useState } from 'react';

const POSInterface = () => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [terminal, setTerminal] = useState(null);
    const [reader, setReader] = useState(null);

    // Initialize Stripe Terminal
    useEffect(() => {
        const terminalInstance = window.StripeTerminal.create({
            onFetchConnectionToken: async () => {
                const res = await fetch('http://localhost:3000/api/connection-token'); // Replace with real URL
                const data = await res.json();
                return data.secret;
            },
            onUnexpectedReaderDisconnect: () => {
                alert('Reader disconnected');
            },
        });

        setTerminal(terminalInstance);
    }, []);

    const connectReader = async () => {
        if (!terminal) return alert('Terminal not initialized');

        const result = await terminal.discoverReaders({
  device_type: 'bbpos_wisepos_e',
  method: 'internet',
});


        if (result.error) {
            console.error('Failed to discover readers:', result.error);
            alert(result.error.message);
        } else if (result.discoveredReaders.length === 0) {
            alert('No readers found. Make sure the device is on the same Wi-Fi as this browser.');
        } else {
            const connectResult = await terminal.connectReader(result.discoveredReaders[0]);
            if (connectResult.error) {
                console.error('Failed to connect to reader:', connectResult.error);
                alert(connectResult.error.message);
            } else {
                setReader(connectResult.reader);
                alert(`✅ Connected to reader: ${connectResult.reader.label}`);
            }
        }
    };

    const handleCharge = async () => {
        if (!terminal || !reader) return alert('Connect to a reader first');
        if (!amount) return alert('Enter an amount');

        setLoading(true);

        try {
            const res = await fetch('http://localhost:3000/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseInt(amount) }), // amount in cents
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);

            const result = await terminal.collectPaymentMethod(data.client_secret);
            if (result.error) {
                console.error('Collect payment error:', result.error);
                alert(result.error.message);
                return;
            }

            const confirmResult = await terminal.processPayment(result.paymentIntent);
            if (confirmResult.error) {
                console.error('Process payment error:', confirmResult.error);
                alert(confirmResult.error.message);
                return;
            }

            alert('✅ Payment successful!');
        } catch (err) {
            console.error(err);
            alert(err.message);
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 h-screen p-4">
            <h1 className="text-2xl font-bold">SelluxSky POS (Live)</h1>

            {!reader && (
                <button
                    onClick={connectReader}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                    Connect to Reader
                </button>
            )}

            {reader && (
                <>
                    <input
                        type="number"
                        placeholder="Amount in cents (e.g. 500 = $5.00)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="border px-4 py-2 rounded w-60 text-lg"
                    />

                    <button
                        onClick={handleCharge}
                        disabled={loading}
                        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                    >
                        {loading ? 'Processing...' : 'Charge'}
                    </button>
                </>
            )}
        </div>
    );
};

export default POSInterface;

