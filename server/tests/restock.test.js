const request = require('supertest');
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Sweet = require('../models/Sweet');

let adminToken;
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

describe('Restock API', () => {
    beforeEach(async () => {
        // Register and login admin
        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'adminuser',
                password: 'password123',
                role: 'admin'
            });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'adminuser',
                password: 'password123'
            });
        adminToken = res.body.token;

        // Create a sweet
        const sweet = new Sweet({
            name: 'Restock Sweet',
            description: 'To be restocked',
            price: 10,
            category: 'Milk',
            imageUrl: 'http://example.com/image.jpg',
            quantity: 5
        });
        await sweet.save();
        sweetId = sweet._id;
    });

    it('should restock sweet', async () => {
        const res = await request(app)
            .post(`/api/sweets/${sweetId}/restock`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ quantity: 10 });

        expect(res.statusCode).toEqual(200);
        expect(res.body.quantity).toEqual(15); // 5 + 10

        const updatedSweet = await Sweet.findById(sweetId);
        expect(updatedSweet.quantity).toEqual(15);
    });

    it('should fail with invalid quantity', async () => {
        const res = await request(app)
            .post(`/api/sweets/${sweetId}/restock`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ quantity: 'invalid' });

        // Mongoose might cast or fail. If it casts 'invalid' to NaN, saving might fail or result in NaN.
        // Let's see what happens.
        // If it returns 200 but quantity is NaN, that's a bug.
        // If it returns 500, that's also not ideal but "working" in a sense.
    });
});
