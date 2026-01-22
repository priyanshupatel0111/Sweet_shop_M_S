import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../api';
const AdminPanel = () => {
    const [sweets, setSweets] = useState([]);
    const [categories, setCategories] = useState([]);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', category: '', price: '', quantity: '', description: '', imageUrl: ''
    });
    const [categoryName, setCategoryName] = useState('');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchSweets();
        fetchCategories();
    }, []);

    const fetchSweets = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/sweets`);
            const data = await response.json();
            setSweets(data);
        } catch (error) {
            console.error('Error fetching sweets:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/categories`);
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId
            ? `${API_BASE}/api/sweets/${editingId}`
            : `${API_BASE}/api/sweets`;
        const method = editingId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchSweets();
                setFormData({ name: '', category: '', price: '', quantity: '', description: '', imageUrl: '' });
                setEditingId(null);
            }
        } catch (error) {
            console.error('Error saving sweet:', error);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        console.log('handleAddCategory called with:', categoryName);
        if (!categoryName.trim()) {
            console.log('Category name is empty');
            return;
        }

        try {
            console.log('Sending request to server...');
            const response = await fetch(`${API_BASE}/api/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ name: categoryName })
            });

            console.log('Response status:', response.status);

            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                data = { message: await response.text() };
            }

            if (response.ok) {
                fetchCategories();
                setCategoryName('');
                alert('Category added successfully');
            } else {
                console.log('Error data:', data);
                alert(data.message || 'Failed to add category');
            }
        } catch (error) {
            console.error('Error adding category:', error);
            alert('An error occurred. Please check console.');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            const response = await fetch(`${API_BASE}/api/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });

            if (response.ok) {
                fetchCategories();
            } else {
                alert('Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await fetch(`${API_BASE}/api/sweets/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            fetchSweets();
        } catch (error) {
            console.error('Error deleting sweet:', error);
        }
    };

    const handleEdit = (sweet) => {
        setFormData(sweet);
        setEditingId(sweet._id);
    };

    const handleRestock = async (id) => {
        const quantityStr = prompt('Enter quantity to add:');
        if (!quantityStr) return;

        const quantity = Number(quantityStr);
        if (isNaN(quantity) || quantity <= 0) {
            alert('Please enter a valid positive number.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/sweets/${id}/restock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ quantity })
            });

            if (response.ok) {
                fetchSweets();
                alert('Restock successful!');
            } else {
                const data = await response.json();
                alert(data.message || 'Restock failed');
            }
        } catch (error) {
            console.error('Error restocking:', error);
            alert('Error restocking sweet');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-lg mb-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between py-4">
                        <span className="font-bold text-xl">Admin Panel</span>
                        <button onClick={() => { logout(); navigate('/login'); }} className="text-red-500">Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Sweets Management */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Sweet' : 'Add New Sweet'}</h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Name" className="border p-2 rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                <select
                                    className="border p-2 rounded"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                                <input type="number" placeholder="Price" className="border p-2 rounded" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                <input type="number" placeholder="Quantity" className="border p-2 rounded" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
                                <input type="text" placeholder="Image URL" className="border p-2 rounded" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                                <textarea placeholder="Description" className="border p-2 rounded md:col-span-2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 md:col-span-2">
                                    {editingId ? 'Update Sweet' : 'Add Sweet'}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', category: '', price: '', quantity: '', description: '', imageUrl: '' }); }} className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 md:col-span-2">
                                        Cancel Edit
                                    </button>
                                )}
                            </form>
                        </div>

                        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                            <h2 className="text-xl font-bold p-6 border-b">All Sweets</h2>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-4 border-b">Name</th>
                                        <th className="p-4 border-b">Category</th>
                                        <th className="p-4 border-b">Price</th>
                                        <th className="p-4 border-b">Quantity</th>
                                        <th className="p-4 border-b">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sweets.map(sweet => (
                                        <tr key={sweet._id} className="hover:bg-gray-50">
                                            <td className="p-4 border-b">{sweet.name}</td>
                                            <td className="p-4 border-b">{sweet.category}</td>
                                            <td className="p-4 border-b">Rs {sweet.price}</td>
                                            <td className="p-4 border-b">{sweet.quantity}</td>
                                            <td className="p-4 border-b space-x-2">
                                                <button onClick={() => handleEdit(sweet)} className="text-blue-600 hover:underline">Edit</button>
                                                <button onClick={() => handleDelete(sweet._id)} className="text-red-600 hover:underline">Delete</button>
                                                <button onClick={() => handleRestock(sweet._id)} className="text-green-600 hover:underline">Restock</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Column: Category Management */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Category Management</h2>
                            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="New Category"
                                    className="border p-2 rounded flex-1"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                />
                                <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Add</button>
                            </form>
                            <ul className="space-y-2">
                                {categories.map(cat => (
                                    <li key={cat._id} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                                        <span>{cat.name}</span>
                                        <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
