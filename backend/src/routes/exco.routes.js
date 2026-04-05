const express = require('express');
const router = express.Router();
const excoController = require('../controllers/exco.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', excoController.getAll);
router.post('/', authorize('admin'), excoController.create);
router.patch('/:id', authorize('admin'), excoController.update);
router.delete('/:id', authorize('admin'), excoController.delete);

module.exports = router;
