const express = require('express');
const router = express.Router();
const { register, login, getUsers, getMe, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.get('/users', auth, roleCheck('admin'), getUsers);

module.exports = router;
