class ChatbotApp {
    constructor() {
        this.currentConversationId = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        
        this.init();
    }

    init() {
        this.checkServerHealth();
        this.loadConversations();
        this.bindEvents();
        this.autoResizeTextarea();
    }



    async checkServerHealth() {
        try {
            const response = await fetch('/health');
            if (!response.ok) {
                console.error('Server health check failed');
                alert('Server is not responding. Please check if the server is running.');
            } else {
                console.log('Server health check passed');
            }
        } catch (error) {
            console.error('Server health check error:', error);
            alert('Cannot connect to server. Please check if the server is running on port 8000.');
        }
    }

    bindEvents() {
        // New chat button
        document.getElementById('new-chat-btn').addEventListener('click', () => {
            this.createNewConversation();
        });

        // Send message button
        document.getElementById('send-btn').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key in textarea
        document.getElementById('message-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Voice button
        document.getElementById('voice-btn').addEventListener('click', () => {
            this.toggleVoiceRecording();
        });

        // Image button
        document.getElementById('image-btn').addEventListener('click', () => {
            this.openImageModal();
        });

        // Delete chat button
        document.getElementById('delete-chat-btn').addEventListener('click', () => {
            this.deleteCurrentConversation();
        });

        // Image modal events
        document.getElementById('close-image-modal').addEventListener('click', () => {
            this.closeImageModal();
        });

        document.getElementById('image-preview').addEventListener('click', () => {
            document.getElementById('image-input').click();
        });

        document.getElementById('image-input').addEventListener('change', (e) => {
            this.handleImageSelect(e);
        });

        document.getElementById('analyze-image-btn').addEventListener('click', () => {
            this.analyzeImage();
        });

        // Modal backdrop click
        document.getElementById('image-modal').addEventListener('click', (e) => {
            if (e.target.id === 'image-modal') {
                this.closeImageModal();
            }
        });
    }

    autoResizeTextarea() {
        const textarea = document.getElementById('message-input');
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        });
    }

    async loadConversations() {
        try {
            const response = await fetch('/api/chat/conversations');
            const data = await response.json();
            
            if (response.ok) {
                this.renderConversations(data.conversations);
            } else {
                console.error('Failed to load conversations:', data.error);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }

    renderConversations(conversations) {
        const container = document.getElementById('conversations-list');
        container.innerHTML = '';

        conversations.forEach(conversation => {
            const item = document.createElement('div');
            item.className = 'conversation-item';
            item.dataset.id = conversation.id;
            
            item.innerHTML = `
                <h4>${conversation.title}</h4>
                <p>${new Date(conversation.updated_at).toLocaleDateString()}</p>
            `;

            item.addEventListener('click', () => {
                this.loadConversation(conversation.id);
            });

            container.appendChild(item);
        });
    }

    async createNewConversation() {
        try {
            const response = await fetch('/api/chat/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: 'New Conversation' })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.currentConversationId = data.conversation.id;
                this.updateConversationTitle(data.conversation.title);
                this.clearMessages();
                this.loadConversations();
                this.loadConversation(data.conversation.id);
            } else {
                console.error('Failed to create conversation:', data.error);
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
            console.error('Error details:', error.message);
            alert('Failed to create conversation. Please try again.');
        }
    }

    async loadConversation(conversationId) {
        try {
            const response = await fetch(`/api/chat/conversations/${conversationId}`);
            const data = await response.json();
            
            if (response.ok) {
                this.currentConversationId = conversationId;
                this.updateConversationTitle(data.conversation.title);
                this.renderMessages(data.messages);
                this.updateActiveConversation(conversationId);
                

            } else {
                console.error('Failed to load conversation:', data.error);
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    }

    updateActiveConversation(conversationId) {
        // Remove active class from all conversations
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current conversation
        const activeItem = document.querySelector(`[data-id="${conversationId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    updateConversationTitle(title) {
        document.getElementById('current-conversation-title').textContent = title;
    }

    clearMessages() {
        const container = document.getElementById('messages-container');
        container.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <h2>Welcome to AI Chatbot</h2>
                <p>I can help you with text conversations, voice notes, and image analysis.</p>
                <div class="feature-cards">
                    <div class="feature-card">
                        <i class="fas fa-comments"></i>
                        <h4>Text Chat</h4>
                        <p>Ask me anything</p>
                    </div>
                    <div class="feature-card">
                        <i class="fas fa-microphone"></i>
                        <h4>Voice Notes</h4>
                        <p>Speak to me</p>
                    </div>
                    <div class="feature-card">
                        <i class="fas fa-image"></i>
                        <h4>Image Analysis</h4>
                        <p>Upload images for analysis</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderMessages(messages) {
        const container = document.getElementById('messages-container');
        container.innerHTML = '';

        messages.forEach(message => {
            this.addMessage(message.role, message.content, message.message_type, message.created_at);
        });

        this.scrollToBottom();
    }

    addMessage(role, content, messageType = 'text', timestamp = null) {
        const container = document.getElementById('messages-container');
        
        // Remove welcome message if it exists
        const welcomeMessage = container.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatar = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        const time = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
        
        let contentHtml = content;
        if (messageType === 'voice') {
            contentHtml = `<i class="fas fa-microphone"></i> ${content}`;
        } else if (messageType === 'image') {
            contentHtml = `<i class="fas fa-image"></i> ${content}`;
        }

        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${avatar}
            </div>
            <div class="message-content">
                ${contentHtml}
                <div class="message-time">${time}</div>
            </div>
        `;

        container.appendChild(messageDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const container = document.getElementById('messages-container');
        container.scrollTop = container.scrollHeight;
    }

    async sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();

        if (!message) {
            return;
        }

        // If no conversation exists, create one first
        if (!this.currentConversationId) {
            await this.createNewConversation();
        }

        // Clear input
        input.value = '';
        input.style.height = 'auto';

        // Add user message to UI
        this.addMessage('user', message);
        
        console.log('Sending message:', message, 'to conversation:', this.currentConversationId);

        // Show loading
        this.showLoading();

        try {
            const response = await fetch(`/api/chat/conversations/${this.currentConversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Add AI response to UI
                this.addMessage('assistant', data.response);
                
                // Reload conversations to update titles
                this.loadConversations();
            } else {
                this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
                console.error('Failed to send message:', data.error);
            }
        } catch (error) {
            this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
            console.error('Error sending message:', error);
            console.error('Error details:', error.message);
        } finally {
            this.hideLoading();
        }
    }

    async toggleVoiceRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                this.processAudioRecording();
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            this.updateVoiceButton();
            this.showRecordingIndicator();
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Unable to access microphone. Please check permissions.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            this.updateVoiceButton();
            this.hideRecordingIndicator();
        }
    }

    updateVoiceButton() {
        const voiceBtn = document.getElementById('voice-btn');
        const icon = voiceBtn.querySelector('i');
        
        if (this.isRecording) {
            icon.className = 'fas fa-stop';
            voiceBtn.style.background = '#c53030';
        } else {
            icon.className = 'fas fa-microphone';
            voiceBtn.style.background = '';
        }
    }

    showRecordingIndicator() {
        const container = document.getElementById('messages-container');
        const indicator = document.createElement('div');
        indicator.className = 'voice-recording';
        indicator.id = 'recording-indicator';
        indicator.innerHTML = `
            <i class="fas fa-microphone"></i>
            <span class="recording-text">Recording... Click to stop</span>
            <button class="stop-recording-btn" onclick="app.stopRecording()">Stop</button>
        `;
        container.appendChild(indicator);
        this.scrollToBottom();
    }

    hideRecordingIndicator() {
        const indicator = document.getElementById('recording-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    async processAudioRecording() {
        if (!this.currentConversationId) {
            return;
        }

        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        this.showLoading();

        try {
            const response = await fetch(`/api/chat/conversations/${this.currentConversationId}/voice`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (response.ok) {
                // Add transcribed message
                this.addMessage('user', data.transcription, 'voice');
                // Add AI response
                this.addMessage('assistant', data.response);
                
                // Reload conversations
                this.loadConversations();
            } else {
                this.addMessage('assistant', 'Sorry, I could not process your voice message. Please try again.');
                console.error('Failed to process voice message:', data.error);
            }
        } catch (error) {
            this.addMessage('assistant', 'Sorry, I could not process your voice message. Please try again.');
            console.error('Error processing voice message:', error);
        } finally {
            this.hideLoading();
        }
    }

    openImageModal() {
        document.getElementById('image-modal').classList.add('show');
    }

    closeImageModal() {
        document.getElementById('image-modal').classList.remove('show');
        // Reset modal
        document.getElementById('image-preview').innerHTML = `
            <i class="fas fa-image"></i>
            <p>Click to select an image</p>
        `;
        document.getElementById('image-prompt').value = '';
    }

    handleImageSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('image-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }

    async analyzeImage() {
        const fileInput = document.getElementById('image-input');
        const prompt = document.getElementById('image-prompt').value;
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select an image first.');
            return;
        }

        if (!this.currentConversationId) {
            alert('Please start a conversation first.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        if (prompt) {
            formData.append('prompt', prompt);
        }

        this.closeImageModal();
        this.showLoading();

        try {
            const response = await fetch(`/api/chat/conversations/${this.currentConversationId}/image`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (response.ok) {
                // Add image analysis request
                this.addMessage('user', prompt || 'Please analyze this image', 'image');
                // Add AI response
                this.addMessage('assistant', data.response);
                
                // Reload conversations
                this.loadConversations();
            } else {
                this.addMessage('assistant', 'Sorry, I could not analyze the image. Please try again.');
                console.error('Failed to analyze image:', data.error);
            }
        } catch (error) {
            this.addMessage('assistant', 'Sorry, I could not analyze the image. Please try again.');
            console.error('Error analyzing image:', error);
        } finally {
            this.hideLoading();
        }
    }

    async deleteCurrentConversation() {
        if (!this.currentConversationId) {
            return;
        }

        if (!confirm('Are you sure you want to delete this conversation?')) {
            return;
        }

        try {
            const response = await fetch(`/api/chat/conversations/${this.currentConversationId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.currentConversationId = null;
                this.clearMessages();
                this.updateConversationTitle('New Conversation');
                this.loadConversations();
            } else {
                const data = await response.json();
                console.error('Failed to delete conversation:', data.error);
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    }

    showLoading() {
        document.getElementById('loading-overlay').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('show');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChatbotApp();
}); 