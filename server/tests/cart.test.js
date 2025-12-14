const request = require('supertest');
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Sweet = require('../models/Sweet');

let token;
let sweetId;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI + '_test');
});

afterEach(async () => {
    await User.deleteMany({});
    await Sweet.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Cart API', () => {
    beforeEach(async () => {
        // Register and login user
        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'cartuser',
                password: 'password123',
                role: 'customer'
            });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'cartuser',
                password: 'password123'
            });
        token = res.body.token;

        // Create a sweet
        const sweet = new Sweet({
            name: 'Test Sweet',
            description: 'Delicious',
            price: 10,
            category: 'Milk',
            imageUrl: 'http://example.com/image.jpg',
            quantity: 5
        });
        await sweet.save();
        sweetId = sweet._id;
    });

    it('should add item to cart', async () => {
        const res = await request(app)
            .post('/api/sweets/cart/add')
            .set('Authorization', `Bearer ${token}`)
            .send({ sweetId, quantity: 2 });

        expect(res.statusCode).toEqual(200);
        expect(res.body.cart).toHaveLength(1);
        expect(res.body.cart[0].quantity).toEqual(2);
    });

    it('should get cart items', async () => {
        // Add item first
        await request(app)
            .post('/api/sweets/cart/add')
            .set('Authorization', `Bearer ${token}`)
            .send({ sweetId, quantity: 1 });

        const res = await request(app)
            .get('/api/sweets/cart')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].sweet._id).toEqual(sweetId.toString());
    });

    it('should remove item from cart', async () => {
        // Add item first
        await request(app)
            .post('/api/sweets/cart/add')
            .set('Authorization', `Bearer ${token}`)
            .send({ sweetId, quantity: 1 });

        const res = await request(app)
            .delete(`/api/sweets/cart/${sweetId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.cart).toHaveLength(0);
    });

    it('should purchase cart', async () => {
        // Add item first
        await request(app)
            .post('/api/sweets/cart/add')
            .set('Authorization', `Bearer ${token}`)
            .send({ sweetId, quantity: 2 });

        const res = await request(app)
            .post('/api/sweets/cart/purchase')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Purchase successful');

        // Check sweet stock reduced
        const sweet = await Sweet.findById(sweetId);
        expect(sweet.quantity).toEqual(3); // 5 - 2 = 3
    });
});
