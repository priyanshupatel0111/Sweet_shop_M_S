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
            <nav className="bg-white shadow-lg mb-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between">
                        <div className="flex space-x-7">
                            <div>
                                <a href="#" onClick={() => navigate('/dashboard')} className="flex items-center py-4 px-2">
                                    <span className="font-semibold text-gray-500 text-lg">Sweet Shop</span>
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button onClick={() => navigate('/dashboard')} className="py-2 px-2 font-medium text-gray-500 hover:text-gray-900 transition duration-300">Dashboard</button>
                            <span className="text-gray-700">Welcome, {user?.role}</span>
                            <button onClick={() => { logout(); navigate('/login'); }} className="py-2 px-2 font-medium text-white bg-red-500 rounded hover:bg-red-400 transition duration-300">Log Out</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
                {cart.length === 0 ? (
                    <p className="text-gray-600">Your cart is empty.</p>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {cart.map((item) => {
                            if (!item.sweet) return null;
                            return (
                                <div key={item._id || Math.random()} className="flex justify-between items-center border-b py-4 last:border-b-0">
                                    <div className="flex items-center">
                                        {item.sweet.imageUrl && <img src={item.sweet.imageUrl} alt={item.sweet.name} className="w-16 h-16 object-cover rounded mr-4" />}
                                        <div>
                                            <h3 className="text-lg font-semibold">{item.sweet.name}</h3>
                                            <p className="text-gray-600">${item.sweet.price} x {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.sweet._id, item.quantity - 1)}
                                            className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                                        >-</button>
                                        <span className="mx-2">{item.quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.sweet._id, item.quantity + 1)}
                                            className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                                        >+</button>
                                        <button
                                            onClick={() => handleRemove(item.sweet._id)}
                                            className="text-red-600 hover:text-red-800 ml-4"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="mt-6 flex justify-between items-center border-t pt-4">
                            <span className="text-xl font-bold">Total: ${total}</span>
                            <button
                                onClick={handlePurchase}
                                className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 transition duration-300"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
