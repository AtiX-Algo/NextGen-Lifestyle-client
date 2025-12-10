import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get email passed from Signup page
  const emailFromSignup = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailFromSignup, otp }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess('Verified! Logging you in...');
        // Save token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Network error',err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold mb-4">Verify OTP</h2>
          <p className="text-center text-sm text-gray-500 mb-4">
            Enter the code sent to <strong>{emailFromSignup}</strong>
          </p>

          {error && <div className="alert alert-error text-sm py-2 mb-4">{error}</div>}
          {success && <div className="alert alert-success text-sm py-2 mb-4">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-control w-full">
              <input 
                type="text" 
                placeholder="Enter 6-digit code" 
                className="input input-bordered text-center text-2xl tracking-widest" 
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required 
              />
            </div>
            <div className="card-actions justify-center mt-6">
              <button type="submit" className="btn btn-primary w-full">Verify</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;