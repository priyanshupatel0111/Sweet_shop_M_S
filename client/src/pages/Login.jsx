import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.ok) {
                login(data.token, data.role);
                navigate(data.role === 'admin' ? '/admin' : '/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.message || 'Network error: ensure backend is running');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="px-10 py-8 mt-4 text-left bg-white shadow-xl rounded-2xl w-full max-w-md mx-4">
                <h3 className="text-3xl font-playfair font-bold text-center text-maroon mb-6">Welcome Back</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <div>
                            <label className="block font-bold text-chocolate font-poppins" htmlFor="username">Username</label>
                            <input type="text" placeholder="Enter your username"
                                className="w-full px-4 py-3 mt-2 border border-gray-200 rounded-full focus:outline-none focus:border-saffron-start focus:ring-1 focus:ring-saffron-start transition-all bg-gray-50"
                                value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
                        </div>
                        <div className="mt-6">
                            <label className="block font-bold text-chocolate font-poppins" htmlFor="password">Password</label>
                            <input type="password" placeholder="Enter your password"
                                className="w-full px-4 py-3 mt-2 border border-gray-200 rounded-full focus:outline-none focus:border-saffron-start focus:ring-1 focus:ring-saffron-start transition-all bg-gray-50"
                                value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                        </div>
                        {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
                        <div className="flex flex-col items-center justify-between mt-8">
                            <button disabled={loading} className={`w-full px-6 py-3 font-bold rounded-full shadow-lg transition-all duration-300 transform active:scale-95 border border-white/20 ${loading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'text-chocolate bg-gradient-to-r from-saffron-start to-saffron-end hover:shadow-xl'}`}>
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>
                            <div className="mt-4 text-sm text-gray-600">
                                Don't have an account? <Link to="/register" className="text-maroon font-bold hover:underline">Register here</Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
