import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role }),
            });
            const data = await response.json();
            if (response.ok) {
                navigate('/login');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="px-10 py-8 mt-4 text-left bg-white shadow-xl rounded-2xl w-[28rem]">
                <h3 className="text-3xl font-playfair font-bold text-maroon mb-6">Create Account</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mt-6">
                        <div>
                            <label className="block font-bold text-chocolate font-poppins" htmlFor="username">Username</label>
                            <input type="text" placeholder="Choose a username"
                                className="w-full px-4 py-3 mt-2 border border-gray-200 rounded-full focus:outline-none focus:border-saffron-start focus:ring-1 focus:ring-saffron-start transition-all bg-gray-50"
                                value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className="mt-4">
                            <label className="block font-bold text-chocolate font-poppins" htmlFor="password">Password</label>
                            <input type="password" placeholder="Create a password"
                                className="w-full px-4 py-3 mt-2 border border-gray-200 rounded-full focus:outline-none focus:border-saffron-start focus:ring-1 focus:ring-saffron-start transition-all bg-gray-50"
                                value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="mt-4">
                            <label className="block font-bold text-chocolate font-poppins" htmlFor="role">Role</label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3 mt-2 border border-gray-200 rounded-full focus:outline-none focus:border-saffron-start focus:ring-1 focus:ring-saffron-start transition-all bg-gray-50 appearance-none"
                                    value={role} onChange={(e) => setRole(e.target.value)}>
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 pt-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
                        <div className="flex flex-col items-center justify-between mt-8">
                            <button className="w-full px-6 py-3 text-chocolate font-bold bg-gradient-to-r from-saffron-start to-saffron-end rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 border border-white/20">Register</button>
                            <div className="mt-4 text-sm text-gray-600">
                                Already have an account? <Link to="/login" className="text-maroon font-bold hover:underline">Sign in</Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
