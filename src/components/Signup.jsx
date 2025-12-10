import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Handle typing
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('OTP Sent! Redirecting...');

                setTimeout(() => {
                    navigate('/verify-otp', { state: { email: formData.email } });
                }, 1500);
            }


            else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Network error. Please check your backend server.',err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-base-200">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">

                    <h2 className="card-title justify-center text-2xl font-bold mb-4">
                        Sign Up
                    </h2>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error text-sm py-2 mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="alert alert-success text-sm py-2 mb-4">
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Name */}
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text">Name</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                className="input input-bordered w-full max-w-xs"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="form-control w-full max-w-xs mt-2">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="email@example.com"
                                className="input input-bordered w-full max-w-xs"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="form-control w-full max-w-xs mt-2">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="******"
                                className="input input-bordered w-full max-w-xs"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="card-actions justify-center mt-6">
                            <button type="submit" className="btn btn-primary w-full">
                                Create Account
                            </button>
                        </div>
                    </form>

                    {/* Login Link */}
                    <div className="text-center mt-4">
                        <p className="text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="link link-primary">
                                Login
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Signup;
