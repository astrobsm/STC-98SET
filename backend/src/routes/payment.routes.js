const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { upload } = require('../utils/upload');

router.use(authenticate);

router.get('/', paymentController.getAll);
router.get('/summary', paymentController.getSummary);
router.post('/', upload.single('payment_proof'), paymentController.create);
router.patch('/:id/verify', authorize('admin'), paymentController.verify);

module.exports = router;
