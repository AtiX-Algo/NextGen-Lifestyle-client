import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Login Successful! Redirecting...');

                // Save token + user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));

                // Redirect after slight delay (so user can see success message)
                setTimeout(() => {
                    navigate('/dashboard');
                }, 800);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Is the server running?',err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-base-200">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title justify-center text-2xl font-bold mb-4">Login</h2>

                    {error && (
                        <div className="alert alert-error text-sm py-2 mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success text-sm py-2 mb-4">
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* Email */}
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="email@example.com"
                                className="input input-bordered w-full max-w-xs"
                                value={formData.email}
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
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="text-right mb-4">
                            <Link to="/forgot-password" class="text-xs text-blue-600 hover:underline">Forgot Password?</Link>
                        </div>

                        <div className="card-actions justify-center"></div>

                        <div className="card-actions justify-center mt-6">
                            <button type="submit" className="btn btn-primary w-full">
                                Login
                            </button>
                        </div>
                    </form>

                    {/* Link to Signup */}
                    <div className="text-center mt-4">
                        <p className="text-sm">
                            Don’t have an account?{' '}
                            <Link to="/signup" className="link link-primary">
                                Sign Up
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
