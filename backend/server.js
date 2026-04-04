const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');

// Load env
dotenv.config();

// Connect to DB
connectDB().then(() => {
    seedAdmin();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/universities', require('./routes/universities'));
app.use('/api/papers', require('./routes/papers'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/bookmarks', require('./routes/bookmarks'));

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'University Papers API is running' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.message === 'Only PDF files are allowed') {
        return res.status(400).json({ message: 'Only PDF files are allowed' });
    }
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
