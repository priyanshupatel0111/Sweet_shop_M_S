const request = require('supertest');
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

// Connect to a test database before running tests
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI + '_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

// Clear database after each test
afterEach(async () => {
    await User.deleteMany({});
});

// Close connection after all tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Auth API', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    password: 'password123',
                    role: 'customer'
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'User registered successfully');
        });

        it('should not register a user with existing username', async () => {
            await User.create({
                username: 'testuser',
                password: 'hashedpassword',
                role: 'customer'
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    password: 'password123'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Username already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login a registered user and return token', async () => {
            // Register a user first
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'loginuser',
                    password: 'password123',
                    role: 'customer'
                });

            // Try to login
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'loginuser',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('role', 'customer');
        });

        it('should reject invalid credentials', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'wrongpassuser',
                    password: 'password123'
                });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'wrongpassuser',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Invalid credentials');
        });
    });
});
