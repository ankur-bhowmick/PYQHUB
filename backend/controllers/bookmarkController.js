const Bookmark = require('../models/Bookmark');

// Get user's bookmarks
exports.getBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ userId: req.user._id })
            .populate({
                path: 'paperId',
                populate: { path: 'universityId', select: 'name location' }
            })
            .sort({ createdAt: -1 });
        res.json({ bookmarks });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookmarks' });
    }
};

// Toggle bookmark (add/remove)
exports.toggleBookmark = async (req, res) => {
    try {
        const { paperId } = req.body;
        if (!paperId) {
            return res.status(400).json({ message: 'Paper ID is required' });
        }

        const existing = await Bookmark.findOne({ userId: req.user._id, paperId });
        if (existing) {
            await Bookmark.findByIdAndDelete(existing._id);
            return res.json({ message: 'Bookmark removed', bookmarked: false });
        }

        await Bookmark.create({ userId: req.user._id, paperId });
        res.status(201).json({ message: 'Paper bookmarked', bookmarked: true });
    } catch (error) {
        res.status(500).json({ message: 'Failed to toggle bookmark' });
    }
};

// Check if paper is bookmarked
exports.checkBookmark = async (req, res) => {
    try {
        const existing = await Bookmark.findOne({ userId: req.user._id, paperId: req.params.paperId });
        res.json({ bookmarked: !!existing });
    } catch (error) {
        res.status(500).json({ message: 'Failed to check bookmark' });
    }
};

// Get user's bookmark IDs (for bulk check)
exports.getBookmarkIds = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ userId: req.user._id }).select('paperId');
        const ids = bookmarks.map(b => b.paperId.toString());
        res.json({ bookmarkedIds: ids });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookmark IDs' });
    }
};
