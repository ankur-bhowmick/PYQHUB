const Contact = require('../models/Contact');

// Submit contact message (user)
exports.submitContact = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const contact = await Contact.create({ userId: req.user._id, subject, message });
        res.status(201).json({ message: 'Message sent successfully', contact });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to send message' });
    }
};

// Get all contacts (admin)
exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find()
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 });
        res.json({ contacts });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch contacts' });
    }
};

// Update contact status (admin)
exports.updateContactStatus = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!contact) return res.status(404).json({ message: 'Contact not found' });
        res.json({ message: 'Status updated', contact });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update status' });
    }
};

// Delete contact (admin)
exports.deleteContact = async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: 'Contact deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete contact' });
    }
};
