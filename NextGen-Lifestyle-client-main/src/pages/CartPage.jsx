// src/pages/CartPage.jsx
import { useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { RecommendationSlider } from "../components/recommendations/RecommendationSlider";

export default function CartPage() {
  const {
    cartItems,
    subtotal = 0,
    cartCount = 0,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    line1: "",
    city: "",
    country: "Bangladesh",
    paymentMethod: "COD"
  });
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!cartItems?.length) {
      toast.error("Your cart is empty");
      return;
    }

    const { customerName, email, line1, city, country, phone, paymentMethod } = formData;
    
    if (!customerName || !email || !line1 || !city || !country) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsPlacing(true);
      
      const orderPayload = {
        customerName,
        email,
        phone,
        channel: "web",
        paymentMethod,
        status: "pending",
        paymentStatus: paymentMethod === "COD" ? "pending" : "unpaid",
        shippingAddress: { 
          fullName: customerName, 
          phone, 
          line1, 
          city, 
          country 
        },
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal,
        shipping: 0, // Add shipping calculation if needed
        tax: 0, // Add tax calculation if needed
        total: subtotal,
      };

      const order = await createOrder(orderPayload);
      const orderNumber = order.orderNumber || order._id;
      
      // Show success message
      toast.success(`Order #${orderNumber} placed successfully!`);
      setOrderSuccess(true);
      
      // Clear form
      setFormData({
        customerName: "",
        email: "",
        phone: "",
        line1: "",
        city: "",
        country: "Bangladesh",
        paymentMethod: "COD"
      });
      
      // Clear cart and redirect after a short delay
      setTimeout(() => {
        clearCart();
        navigate(`/orders/${order._id}`, { state: { order } }); // Redirect to order confirmation
      }, 1500);

    } catch (error) {
      console.error("Order error:", error);
      const errorMessage = error.response?.data?.message || "Failed to place order. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsPlacing(false);
    }
  };

  if ((!cartCount || !cartItems?.length) && !orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We've sent a confirmation email to {formData.email}.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
            <Link to="/orders" className="btn btn-primary">View Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.key} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={item.image || 'https://via.placeholder.com/100'}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/100';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.size && <span>Size: {item.size} • </span>}
                      {item.color && <span>Color: {item.color} • </span>}
                      ${item.price?.toFixed(2) || '0.00'}
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="join">
                        <button
                          className="join-item btn btn-xs"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-3">{item.quantity}</span>
                        <button
                          className="join-item btn btn-xs"
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700 text-sm"
                        onClick={() => removeFromCart(item.key)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${((item.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Order Summary</h2>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="divider my-1"></div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Customer Information</h2>
              <div className="space-y-3 mt-4">
                <input
                  type="text"
                  name="customerName"
                  className="input input-bordered w-full"
                  placeholder="Full Name *"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  className="input input-bordered w-full"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  className="input input-bordered w-full"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="line1"
                  className="input input-bordered w-full"
                  placeholder="Address *"
                  value={formData.line1}
                  onChange={handleInputChange}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="city"
                    className="input input-bordered"
                    placeholder="City *"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="country"
                    className="input input-bordered"
                    placeholder="Country *"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <select
                  name="paymentMethod"
                  className="select select-bordered w-full mt-2"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="COD">Cash on Delivery</option>
                  <option value="Card">Credit/Debit Card</option>
                </select>
              </div>
              <div className="card-actions mt-6">
                <button
                  className="btn btn-primary w-full"
                  onClick={handlePlaceOrder}
                  disabled={isPlacing}
                >
                  {isPlacing ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    `Place Order ($${subtotal.toFixed(2)})`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Bought Together Section - Only show if cart has items */}
      {cartItems?.length > 0 && (
        <div className="mt-16">
          <RecommendationSlider 
            title="Frequently Bought Together" 
            type="frequentlyBoughtTogether"
            productIds={cartItems.map(item => item.productId)}
          />
        </div>
      )}
    </div>
  );
}