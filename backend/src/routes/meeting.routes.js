const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meeting.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/config', meetingController.getConfig);
router.post('/room', meetingController.createRoom);

module.exports = router;
