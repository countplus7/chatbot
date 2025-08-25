const pool = require('../config/database');
const openaiService = require('./openai-service');
const { v4: uuidv4 } = require('uuid');

class ChatService {
  async createUser(username, email) {
    try {
      const result = await pool.query(
        'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
        [username, email]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async createConversation(userId, title = 'New Conversation') {
    try {
      // First, ensure the user exists
      let user = await this.getUser(userId);
      if (!user) {
        // Create a default user if it doesn't exist
        user = await this.createUser('default_user', 'default@example.com');
        userId = user.id;
      }
      
      const result = await pool.query(
        'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *',
        [userId, title]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating conversation:', error);
      console.error('Error details:', error.message);
      console.error('Error code:', error.code);
      throw error;
    }
  }

  async getConversations(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  async getConversation(conversationId) {
    try {
      const result = await pool.query(
        'SELECT * FROM conversations WHERE id = $1',
        [conversationId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  async saveMessage(conversationId, role, content, messageType = 'text', filePath = null) {
    try {
      const result = await pool.query(
        'INSERT INTO messages (conversation_id, role, content, message_type, file_path) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [conversationId, role, content, messageType, filePath]
      );

      // Update conversation timestamp
      await pool.query(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [conversationId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  async getMessages(conversationId) {
    try {
      const result = await pool.query(
        'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [conversationId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  async getConversationHistory(conversationId) {
    try {
      const messages = await this.getMessages(conversationId);
      return messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw error;
    }
  }

  async processTextMessage(userId, conversationId, message) {
    try {
      // Save user message
      await this.saveMessage(conversationId, 'user', message, 'text');

      // Get conversation history
      const history = await this.getConversationHistory(conversationId);

      // Get AI response
      const aiResponse = await openaiService.chatCompletion([
        { role: 'user', content: message }
      ], history);

      // Save AI response
      await this.saveMessage(conversationId, 'assistant', aiResponse, 'text');

      // Update conversation title if it's the first message
      if (history.length === 0) {
        const title = await openaiService.generateConversationTitle([
          { role: 'user', content: message },
          { role: 'assistant', content: aiResponse }
        ]);
        await pool.query(
          'UPDATE conversations SET title = $1 WHERE id = $2',
          [title, conversationId]
        );
      }

      return aiResponse;
    } catch (error) {
      console.error('Error processing text message:', error);
      console.error('Error details:', error.message);
      console.error('Error code:', error.code);
      throw error;
    }
  }

  async processVoiceMessage(userId, conversationId, audioBuffer, filePath) {
    try {
      // Transcribe audio
      const transcription = await openaiService.transcribeAudio(audioBuffer);

      // Save transcribed message
      await this.saveMessage(conversationId, 'user', transcription, 'voice', filePath);

      // Get conversation history
      const history = await this.getConversationHistory(conversationId);

      // Get AI response
      const aiResponse = await openaiService.chatCompletion([
        { role: 'user', content: transcription }
      ], history);

      // Save AI response
      await this.saveMessage(conversationId, 'assistant', aiResponse, 'text');

      return {
        transcription,
        response: aiResponse
      };
    } catch (error) {
      console.error('Error processing voice message:', error);
      throw error;
    }
  }

  async processImageMessage(userId, conversationId, imageBuffer, prompt, filePath) {
    try {
      // Analyze image
      const analysis = await openaiService.analyzeImage(imageBuffer, prompt);

      // Save image analysis as user message
      const userMessage = prompt || 'Please analyze this image';
      await this.saveMessage(conversationId, 'user', userMessage, 'image', filePath);

      // Get conversation history
      const history = await this.getConversationHistory(conversationId);

      // Get AI response
      const aiResponse = await openaiService.chatCompletion([
        { role: 'user', content: `Image analysis: ${analysis}` }
      ], history);

      // Save AI response
      await this.saveMessage(conversationId, 'assistant', aiResponse, 'text');

      return {
        analysis,
        response: aiResponse
      };
    } catch (error) {
      console.error('Error processing image message:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId) {
    try {
      await pool.query('DELETE FROM conversations WHERE id = $1', [conversationId]);
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
}

module.exports = new ChatService(); 