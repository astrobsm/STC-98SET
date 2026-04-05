const express = require('express');
const router = express.Router();
const amendmentController = require('../controllers/amendment.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', amendmentController.getAll);
router.post('/', amendmentController.create);
router.post('/:id/vote', amendmentController.vote);
router.post('/:id/approve', authorize('admin'), amendmentController.approve);
router.post('/:id/reject', authorize('admin'), amendmentController.reject);

module.exports = router;
