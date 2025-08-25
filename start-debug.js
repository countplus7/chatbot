#!/usr/bin/env node

console.log('Starting AI Chatbot with debug mode...\n');

// Check environment variables
require('dotenv').config();

console.log('Environment check:');
console.log('- PORT:', process.env.PORT || '3000 (default)');
console.log('- DB_HOST:', process.env.DB_HOST || 'not set');
console.log('- DB_NAME:', process.env.DB_NAME || 'not set');
console.log('- DB_USER:', process.env.DB_USER || 'not set');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'set' : 'not set');
console.log('');

// Test database connection
const pool = require('./config/database');

async function testDatabase() {
    try {
        console.log('Testing database connection...');
        const result = await pool.query('SELECT 1 as test');
        console.log('✅ Database connection successful');
        await pool.end();
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
        console.log('Please check your database configuration');
        process.exit(1);
    }
}

// Test OpenAI API
const openaiService = require('./services/openai-service');

async function testOpenAI() {
    try {
        console.log('Testing OpenAI API...');
        const response = await openaiService.chatCompletion([
            { role: 'user', content: 'Hello' }
        ]);
        console.log('✅ OpenAI API connection successful');
        console.log('Sample response:', response.substring(0, 50) + '...');
    } catch (error) {
        console.log('❌ OpenAI API test failed:', error.message);
        console.log('Please check your OpenAI API key');
        process.exit(1);
    }
}

async function runTests() {
    await testDatabase();
    await testOpenAI();
    
    console.log('\n✅ All tests passed! Starting server...\n');
    
    // Start the server
    require('./server.js');
}

runTests().catch(error => {
    console.error('Startup failed:', error);
    process.exit(1);
}); 