const Rating = require('../models/Rating');

// Get all ratings
exports.getRatings = async (req, res) => {
    try {
        const ratings = await Rating.find()
            .populate('userId', 'name role')
            .sort({ createdAt: -1 });

        const totalRatings = ratings.length;
        const avgRating = totalRatings > 0
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
            : 0;

        res.json({ ratings, avgRating: parseFloat(avgRating), totalRatings });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch ratings' });
    }
};

// Add or update rating (one per user)
exports.addRating = async (req, res) => {
    try {
        const { rating, review } = req.body;

        const existing = await Rating.findOne({ userId: req.user._id });
        if (existing) {
            existing.rating = rating;
            existing.review = review || '';
            await existing.save();
            return res.json({ message: 'Rating updated successfully', rating: existing });
        }

        const newRating = await Rating.create({ userId: req.user._id, rating, review });
        res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to submit rating' });
    }
};

// Delete rating (admin)
exports.deleteRating = async (req, res) => {
    try {
        await Rating.findByIdAndDelete(req.params.id);
        res.json({ message: 'Rating deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete rating' });
    }
};
