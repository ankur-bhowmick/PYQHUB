const Paper = require('../models/Paper');
const University = require('../models/University');
const fs = require('fs');
const path = require('path');

// Get papers by university (with optional filters)
exports.getPapersByUniversity = async (req, res) => {
    try {
        const filter = { universityId: req.params.universityId };
        if (req.query.year) filter.year = parseInt(req.query.year);
        if (req.query.semester) filter.semester = req.query.semester;
        if (req.query.examType) filter.examType = req.query.examType;
        if (req.query.paperType) filter.paperType = req.query.paperType;
        if (req.query.paperCategory) filter.paperCategory = req.query.paperCategory;
        if (req.query.paperName) filter.paperName = req.query.paperName;
        if (req.query.syllabusType) filter.syllabusType = req.query.syllabusType;

        let sortField = { subject: 1, semester: 1, paperName: 1, year: -1 };
        if (req.query.sort === 'oldest') sortField = { subject: 1, semester: 1, paperName: 1, year: 1 };
        if (req.query.sort === 'subject') sortField = { subject: 1, semester: 1, paperName: 1, year: -1 };
        if (req.query.sort === 'popular') sortField = { downloadCount: -1, year: -1 };
        if (req.query.sort === 'recent') sortField = { createdAt: -1 };

        const papers = await Paper.find(filter)
            .populate('universityId', 'name')
            .sort(sortField);

        // Get unique values for filter dropdowns
        const allPapers = await Paper.find({ universityId: req.params.universityId });
        const years = [...new Set(allPapers.map(p => p.year))].sort((a, b) => b - a);
        const semesters = [...new Set(allPapers.map(p => p.semester).filter(Boolean))].sort();
        const subjects = [...new Set(allPapers.map(p => p.subject))].sort();
        const paperNames = [...new Set(allPapers.map(p => p.paperName).filter(Boolean))].sort();
        const syllabusTypes = [...new Set(allPapers.map(p => p.syllabusType).filter(Boolean))].sort();

        // Count papers per type for the tab badges
        const theoryCount = allPapers.filter(p => p.paperType !== 'Practical').length;
        const practicalCount = allPapers.filter(p => p.paperType === 'Practical').length;

        res.json({ papers, years, semesters, subjects, paperNames, syllabusTypes, theoryCount, practicalCount });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch papers' });
    }
};

// Search papers globally
exports.searchPapers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.json({ papers: [] });
        }

        const searchRegex = new RegExp(q.trim(), 'i');

        // Search by subject
        const papersBySubject = await Paper.find({ subject: searchRegex })
            .populate('universityId', 'name location')
            .sort({ year: -1 })
            .limit(20);

        // Search by university name
        const matchingUnis = await University.find({ name: searchRegex }).select('_id');
        const uniIds = matchingUnis.map(u => u._id);
        const papersByUni = await Paper.find({ universityId: { $in: uniIds } })
            .populate('universityId', 'name location')
            .sort({ year: -1 })
            .limit(20);

        // Merge results (remove duplicates)
        const allPapers = [...papersBySubject];
        const existingIds = new Set(allPapers.map(p => p._id.toString()));
        papersByUni.forEach(p => {
            if (!existingIds.has(p._id.toString())) allPapers.push(p);
        });

        res.json({ papers: allPapers.slice(0, 30) });
    } catch (error) {
        res.status(500).json({ message: 'Failed to search papers' });
    }
};

// Get recently added papers
exports.getRecentPapers = async (req, res) => {
    try {
        const papers = await Paper.find()
            .populate('universityId', 'name location')
            .sort({ createdAt: -1 })
            .limit(8);
        res.json({ papers });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch recent papers' });
    }
};

// Increment download count
exports.incrementDownload = async (req, res) => {
    try {
        const paper = await Paper.findByIdAndUpdate(
            req.params.id,
            { $inc: { downloadCount: 1 } },
            { new: true }
        );
        if (!paper) return res.status(404).json({ message: 'Paper not found' });
        res.json({ downloadCount: paper.downloadCount });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update download count' });
    }
};

// Get all papers (admin)
exports.getAllPapers = async (req, res) => {
    try {
        const papers = await Paper.find()
            .populate('universityId', 'name')
            .sort({ createdAt: -1 });
        res.json({ papers });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch papers' });
    }
};

// Create paper with file upload (admin)
exports.createPaper = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'PDF file is required' });
        }
        const { universityId, subject, paperName, year, semester, examType, paperType, paperCategory, minorSubject, syllabusType } = req.body;
        const paper = await Paper.create({
            universityId,
            subject,
            paperName: paperName || '',
            year: parseInt(year),
            semester,
            examType,
            paperType: paperType || 'Theory',
            paperCategory: paperCategory || 'Major',
            minorSubject: paperCategory === 'Minor' ? (minorSubject || '') : '',
            syllabusType: syllabusType || '',
            paperFile: req.file.filename,
            originalName: req.file.originalname
        });
        res.status(201).json({ message: 'Paper added successfully', paper });
    } catch (error) {
        // Clean up uploaded file if DB save fails
        if (req.file) {
            const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        res.status(500).json({ message: error.message || 'Failed to add paper' });
    }
};

// Update paper (admin) - optionally replace file
exports.updatePaper = async (req, res) => {
    try {
        const existingPaper = await Paper.findById(req.params.id);
        if (!existingPaper) {
            if (req.file) {
                const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            return res.status(404).json({ message: 'Paper not found' });
        }

        const updateData = { ...req.body };
        if (updateData.year) updateData.year = parseInt(updateData.year);

        if (req.file) {
            // Delete old file
            const oldFilePath = path.join(__dirname, '..', 'uploads', existingPaper.paperFile);
            if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);

            updateData.paperFile = req.file.filename;
            updateData.originalName = req.file.originalname;
        }

        const paper = await Paper.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        res.json({ message: 'Paper updated successfully', paper });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update paper' });
    }
};

// Delete paper (admin) - also delete file
exports.deletePaper = async (req, res) => {
    try {
        const paper = await Paper.findByIdAndDelete(req.params.id);
        if (!paper) {
            return res.status(404).json({ message: 'Paper not found' });
        }
        // Delete file from disk
        const filePath = path.join(__dirname, '..', 'uploads', paper.paperFile);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        res.json({ message: 'Paper deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete paper' });
    }
};

// Get stats (admin)
exports.getStats = async (req, res) => {
    try {
        const totalPapers = await Paper.countDocuments();
        const totalDownloads = await Paper.aggregate([
            { $group: { _id: null, total: { $sum: '$downloadCount' } } }
        ]);
        res.json({
            stats: {
                totalPapers,
                totalDownloads: totalDownloads[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};

// Serve PDF file with proper headers
exports.servePdf = async (req, res) => {
    try {
        const filename = req.params.filename;
        // Prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({ message: 'Invalid filename' });
        }
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'PDF file not found on server' });
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: 'Failed to serve PDF' });
    }
};
