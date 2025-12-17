import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';

// Import your components
import Signup from './components/Signup';
import Login from './components/Login';
import VerifyOtp from './components/VerifyOtp';
import AdminCoupons from './components/AdminCoupons';
import Checkout from './components/Checkout';
import PaymentForm from './components/PaymentForm';


import AdminRoute from './Route/AdminRoute';

export const PaymentRoute = () => {
  const location = useLocation();
  const amount = location.state?.amount;

  // Optional: block direct access
  if (!amount) return <Navigate to="/checkout" replace />;

  return <PaymentForm amount={amount} />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Default route redirects to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        
        <Route path="/admin/coupons" element={ <AdminRoute>   <AdminCoupons />  </AdminRoute> } />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<PaymentRoute />} />

        {/* Placeholder for future Dashboard */}

        <Route path="/dashboard" element={
          <div className="p-10 text-2xl font-bold text-center">
            Welcome to Dashboard! (Protected)
          </div>
        } />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);