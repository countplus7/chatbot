const express = require('express');
const router = express.Router();
const chatService = require('../services/chat-service');
const { uploadAudio, uploadImage, handleUploadError } = require('../middleware/upload');
const fs = require('fs-extra');
const path = require('path');

// Temporary user ID (in a real app, this would come from authentication)
const TEMP_USER_ID = 1;

// Get all conversations for a user
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await chatService.getConversations(TEMP_USER_ID);
    res.json({ conversations });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get a specific conversation with messages
router.get('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await chatService.getConversation(conversationId);
    const messages = await chatService.getMessages(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({ conversation, messages });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Create a new conversation
router.post('/conversations', async (req, res) => {
  try {
    const { title } = req.body;
    const conversation = await chatService.createConversation(TEMP_USER_ID, title);
    res.json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Delete a conversation
router.delete('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    await chatService.deleteConversation(conversationId);
    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Send a text message
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await chatService.processTextMessage(TEMP_USER_ID, conversationId, message);
    res.json({ response });
  } catch (error) {
    console.error('Error processing text message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Upload and process voice message
router.post('/conversations/:conversationId/voice', uploadAudio, handleUploadError, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }
    
    // Read the uploaded file
    const audioBuffer = await fs.readFile(req.file.path);
    
    // Process the voice message
    const result = await chatService.processVoiceMessage(
      TEMP_USER_ID, 
      conversationId, 
      audioBuffer, 
      req.file.path
    );
    
    res.json({
      transcription: result.transcription,
      response: result.response
    });
  } catch (error) {
    console.error('Error processing voice message:', error);
    res.status(500).json({ error: 'Failed to process voice message' });
  }
});

// Upload and process image
router.post('/conversations/:conversationId/image', uploadImage, handleUploadError, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { prompt } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    
    // Read the uploaded file
    const imageBuffer = await fs.readFile(req.file.path);
    
    // Process the image
    const result = await chatService.processImageMessage(
      TEMP_USER_ID,
      conversationId,
      imageBuffer,
      prompt,
      req.file.path
    );
    
    res.json({
      analysis: result.analysis,
      response: result.response
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

module.exports = router; 