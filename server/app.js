const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "*"], // Allow images from any source
            scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts (if needed for React)
            styleSrc: ["'self'", "'unsafe-inline'"],
        },
    },
}));
app.use(compression());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sweets', require('./routes/sweets'));
app.use('/api/categories', require('./routes/categories'));

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React routing, return all requests to React app
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

module.exports = app;
