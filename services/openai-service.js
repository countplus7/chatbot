const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAIService {
  constructor() {
    this.model = 'gpt-4';
    this.visionModel = 'gpt-4-vision-preview';
  }

  async chatCompletion(messages, conversationHistory = []) {
    try {
      const allMessages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. You can help with text conversations, analyze images, and process voice transcriptions. Be concise, helpful, and engaging in your responses.'
        },
        ...conversationHistory,
        ...messages
      ];

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: allMessages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error in chat completion:', error);
      console.error('Error details:', error.message);
      console.error('Error code:', error.code);
      if (error.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      } else if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your account.');
      } else {
        throw new Error(`Failed to get AI response: ${error.message}`);
      }
    }
  }

  async transcribeAudio(audioBuffer) {
    try {
      const response = await openai.audio.transcriptions.create({
        file: audioBuffer,
        model: 'whisper-1',
        response_format: 'text',
      });

      return response;
    } catch (error) {
      console.error('Error in audio transcription:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async analyzeImage(imageBuffer, prompt = 'Please describe what you see in this image and answer any questions about it.') {
    try {
      const response = await openai.chat.completions.create({
        model: this.visionModel,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error in image analysis:', error);
      throw new Error('Failed to analyze image');
    }
  }

  async generateConversationTitle(messages) {
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'Generate a short, descriptive title (max 50 characters) for this conversation based on the first few messages.'
          },
          {
            role: 'user',
            content: `Generate a title for this conversation:\n${messages.slice(0, 3).map(m => `${m.role}: ${m.content}`).join('\n')}`
          }
        ],
        max_tokens: 50,
        temperature: 0.3,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating conversation title:', error);
      return 'New Conversation';
    }
  }
}

module.exports = new OpenAIService(); 