const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paper',
        required: true
    }
}, { timestamps: true });

// One bookmark per user per paper
bookmarkSchema.index({ userId: 1, paperId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
