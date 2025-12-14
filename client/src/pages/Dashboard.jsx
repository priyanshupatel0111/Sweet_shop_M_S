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
            <nav className="bg-white shadow-xl relative z-10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex space-x-7">
                            <div>
                                <a href="#" className="flex items-center py-4 px-2">
                                    <span className="font-playfair font-bold text-gray-800 text-2xl tracking-wide">Sweet Shop</span>
                                </a>
                            </div>
                        </div>
                        <div className="flex-1 max-w-xl mx-8">
                            <input
                                type="text"
                                placeholder="Search delicious sweets..."
                                className="w-full py-2 px-6 border-2 border-gray-100 rounded-full focus:outline-none focus:border-saffron-start transition-colors bg-gray-50/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate('/cart')} className="py-2 px-6 font-bold text-chocolate bg-gradient-to-r from-saffron-start to-saffron-end rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border border-white/20">Cart</button>
                            <span className="text-chocolate font-medium font-playfair tracking-wide">Welcome, {user?.role}</span>
                            <button onClick={() => { logout(); navigate('/login'); }} className="py-2 px-6 font-bold text-white bg-[#880E4F] rounded-full hover:bg-red-800 transition duration-300 shadow-md">Log Out</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-end mb-8">
                    <select
                        className="py-2 px-4 border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:border-saffron-start"
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
                        <div key={sweet._id} className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-orange-100">
                            {sweet.imageUrl && <img src={sweet.imageUrl} alt={sweet.name} className="w-full h-56 object-cover" />}
                            <div className="p-6">
                                <h3 className="text-2xl font-playfair font-bold mb-3 text-maroon">{sweet.name}</h3>
                                <p className="text-chocolate/80 mb-4 font-poppins text-sm leading-relaxed font-medium">
                                    {sweet.description === "A very Taste Indian sweet" ? "A very Tasty Indian sweet" :
                                        sweet.description === "abc.." || sweet.description === "xyz.." ? "Delicious traditional sweet made with pure ghee and premium ingredients." : sweet.description}
                                </p>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-2xl font-bold text-premium-green">Rs {sweet.price}</span>
                                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${sweet.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
                                    className={`w-full py-3 px-4 rounded-full font-bold shadow-md transition-all duration-300 transform active:scale-95 ${sweet.quantity > 0
                                        ? (cartItems.has(sweet._id) ? 'bg-premium-green hover:bg-green-800 text-white' : 'bg-gradient-to-r from-saffron-start to-saffron-end hover:shadow-lg text-chocolate border border-white/20')
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
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
