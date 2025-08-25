const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const chatRoutes = require('./routes/chat');
const pool = require('./config/database');
const openaiService = require('./services/openai-service');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));



// Routes
app.use('/api/chat', chatRoutes);

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});



// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

// Test database connection before starting server
async function startServer() {
  try {
    console.log('Testing database connection...');
    await pool.query('SELECT 1');
    console.log('Database connection successful');
    
    console.log('Testing OpenAI API connection...');
    await openaiService.chatCompletion([
      { role: 'user', content: 'Hello' }
    ]);
    console.log('OpenAI API connection successful');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API base URL: http://localhost:${PORT}/api/chat`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    if (error.message.includes('database')) {
      console.error('Please check your database configuration in .env file');
    } else if (error.message.includes('OpenAI')) {
      console.error('Please check your OpenAI API key in .env file');
    }
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

module.exports = { app }; 