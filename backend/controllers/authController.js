const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Disposable email domains to block
const disposableDomains = [
    'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
    'yopmail.com', 'tempinbox.com', 'dispostable.com', 'fakeinbox.com',
    'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'guerrillamail.info',
    'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org',
    'trashmail.com', 'trashmail.me', 'trashmail.net', 'temp-mail.org',
    'tempmailo.com', 'tempr.email', 'getnada.com', 'maildrop.cc'
];

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return { valid: false, message: 'Please enter a valid email address' };
    const domain = email.split('@')[1].toLowerCase();
    if (disposableDomains.includes(domain)) {
        return { valid: false, message: 'Disposable email addresses are not allowed. Please use your real email.' };
    }
    return { valid: true };
};

// Validate phone number (10-digit Indian format)
const isValidPhone = (phone) => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
        return { valid: false, message: 'Please enter a valid 10-digit phone number starting with 6-9' };
    }
    return { valid: true, cleaned };
};

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Validate name
        if (!name || !/^[A-Za-z\s]+$/.test(name.trim())) {
            return res.status(400).json({ message: 'Name can only contain letters and spaces' });
        }
        if (name.trim().length < 2) {
            return res.status(400).json({ message: 'Name must be at least 2 characters' });
        }

        // Validate email
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const emailCheck = isValidEmail(email);
        if (!emailCheck.valid) {
            return res.status(400).json({ message: emailCheck.message });
        }

        // Validate phone
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }
        const phoneCheck = isValidPhone(phone);
        if (!phoneCheck.valid) {
            return res.status(400).json({ message: phoneCheck.message });
        }

        // Validate password
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check for existing email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Check for existing phone
        const existingPhone = await User.findOne({ phone: phoneCheck.cleaned });
        if (existingPhone) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }

        // Only allow student or teacher during registration
        const allowedRole = (role === 'teacher') ? 'teacher' : 'student';

        const user = await User.create({
            name: name.trim(),
            email,
            phone: phoneCheck.cleaned,
            password,
            role: allowedRole
        });
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Registration failed' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
};

// Get all users (admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    res.json({ user: req.user });
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const updates = {};

        if (name) {
            if (!/^[A-Za-z\s]+$/.test(name.trim())) {
                return res.status(400).json({ message: 'Name can only contain letters and spaces' });
            }
            updates.name = name.trim();
        }

        if (phone) {
            const phoneCheck = isValidPhone(phone);
            if (!phoneCheck.valid) {
                return res.status(400).json({ message: phoneCheck.message });
            }
            const existingPhone = await User.findOne({ phone: phoneCheck.cleaned, _id: { $ne: req.user._id } });
            if (existingPhone) {
                return res.status(400).json({ message: 'Phone number already in use' });
            }
            updates.phone = phoneCheck.cleaned;
        }

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile' });
    }
};
