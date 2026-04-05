const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contribution.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', contributionController.getAll);
router.get('/:id', contributionController.getById);
router.post('/', authorize('admin'), contributionController.create);
router.patch('/:id', authorize('admin'), contributionController.update);
router.delete('/:id', authorize('admin'), contributionController.delete);
router.post('/:id/pay', contributionController.pay);
router.patch('/:cid/payments/:pid/verify', authorize('admin'), contributionController.verifyPayment);

module.exports = router;
