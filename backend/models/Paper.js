const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
    universityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        required: [true, 'University is required']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    paperName: {
        type: String,
        trim: true,
        default: ''
    },
    year: {
        type: Number,
        required: [true, 'Year is required']
    },
    semester: {
        type: String,
        trim: true,
        default: ''
    },
    examType: {
        type: String,
        enum: ['Mid-Term', 'End-Term', 'Supplementary', 'Other'],
        default: 'End-Term'
    },
    paperType: {
        type: String,
        enum: ['Theory', 'Practical'],
        default: 'Theory'
    },
    paperCategory: {
        type: String,
        enum: ['Major', 'Minor'],
        default: 'Major'
    },
    minorSubject: {
        type: String,
        trim: true,
        default: ''
    },
    syllabusType: {
        type: String,
        trim: true,
        default: ''
    },
    paperFile: {
        type: String,
        required: [true, 'Paper file is required']
    },
    originalName: {
        type: String,
        default: ''
    },
    downloadCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Text index for search
paperSchema.index({ subject: 'text' });

module.exports = mongoose.model('Paper', paperSchema);
