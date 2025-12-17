import { useState, useEffect } from 'react';

const Checkout = () => {
  // Hardcoded Cart Data (Simulating Atef's work)
  const cartOriginalTotal = 500; 
  
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(cartOriginalTotal);
  const [message, setMessage] = useState('');

  // Fetch available coupons on load
  useEffect(() => {
    fetch('http://localhost:5000/api/coupons')
      .then(res => res.json())
      .then(data => setCoupons(data))
      .catch(err => console.error(err));
  }, []);

  // Handle Clicking a Coupon from the list
  const applyCoupon = async (code) => {
    try {
      const res = await fetch('http://localhost:5000/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal: cartOriginalTotal }),
      });
      const data = await res.json();

      if (res.ok) {
        setSelectedCoupon(code);
        setDiscount(data.discountAmount);
        setFinalTotal(data.newTotal);
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.message });
        // Reset if invalid
        setSelectedCoupon(null);
        setDiscount(0);
        setFinalTotal(cartOriginalTotal);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-10 flex justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* LEFT SIDE: Order Details (Simulated) */}
        <div className="card bg-base-100 shadow-xl h-fit">
          <div className="card-body">
            <h2 className="card-title mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Premium Headphones</span>
              <span>$200</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Mechanical Keyboard</span>
              <span>$300</span>
            </div>
            <div className="divider"></div>
            
            <div className="flex justify-between text-lg">
              <span>Subtotal:</span>
              <span>${cartOriginalTotal}</span>
            </div>

            {/* Discount Display */}
            {discount > 0 && (
              <div className="flex justify-between text-success font-bold">
                <span>Discount ({selectedCoupon}):</span>
                <span>-${discount}</span>
              </div>
            )}

            <div className="divider"></div>
            <div className="flex justify-between text-2xl font-bold">
              <span>Total:</span>
              <span>${finalTotal}</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Coupon Selector */}
        <div className="card bg-base-100 shadow-xl h-fit">
          <div className="card-body">
            <h2 className="card-title text-primary">Apply Coupon</h2>
            <p className="text-sm text-gray-500 mb-4">Select a valid coupon below:</p>

            {/* Scrollable Coupon List */}
            <div className="h-64 overflow-y-auto space-y-3 p-2 bg-base-200 rounded-box border border-base-300">
              {coupons.length === 0 ? (
                <p className="text-center p-4 opacity-50">No active coupons available.</p>
              ) : (
                coupons.map((coupon) => (
                  <div 
                    key={coupon._id} 
                    onClick={() => applyCoupon(coupon.code)}
                    className={`p-4 rounded-lg cursor-pointer border-2 transition-all hover:bg-base-100 
                      ${selectedCoupon === coupon.code ? 'border-primary bg-primary/10' : 'border-transparent bg-white'}
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-primary">{coupon.code}</span>
                      <span className="badge badge-accent">-{coupon.discountPercentage}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
                    <p className="text-xs mt-1">Min Spend: ${coupon.minPurchaseAmount}</p>
                  </div>
                ))
              )}
            </div>

            {/* Message Area */}
            {message && (
              <div className={`alert mt-4 ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                <span>{message.text}</span>
              </div>
            )}

            <button className="btn btn-primary w-full mt-6">Proceed to Payment</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;