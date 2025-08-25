# AI Chatbot with Voice, Text & Image Analysis

A comprehensive AI chatbot application built with Node.js, PostgreSQL, and OpenAI's GPT-4, Whisper, and Vision APIs. Features include text conversations, voice-to-text transcription, image analysis with OCR, and persistent chat history.

## Features

- **Text Chat**: Natural language conversations with GPT-4
- **Voice Notes**: Speech-to-text using OpenAI Whisper
- **Image Analysis**: OCR and image understanding with GPT-4 Vision
- **Chat History**: Persistent storage in PostgreSQL database
- **Real-time UI**: Modern, responsive interface with Socket.IO
- **Conversation Management**: Create, view, and delete conversations
- **File Upload**: Support for audio and image files

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **AI Services**: OpenAI GPT-4, Whisper, Vision APIs
- **Real-time**: Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **File Handling**: Multer, fs-extra
- **Styling**: Modern CSS with responsive design

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- OpenAI API key
- Modern web browser with microphone access

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=chatbot_db
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # File Upload Configuration
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=10485760
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb chatbot_db
   
   # Initialize database tables
   npm run init-db
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Conversations
- `GET /api/chat/conversations` - Get all conversations
- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations/:id` - Get specific conversation with messages
- `DELETE /api/chat/conversations/:id` - Delete conversation

### Messages
- `POST /api/chat/conversations/:id/messages` - Send text message
- `POST /api/chat/conversations/:id/voice` - Upload and process voice message
- `POST /api/chat/conversations/:id/image` - Upload and analyze image

## Usage

### Text Chat
1. Click "New Chat" to start a conversation
2. Type your message in the input field
3. Press Enter or click the send button
4. The AI will respond with helpful information

### Voice Notes
1. Click the microphone button in the chat header
2. Allow microphone access when prompted
3. Speak your message clearly
4. Click the stop button or the microphone again to end recording
5. The AI will transcribe your speech and respond

### Image Analysis
1. Click the image button in the chat header
2. Select an image file (JPEG, PNG, GIF, WebP)
3. Optionally add a prompt describing what you want analyzed
4. Click "Analyze Image"
5. The AI will describe the image and answer questions about it

### Managing Conversations
- **View History**: Click on any conversation in the sidebar
- **Delete**: Click the trash icon in the chat header
- **New Chat**: Click "New Chat" button to start fresh

## File Structure

```
chatbot/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── upload.js            # File upload middleware
├── public/
│   ├── index.html           # Main HTML file
│   ├── styles.css           # CSS styles
│   └── app.js              # Frontend JavaScript
├── routes/
│   └── chat.js             # API routes
├── scripts/
│   └── init-database.js    # Database initialization
├── services/
│   ├── chat-service.js     # Chat business logic
│   └── openai-service.js   # OpenAI API integration
├── uploads/                # Uploaded files (auto-created)
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
├── server.js              # Main server file
└── README.md              # This file
```

## Configuration

### OpenAI API Setup
1. Sign up at [OpenAI](https://openai.com)
2. Get your API key from the dashboard
3. Add it to your `.env` file

### Database Setup
1. Install PostgreSQL
2. Create a database named `chatbot_db`
3. Update database credentials in `.env`
4. Run `npm run init-db` to create tables

### File Upload Limits
- Maximum file size: 10MB (configurable in `.env`)
- Supported audio formats: WAV, MP3, M4A, WebM
- Supported image formats: JPEG, PNG, GIF, WebP

## Security Considerations

- Store API keys securely in environment variables
- Implement proper authentication for production use
- Validate file uploads and sanitize inputs
- Use HTTPS in production
- Regularly update dependencies

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **OpenAI API Errors**
   - Verify API key is correct
   - Check API quota and billing
   - Ensure internet connection

3. **Microphone Access Denied**
   - Check browser permissions
   - Use HTTPS in production (required for microphone)
   - Try refreshing the page

4. **File Upload Issues**
   - Check file size limits
   - Verify file format is supported
   - Ensure upload directory has write permissions

### Development Tips

- Use `npm run dev` for development with auto-restart
- Check browser console for frontend errors
- Monitor server logs for backend issues
- Use browser dev tools to inspect network requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the code comments
3. Open an issue on GitHub

## Future Enhancements

- User authentication and authorization
- Multi-language support
- Advanced conversation analytics
- Integration with other AI services
- Mobile app development
- Voice response capabilities
- Advanced image editing features 