const University = require('../models/University');
const Paper = require('../models/Paper');

// Get all universities
exports.getUniversities = async (req, res) => {
    try {
        const universities = await University.find().sort({ name: 1 });

        // Get paper count for each university
        const universitiesWithCount = await Promise.all(
            universities.map(async (uni) => {
                const paperCount = await Paper.countDocuments({ universityId: uni._id });
                return { ...uni.toObject(), paperCount };
            })
        );

        res.json({ universities: universitiesWithCount });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch universities' });
    }
};

// Get single university
exports.getUniversity = async (req, res) => {
    try {
        const university = await University.findById(req.params.id);
        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }
        res.json({ university });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch university' });
    }
};

// Create university (admin)
exports.createUniversity = async (req, res) => {
    try {
        const { name, location, description, syllabusTypes } = req.body;
        const university = await University.create({ name, location, description, syllabusTypes: syllabusTypes || [] });
        res.status(201).json({ message: 'University created successfully', university });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'University with this name already exists' });
        }
        res.status(500).json({ message: error.message || 'Failed to create university' });
    }
};

// Update university (admin)
exports.updateUniversity = async (req, res) => {
    try {
        const university = await University.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }
        res.json({ message: 'University updated successfully', university });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update university' });
    }
};

// Delete university (admin) - also deletes all papers
exports.deleteUniversity = async (req, res) => {
    try {
        const university = await University.findByIdAndDelete(req.params.id);
        if (!university) {
            return res.status(404).json({ message: 'University not found' });
        }
        await Paper.deleteMany({ universityId: req.params.id });
        res.json({ message: 'University and all its papers deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete university' });
    }
};
