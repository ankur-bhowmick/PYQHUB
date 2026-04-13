const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./backend/config/db');
const seedAdmin = require('./backend/utils/seedAdmin');

// Load env from backend folder (for local dev)
// On Render, env vars are set via the dashboard
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

// Connect to DB
connectDB().then(() => {
    seedAdmin();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded PDFs
app.use('/uploads', express.static(path.join(__dirname, 'backend', 'uploads')));

// API Routes
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/universities', require('./backend/routes/universities'));
app.use('/api/papers', require('./backend/routes/papers'));
app.use('/api/ratings', require('./backend/routes/ratings'));
app.use('/api/contacts', require('./backend/routes/contacts'));
app.use('/api/bookmarks', require('./backend/routes/bookmarks'));

// Serve frontend in production
const frontendDist = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendDist));

// All non-API routes serve the React app (for client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
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
