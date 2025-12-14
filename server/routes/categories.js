const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

// Public route to view categories
router.get('/', categoryController.getAllCategories);

// Protected routes (Admin only ideally, but using generic auth for now as per current setup)
router.post('/', auth, categoryController.createCategory);
router.delete('/:id', auth, categoryController.deleteCategory);

module.exports = router;
