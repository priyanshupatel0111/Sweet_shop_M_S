const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Sweet = require('../models/Sweet');
const jwt = require('jsonwebtoken');

// Connect to a test database before running tests
beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI + '_test', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
});

// Clear database after each test
afterEach(async () => {
    await User.deleteMany({});
    await Sweet.deleteMany({});
});

// Close connection after all tests
afterAll(async () => {
    await mongoose.connection.close();
});

const generateToken = (id, role) => {
    return jwt.sign({ userId: id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

describe('Sweets API', () => {
    let adminToken;
    let customerToken;
    let adminId;
    let customerId;

    beforeEach(async () => {
        const admin = await User.create({ username: 'admin', password: 'password', role: 'admin' });
        const customer = await User.create({ username: 'customer', password: 'password', role: 'customer' });

        adminId = admin._id;
        customerId = customer._id;

        adminToken = generateToken(admin._id, 'admin');
        customerToken = generateToken(customer._id, 'customer');
    });

    describe('POST /api/sweets', () => {
        it('should allow admin to add a sweet', async () => {
            const res = await request(app)
                .post('/api/sweets')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Rasgulla',
                    category: 'Bengali',
                    price: 15,
                    quantity: 100,
                    description: 'Juicy and soft'
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('name', 'Rasgulla');
        });

        it('should not allow customer to add a sweet', async () => {
            const res = await request(app)
                .post('/api/sweets')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    name: 'Laddu',
                    category: 'Indian',
                    price: 10,
                    quantity: 50
                });
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/sweets', () => {
        it('should get all sweets', async () => {
            await Sweet.create({ name: 'Jalebi', category: 'Fried', price: 20, quantity: 20 });
            const res = await request(app).get('/api/sweets');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(1);
        });
    });

    describe('POST /api/sweets/:id/purchase', () => {
        it('should decrease quantity when purchased', async () => {
            const sweet = await Sweet.create({ name: 'Barfi', category: 'Milk', price: 25, quantity: 10 });
            const res = await request(app)
                .post(`/api/sweets/${sweet._id}/purchase`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.quantity).toBe(9);
        });

        it('should fail if quantity is 0', async () => {
            const sweet = await Sweet.create({ name: 'Empty', category: 'Milk', price: 25, quantity: 0 });
            const res = await request(app)
                .post(`/api/sweets/${sweet._id}/purchase`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Out of stock');
        });
    });
});
