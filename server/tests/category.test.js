const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Category API', () => {
    let token;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sweetshop_test');
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Category.deleteMany({});

        // Create a mock admin user and token
        const user = new User({
            username: 'admin',
            password: 'password123',
            role: 'admin'
        });
        // We don't save the user to DB to avoid unique constraint issues if running multiple times, 
        // strictly speaking we just need a valid token signature if the middleware checks DB, 
        // but if middleware just validates signature:
        token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    });

    it('should fetch all categories (empty initially)', async () => {
        const res = await request(app).get('/api/categories');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([]);
    });

    it('should create a new category', async () => {
        const res = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Test Category' });

        expect(res.statusCode).toEqual(201);
        expect(res.body.name).toEqual('Test Category');
    });

    it('should not create duplicate category', async () => {
        await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Duplicate' });

        const res = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Duplicate' });

        expect(res.statusCode).toEqual(400);
    });

    it('should delete a category', async () => {
        const created = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'To Delete' });

        const res = await request(app)
            .delete(`/api/categories/${created.body._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);

        const check = await request(app).get('/api/categories');
        expect(check.body).toHaveLength(0);
    });
});
