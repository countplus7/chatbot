const chatService = require('./services/chat-service');
const openaiService = require('./services/openai-service');

async function testAIResponse() {
  try {
    console.log('Testing AI respond feature...');
    
    // Test OpenAI service directly
    console.log('Testing OpenAI chat completion...');
    const response = await openaiService.chatCompletion([
      { role: 'user', content: 'Hello, how are you?' }
    ]);
    
    console.log('AI Response:', response);
    console.log('AI respond feature is working!');
    
  } catch (error) {
    console.error('Error testing AI respond feature:', error);
  } finally {
    process.exit(0);
  }
}

testAIResponse(); 