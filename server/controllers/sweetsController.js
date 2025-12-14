const Sweet = require('../models/Sweet');
const fs = require('fs');
const path = require('path');

const logDebug = (message) => {
    const logFile = path.join(__dirname, '../debug_cart.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `${timestamp} - ${message}\n`);
};

exports.getAllSweets = async (req, res) => {
    try {
        const sweets = await Sweet.find();
        res.json(sweets);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createSweet = async (req, res) => {
    try {
        const sweet = new Sweet(req.body);
        await sweet.save();
        res.status(201).json(sweet);
    } catch (error) {
        res.status(400).json({ message: 'Error creating sweet', error: error.message });
    }
};

exports.updateSweet = async (req, res) => {
    try {
        const sweet = await Sweet.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!sweet) return res.status(404).json({ message: 'Sweet not found' });
        res.json(sweet);
    } catch (error) {
        res.status(400).json({ message: 'Error updating sweet' });
    }
};

exports.deleteSweet = async (req, res) => {
    try {
        const sweet = await Sweet.findByIdAndDelete(req.params.id);
        if (!sweet) return res.status(404).json({ message: 'Sweet not found' });
        res.json({ message: 'Sweet deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.purchaseSweet = async (req, res) => {
    try {
        const sweet = await Sweet.findById(req.params.id);
        if (!sweet) return res.status(404).json({ message: 'Sweet not found' });

        if (sweet.quantity < 1) {
            return res.status(400).json({ message: 'Out of stock' });
        }

        sweet.quantity -= 1;
        await sweet.save();
        res.json(sweet);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.restockSweet = async (req, res) => {
    try {
        const { quantity } = req.body;
        const sweet = await Sweet.findById(req.params.id);
        if (!sweet) return res.status(404).json({ message: 'Sweet not found' });

        sweet.quantity += quantity;
        await sweet.save();
        res.json(sweet);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.searchSweets = async (req, res) => {
    try {
        const { name, category, minPrice, maxPrice } = req.query;
        let query = {};

        if (name) query.name = { $regex: name, $options: 'i' };
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const sweets = await Sweet.find(query);
        res.json(sweets);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { sweetId, quantity } = req.body;
        const user = await require('../models/User').findById(req.user.userId);
        const sweet = await Sweet.findById(sweetId);

        if (!sweet) {
            return res.status(404).json({ message: 'Sweet not found' });
        }

        const cartItemIndex = user.cart.findIndex(item => item.sweet.toString() === sweetId);

        if (cartItemIndex > -1) {
            user.cart[cartItemIndex].quantity += quantity || 1;
        } else {
            user.cart.push({ sweet: sweetId, quantity: quantity || 1 });
        }

        await user.save();
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCart = async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.userId).populate('cart.sweet');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.userId);

        user.cart = user.cart.filter(item => item.sweet.toString() !== req.params.sweetId);
        await user.save();

        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const user = await require('../models/User').findById(req.user.userId);

        const cartItem = user.cart.find(item => item.sweet.toString() === req.params.sweetId);
        if (cartItem) {
            cartItem.quantity = quantity;
            if (cartItem.quantity <= 0) {
                user.cart = user.cart.filter(item => item.sweet.toString() !== req.params.sweetId);
            }
            await user.save();
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.purchaseCart = async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.userId).populate('cart.sweet');
        const cart = user.cart;

        if (cart.length === 0) return res.status(400).json({ message: 'Cart is empty' });

        // Check stock
        for (let item of cart) {
            if (item.sweet.quantity < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${item.sweet.name}` });
            }
        }

        // Deduct stock
        for (let item of cart) {
            const sweet = await Sweet.findById(item.sweet._id);
            sweet.quantity -= item.quantity;
            await sweet.save();
        }

        // Clear cart
        user.cart = [];
        await user.save();

        res.json({ message: 'Purchase successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
