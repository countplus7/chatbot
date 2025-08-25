#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🤖 AI Chatbot Setup\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 16) {
    console.error('❌ Node.js version 16 or higher is required. Current version:', nodeVersion);
    process.exit(1);
}
console.log('✅ Node.js version:', nodeVersion);

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('\n📝 Creating .env file...');
    const envExample = fs.readFileSync(path.join(__dirname, 'env.example'), 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ .env file created from env.example');
    console.log('⚠️  Please edit .env file with your configuration before starting the app');
} else {
    console.log('✅ .env file exists');
}

// Check if uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    console.log('\n📁 Creating uploads directory...');
    fs.mkdirSync(uploadsDir);
    fs.mkdirSync(path.join(uploadsDir, 'audio'));
    fs.mkdirSync(path.join(uploadsDir, 'images'));
    console.log('✅ Uploads directory created');
} else {
    console.log('✅ Uploads directory exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('\n📦 Installing dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed');
    } catch (error) {
        console.error('❌ Failed to install dependencies');
        process.exit(1);
    }
} else {
    console.log('✅ Dependencies already installed');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\nNext steps:');
console.log('1. Edit .env file with your OpenAI API key and database credentials');
console.log('2. Set up PostgreSQL database and run: npm run init-db');
console.log('3. Start the application: npm run dev');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\nFor detailed instructions, see README.md'); 