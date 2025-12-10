import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP+Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStep(2); // Move to next step
        setMessage('OTP sent! Check your console.');
      } else {
        setError(data.message);
      }
    } catch (err) { setError('Network Error',err); }
  };

  // Handle Step 2: Reset Password
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Success! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message);
      }
    } catch (err) { setError('Network Error',err); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold mb-4">
            {step === 1 ? 'Forgot Password' : 'Set New Password'}
          </h2>

          {error && <div className="alert alert-error text-sm py-2 mb-4">{error}</div>}
          {message && <div className="alert alert-success text-sm py-2 mb-4">{message}</div>}

          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div className="form-control">
                <label className="label"><span className="label-text">Email</span></label>
                <input type="email" className="input input-bordered" 
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary w-full mt-6">Send OTP</button>
            </form>
          ) : (
            <form onSubmit={handleReset}>
               <div className="form-control">
                <label className="label"><span className="label-text">Enter OTP</span></label>
                <input type="text" className="input input-bordered" 
                  value={otp} onChange={(e) => setOtp(e.target.value)} required />
              </div>
              <div className="form-control mt-2">
                <label className="label"><span className="label-text">New Password</span></label>
                <input type="password" className="input input-bordered" 
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary w-full mt-6">Update Password</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;