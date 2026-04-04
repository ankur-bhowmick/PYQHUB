const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    review: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

// One rating per user
ratingSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
