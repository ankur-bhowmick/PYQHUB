const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const admin = new User({
                name: 'Admin',
                email: 'admin@pyqportal.com',
                phone: '9999999999',
                password: 'admin123',
                role: 'admin'
            });
            await admin.save();
            console.log('Default admin created: admin@pyqportal.com / admin123');
        }
    } catch (error) {
        console.error('Error seeding admin:', error.message);
    }
};

module.exports = seedAdmin;
