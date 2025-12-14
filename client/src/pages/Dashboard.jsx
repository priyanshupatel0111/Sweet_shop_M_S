import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [sweets, setSweets] = useState([]);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchSweets();
        fetchCategories();
    }, [searchTerm, category]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSweets = async () => {
        let query = `?name=${searchTerm}`;
        if (category) query += `&category=${category}`;

        try {
            const response = await fetch(`http://localhost:5000/api/sweets/search${query}`);
            const data = await response.json();
            setSweets(data);
        } catch (error) {
            console.error('Error fetching sweets:', error);
        }
    };

    const [cartItems, setCartItems] = useState(new Set());

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/sweets/cart', {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const ids = new Set(data.map(item => item.sweet._id));
                setCartItems(ids);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const handleAddToCart = async (id) => {
        try {
            const response = await fetch('http://localhost:5000/api/sweets/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ sweetId: id, quantity: 1 })
            });
            if (response.ok) {
                setCartItems(prev => new Set(prev).add(id));
                alert('Added to cart!');
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-lg">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between">
                        <div className="flex space-x-7">
                            <div>
                                <a href="#" className="flex items-center py-4 px-2">
                                    <span className="font-semibold text-gray-500 text-lg">Sweet Shop</span>
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button onClick={() => navigate('/cart')} className="py-2 px-2 font-medium text-gray-500 hover:text-gray-900 transition duration-300">Cart</button>
                            <span className="text-gray-700">Welcome, {user?.role}</span>
                            <button onClick={() => { logout(); navigate('/login'); }} className="py-2 px-2 font-medium text-white bg-red-500 rounded hover:bg-red-400 transition duration-300">Log Out</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <div className="flex mb-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search sweets..."
                        className="p-2 border rounded w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="p-2 border rounded"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sweets.map((sweet) => (
                        <div key={sweet._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {sweet.imageUrl && <img src={sweet.imageUrl} alt={sweet.name} className="w-full h-48 object-cover" />}
                            <div className="p-4">
                                <h3 className="text-xl font-semibold mb-2">{sweet.name}</h3>
                                <p className="text-gray-600 mb-2">{sweet.description}</p>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-bold text-green-600">${sweet.price}</span>
                                    <span className={`text-sm ${sweet.quantity > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {sweet.quantity > 0 ? `${sweet.quantity} in stock` : 'Out of stock'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        if (cartItems.has(sweet._id)) {
                                            navigate('/cart');
                                        } else {
                                            handleAddToCart(sweet._id);
                                        }
                                    }}
                                    disabled={sweet.quantity === 0}
                                    className={`w-full py-2 px-4 rounded ${sweet.quantity > 0
                                        ? (cartItems.has(sweet._id) ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700')
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        } text-white`}
                                >
                                    {sweet.quantity > 0
                                        ? (cartItems.has(sweet._id) ? 'Go to Cart' : 'Add to Cart')
                                        : 'Out of Stock'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
