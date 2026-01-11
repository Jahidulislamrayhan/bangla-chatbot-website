// netlify/functions/chatbot.js
const { SessionsClient } = require('@google-cloud/dialogflow');

exports.handler = async (event, context) => {
    // শুধু POST request accept করবে
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { message, sessionId = 'web-user' } = JSON.parse(event.body);
        
        // Environment variables থেকে credentials
        const credentials = {
            type: 'service_account',
            project_id: process.env.DIALOGFLOW_PROJECT_ID,
            private_key_id: process.env.DIALOGFLOW_PRIVATE_KEY_ID,
            private_key: process.env.DIALOGFLOW_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
            client_id: 'YOUR_CLIENT_ID',
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.DIALOGFLOW_CLIENT_EMAIL)}`
        };

        // Dialogflow client তৈরি
        const sessionClient = new SessionsClient({
            credentials: credentials,
            projectId: process.env.DIALOGFLOW_PROJECT_ID
        });

        // Session path
        const sessionPath = sessionClient.projectAgentSessionPath(
            process.env.DIALOGFLOW_PROJECT_ID,
            sessionId
        );

        // Request তৈরি
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: message,
                    languageCode: 'bn'
                }
            }
        };

        // Dialogflow কে call
        const [response] = await sessionClient.detectIntent(request);
        
        // Response process
        const result = response.queryResult;
        const reply = result.fulfillmentText || "দুঃখিত, উত্তর দিতে পারছি না।";

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                reply: reply,
                confidence: result.intentDetectionConfidence,
                intent: result.intent.displayName
            })
        };

    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};