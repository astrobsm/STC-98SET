const express = require('express');
const router = express.Router();
const birthdayController = require('../controllers/birthday.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', birthdayController.getAll);
router.get('/upcoming', birthdayController.getUpcoming);
router.post('/message', birthdayController.sendMessage);

module.exports = router;
