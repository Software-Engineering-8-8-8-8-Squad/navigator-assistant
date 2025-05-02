const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables - this should be done before requiring routes
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const apiRoutes = require('./routes/api');

// Check required environment variables
if (!process.env.GRAPHHOPPER_API_KEY) {
    console.error('ERROR: GRAPHHOPPER_API_KEY is not set in environment variables');
    console.error('Please create a .env file with your GraphHopper API key');
    console.error('Example: GRAPHHOPPER_API_KEY=your_api_key_here');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/navigation', (req, res) => {
    res.render('navigation');
});

// API Routes
app.use('/api', apiRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Navigator Assistant running on http://localhost:${PORT}`);
});