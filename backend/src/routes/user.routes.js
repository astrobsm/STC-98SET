const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { updateProfileSchema, updateRoleSchema } = require('../utils/validators');
const { upload } = require('../utils/upload');

router.use(authenticate);

router.get('/', authorize('admin', 'exco'), userController.getAll);
router.get('/stats/overview', authorize('admin', 'exco'), userController.getStats);
router.get('/:id', userController.getById);
router.patch('/:id', upload.single('avatar'), validate(updateProfileSchema), userController.update);
router.patch('/:id/role', authorize('admin'), validate(updateRoleSchema), userController.updateRole);
router.post('/:id/avatar', upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
