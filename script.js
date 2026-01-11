// Dialogflow API call function
async function getDialogflowResponse(userMessage, sessionId = 'web-session') {
    try {
        const response = await fetch('/.netlify/functions/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                sessionId: sessionId
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.reply;
        
    } catch (error) {
        console.error('Dialogflow API Error:', error);
        throw error; // Fallback এর জন্য throw করবে
    }
}

// Updated sendMessage function
async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Clear input
    userInput.value = '';
    
    // Add user message
    addMessage(message, true);
    
    // Show typing indicator
    showTyping();
    
    try {
        // Try Dialogflow API
        const aiResponse = await getDialogflowResponse(message);
        
        // Remove typing indicator
        hideTyping();
        
        // Add AI response
        addMessage(aiResponse, false);
        
    } catch (error) {
        // Remove typing indicator
        hideTyping();
        
        // Fallback to local response
        const localResponse = getLocalResponse(message) || getFallbackResponse();
        addMessage(localResponse, false);
    }
}