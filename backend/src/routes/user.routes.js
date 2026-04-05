const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { updateProfileSchema, updateRoleSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/', authorize('admin', 'exco'), userController.getAll);
router.get('/stats/overview', authorize('admin', 'exco'), userController.getStats);
router.get('/:id', userController.getById);
router.patch('/:id', validate(updateProfileSchema), userController.update);
router.patch('/:id/role', authorize('admin'), validate(updateRoleSchema), userController.updateRole);

module.exports = router;
