import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// ⚠️ REPLACE WITH YOUR ACTUAL PUBLISHABLE KEY
const stripePromise = loadStripe('pk_test_51SD8fNGknryBHSAVAeOmfgy1Tjx3TzHmiJwbQhSveZLdZaZDbNwUKuR2HOSCdkkvRzXaxB7T4IihzvO6dxupSKEB00Wt9SrjAt');

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
    });

    if (error) setMessage(error.message);
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
    
      <div className="mb-6">
        <PaymentElement 
          options={{ 
            layout: "tabs",
            wallets: { applePay: 'never', googlePay: 'never' } 
          }} 
        />
      </div>
      
      {/* Button */}
      <button 
        disabled={isProcessing || !stripe || !elements} 
        className="w-full bg-[#635BFF] hover:bg-[#534acb] text-white font-semibold py-3 rounded-md transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : `Pay $${amount}`}
      </button>
      
      {message && <div className="text-red-400 text-sm mt-4 text-center">{message}</div>}
    </form>
  );
};

const PaymentForm = ({ amount }) => {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Ensure amount
    const finalAmount = amount && amount > 0 ? amount : 100;

    fetch('http://localhost:5000/api/payment/create-intent', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount: finalAmount }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => console.error("Error fetching payment intent:", err));
  }, [amount]);



  const options = {
    clientSecret,
    
  };

  return (
    // DARK BACKGROUND CONTAINER (Matches your image)
    <div className="min-h-screen w-full bg-[#0F1114] flex flex-col items-center pt-20 px-4">
      
      {/* Header Text */}
      <h1 className="text-2xl font-bold text-white mb-8">Complete Your Payment</h1>

      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm amount={amount} />
        </Elements>
      ) : (
        // Loading Spinner
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg text-[#635BFF]"></span>
        </div>
      )}
      
    </div>
  );
};

export default PaymentForm;