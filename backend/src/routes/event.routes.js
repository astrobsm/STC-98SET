const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { eventSchema } = require('../utils/validators');

router.use(authenticate);

router.get('/', eventController.getAll);
router.get('/:id', eventController.getById);
router.post('/', authorize('admin', 'exco'), validate(eventSchema), eventController.create);
router.patch('/:id', authorize('admin', 'exco'), eventController.update);
router.delete('/:id', authorize('admin'), eventController.delete);

module.exports = router;
