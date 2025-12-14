import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const [cart, setCart] = useState([]);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchCart();
    }, []);

    useEffect(() => {
        calculateTotal();
    }, [cart]);

    const fetchCart = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/sweets/cart', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();
            if (response.ok && Array.isArray(data)) {
                setCart(data);
            } else {
                console.error('Failed to fetch cart:', data);
                setCart([]);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const calculateTotal = () => {
        if (!Array.isArray(cart)) return;
        const sum = cart.reduce((acc, item) => {
            if (item.sweet) {
                return acc + (item.sweet.price * item.quantity);
            }
            return acc;
        }, 0);
        setTotal(sum);
    };

    const handleUpdateQuantity = async (sweetId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            const response = await fetch(`http://localhost:5000/api/sweets/cart/${sweetId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });
            if (response.ok) {
                fetchCart();
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const handleRemove = async (sweetId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/sweets/cart/${sweetId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            if (response.ok) {
                fetchCart();
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const handlePurchase = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/sweets/cart/purchase', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                alert('Purchase successful!');
                setCart([]);
                navigate('/dashboard');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error purchasing cart:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-xl relative z-10 mb-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex space-x-7">
                            <div>
                                <a href="#" onClick={() => navigate('/dashboard')} className="flex items-center py-4 px-2">
                                    <span className="font-playfair font-bold text-gray-800 text-2xl tracking-wide">Sweet Shop</span>
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate('/dashboard')} className="py-2 px-6 font-bold text-chocolate bg-gradient-to-r from-saffron-start to-saffron-end rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border border-white/20">Dashboard</button>
                            <span className="text-chocolate font-medium font-playfair tracking-wide">Welcome, {user?.role}</span>
                            <button onClick={() => { logout(); navigate('/login'); }} className="py-2 px-6 font-bold text-white bg-[#880E4F] rounded-full hover:bg-red-800 transition duration-300 shadow-md">Log Out</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-3xl font-playfair font-bold mb-8 text-maroon text-center">Your Cart</h2>
                {cart.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-orange-100">
                        <p className="text-xl text-chocolate/80 font-poppins">Your cart is currently empty.</p>
                        <button onClick={() => navigate('/dashboard')} className="mt-6 py-2 px-6 font-bold text-white bg-premium-green rounded-full hover:bg-green-800 transition shadow-md">Start Shopping</button>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-white/50">
                        {cart.map((item) => {
                            if (!item.sweet) return null;
                            return (
                                <div key={item._id || Math.random()} className="flex justify-between items-center border-b border-gray-100 py-6 last:border-b-0 group hover:bg-gray-50/50 transition duration-300 rounded-lg px-2">
                                    <div className="flex items-center">
                                        {item.sweet.imageUrl && <img src={item.sweet.imageUrl} alt={item.sweet.name} className="w-20 h-20 object-cover rounded-xl shadow-md mr-6" />}
                                        <div>
                                            <h3 className="text-xl font-playfair font-bold text-maroon mb-1">{item.sweet.name}</h3>
                                            <p className="text-chocolate font-medium">Rs {item.sweet.price} x {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.sweet._id, item.quantity - 1)}
                                            className="w-8 h-8 rounded-full bg-gray-100 text-chocolate font-bold hover:bg-saffron-start hover:text-white transition flex items-center justify-center shadow-sm"
                                        >-</button>
                                        <span className="mx-2 font-bold text-lg text-chocolate w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.sweet._id, item.quantity + 1)}
                                            className="w-8 h-8 rounded-full bg-gray-100 text-chocolate font-bold hover:bg-saffron-start hover:text-white transition flex items-center justify-center shadow-sm"
                                        >+</button>
                                        <button
                                            onClick={() => handleRemove(item.sweet._id)}
                                            className="text-red-500 hover:text-red-700 ml-6 font-medium text-sm border border-red-200 px-3 py-1 rounded-full hover:bg-red-50 transition"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="mt-8 flex justify-between items-center border-t border-gray-100 pt-6">
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500 font-poppins">Total Amount</span>
                                <span className="text-3xl font-playfair font-bold text-premium-green">Rs {total}</span>
                            </div>
                            <button
                                onClick={handlePurchase}
                                className="bg-gradient-to-r from-saffron-start to-saffron-end text-chocolate font-bold py-3 px-10 rounded-full shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 border border-white/20 text-lg"
                            >
                                Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
