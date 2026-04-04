const express = require('express');
const router = express.Router();
const { submitContact, getContacts, updateContactStatus, deleteContact } = require('../controllers/contactController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, submitContact);
router.get('/', auth, roleCheck('admin'), getContacts);
router.put('/:id', auth, roleCheck('admin'), updateContactStatus);
router.delete('/:id', auth, roleCheck('admin'), deleteContact);

module.exports = router;
