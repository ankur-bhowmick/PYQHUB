const express = require('express');
const router = express.Router();
const { getBookmarks, toggleBookmark, checkBookmark, getBookmarkIds } = require('../controllers/bookmarkController');
const auth = require('../middleware/auth');

router.get('/', auth, getBookmarks);
router.get('/ids', auth, getBookmarkIds);
router.get('/check/:paperId', auth, checkBookmark);
router.post('/toggle', auth, toggleBookmark);

module.exports = router;
