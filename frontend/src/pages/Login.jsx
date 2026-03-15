import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [view, setView] = useState('login'); // 'login', 'forgot', 'reset'
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const res = await axios.post('http://localhost:8000/api/auth/forgot-password', { email });
            setMessage(res.data.message);
            setView('reset');
        } catch (err) {
            setError(err.response?.data?.message || 'Error verifying email');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            const res = await axios.post('http://localhost:8000/api/auth/reset-password', { email, code, newPassword });
            setMessage(res.data.message + ' Redirecting to login...');
            setTimeout(() => {
                setView('login');
                setMessage('');
                setPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setCode('');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error resetting password');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
            <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-10">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                        {view === 'login' ? 'Sign In' : view === 'forgot' ? 'Forgot Password' : 'Reset Password'}
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base font-medium">DevOps Conference Session Planner</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-6 text-sm font-medium">
                        {error}
                    </div>
                )}
                
                {message && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-md mb-6 text-sm font-medium">
                        {message}
                    </div>
                )}

                {view === 'login' && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-700">Password</label>
                                <button 
                                    type="button" 
                                    onClick={() => setView('forgot')}
                                    className="text-xs text-blue-600 font-bold hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <input
                                type="password"
                                className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-colors shadow-sm text-base uppercase tracking-wider"
                        >
                            Sign In
                        </button>
                    </form>
                )}

                {view === 'forgot' && (
                    <form onSubmit={handleForgotPassword} className="space-y-5">
                        <p className="text-sm text-slate-500 mb-4">Enter your email address and we'll check if you have an account.</p>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm uppercase tracking-wider"
                            >
                                Verify Email
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('login')}
                                className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-md hover:bg-slate-200 transition-colors shadow-sm text-sm uppercase tracking-wider"
                            >
                                Back
                            </button>
                        </div>
                    </form>
                )}

                {view === 'reset' && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Reset Code</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
                                placeholder="Enter code (use 1234)"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
                            <input
                                type="password"
                                className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm uppercase tracking-wider"
                            >
                                Reset Password
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('login')}
                                className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-md hover:bg-slate-200 transition-colors shadow-sm text-sm uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-slate-600 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:underline font-bold">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
