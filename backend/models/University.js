const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'University name is required'],
        trim: true,
        unique: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    syllabusTypes: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('University', universitySchema);
