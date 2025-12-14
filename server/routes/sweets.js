const express = require('express');
const router = express.Router();
const sweetsController = require('../controllers/sweetsController');
const auth = require('../middleware/auth');

router.get('/', sweetsController.getAllSweets);
router.get('/search', sweetsController.searchSweets);

router.post('/cart/add', auth, sweetsController.addToCart);
router.get('/cart', auth, sweetsController.getCart);
router.delete('/cart/:sweetId', auth, sweetsController.removeFromCart);
router.put('/cart/:sweetId', auth, sweetsController.updateCartItem);
router.post('/cart/purchase', auth, sweetsController.purchaseCart);

router.post('/', auth, auth.isAdmin, sweetsController.createSweet);
router.put('/:id', auth, auth.isAdmin, sweetsController.updateSweet);
router.delete('/:id', auth, auth.isAdmin, sweetsController.deleteSweet);
router.post('/:id/purchase', auth, sweetsController.purchaseSweet);
router.post('/:id/restock', auth, auth.isAdmin, sweetsController.restockSweet);

module.exports = router;
