const express = require('express');
const router = express.Router();
const constitutionController = require('../controllers/constitution.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { constitutionSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/', constitutionController.getAll);
router.get('/:id', constitutionController.getById);
router.post('/', authorize('admin'), validate(constitutionSchema), constitutionController.create);
router.patch('/:id', authorize('admin'), constitutionController.update);

module.exports = router;
