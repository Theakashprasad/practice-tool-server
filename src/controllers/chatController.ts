import { Request, Response } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { ChatRetentionPeriod } from '../models/UserPreferences';
import { Message, ChatSession, isSessionExpired } from '../models/ChatSession';
import { ChatCleanupService } from '../services/chatCleanupService';
import { client } from '../config/db';

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

// We'll still keep a whitelist of models we want to expose
const ALLOWED_MODEL_PREFIXES = ['gpt-3.5', 'gpt-4'];
const DEFAULT_MODEL = 'select for me';

// Complexity indicators that might suggest using GPT-4
const COMPLEXITY_INDICATORS = [
    'analyze',
    'complex',
    'optimize',
    'debug',
    'architecture',
    'security',
    'performance',
    'refactor',
    'design pattern',
    'algorithm'
];

// In-memory storage
export const chatSessions = new Map<string, ChatSession>();
export const userPreferences = new Map<string, { userId: string; chatRetentionPeriod: ChatRetentionPeriod }>();

// Initialize cleanup service
const cleanupService = new ChatCleanupService(chatSessions);

// Default preferences
const DEFAULT_PREFERENCES = {
    chatRetentionPeriod: ChatRetentionPeriod.ONE_MONTH
};

function selectModelBasedOnPrompt(prompt: string): string {
    // Default to GPT-3.5-turbo for cost efficiency
    let selectedModel = 'gpt-3.5-turbo';
    
    // Convert to lowercase for case-insensitive matching
    const lowerPrompt = prompt.toLowerCase();
    
    // Check for complexity indicators
    const hasComplexityIndicators = COMPLEXITY_INDICATORS.some(indicator => 
        lowerPrompt.includes(indicator.toLowerCase())
    );
    
    // Check prompt length as another complexity factor
    const isLongPrompt = prompt.length > 500;
    
    // Use GPT-4 if multiple complexity indicators are present
    if (hasComplexityIndicators && isLongPrompt) {
        selectedModel = 'gpt-4';
    }
    
    return selectedModel;
}

export const getAvailableModels = async (_req: Request, res: Response): Promise<void> => {
    try {
        const models = await openai.models.list();
        
        // Filter models to only include GPT models we want to expose
        const filteredModels = models.data
            .filter(model => ALLOWED_MODEL_PREFIXES.some(prefix => model.id.startsWith(prefix)))
            .map(model => ({
                id: model.id,
                name: formatModelName(model.id)
            }))
            .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));

        // Add the "select for me" option at the beginning
        filteredModels.unshift({
            id: DEFAULT_MODEL,
            name: 'Select For Me (Auto)'
        });

        res.json(filteredModels);
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Failed to fetch available models' });
    }
};

// Helper function to format model names for display
function formatModelName(modelId: string): string {
    // Convert "gpt-3.5-turbo" to "GPT-3.5 Turbo"
    return modelId
        .split('-')
        .map((part, index) => {
            if (index === 0) return part.toUpperCase();
            if (part.includes('.')) return part; // Keep version numbers as is
            return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join(' ');
}

function generateSessionName(firstMessage: string): string {
    // Take first 50 characters of the message and clean it up
    const name = firstMessage.slice(0, 50).trim();
    return name.length > 0 ? name : 'New Chat';
}

export const chat = async (req: Request, res: Response): Promise<void> => {
    try {
        let { messages, model = DEFAULT_MODEL, userId, sessionId, sessionName } = req.body;

        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }

        // Clean up expired sessions
        for (const [id, session] of chatSessions.entries()) {
            if (isSessionExpired(session)) {
                chatSessions.delete(id);
            }
        }

        // // Get or create session
        // let session: ChatSession | undefined = sessionId ? chatSessions.get(sessionId) : undefined;
        
        // if (session && isSessionExpired(session)) {
        //     chatSessions.delete(sessionId);
        //     session = undefined;
        //     sessionId = undefined;
        // }

        // const userPrefs = userPreferences.get(userId) || { ...DEFAULT_PREFERENCES, userId };

        // if (!session) {
        //     sessionId = uuidv4();
        //     session = {
        //         id: sessionId,
        //         userId,
        //         sessionName: sessionName || generateSessionName(messages[0].content),
        //         messages: [],
        //         createdAt: new Date(),
        //         updatedAt: new Date(),
        //         retentionPeriod: userPrefs.chatRetentionPeriod
        //     };
        //     chatSessions.set(sessionId, session);
        // }

        const userPrefs = userPreferences.get(userId) || { ...DEFAULT_PREFERENCES, userId };

        // Get or create session
        let session: ChatSession | undefined;
        if (sessionId) {
            const result = await client.query(
                'SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2 AND expires_at > CURRENT_TIMESTAMP',
                [sessionId, userId]
            );
          
            
            if (result.rows.length > 0) {
                session = {
                    id: result.rows[0].id,
                    userId: result.rows[0].user_id.toString(),
                    sessionName: result.rows[0].session_name,
                    messages: result.rows[0].messages,
                    createdAt: result.rows[0].created_at,
                    updatedAt: result.rows[0].updated_at,
                    retentionPeriod: result.rows[0].retention_period as ChatRetentionPeriod
                };
            }
        }

        if (!session) {
            sessionId = uuidv4();
            const expiresAt = new Date(Date.now() + getRetentionPeriodInMs(userPrefs.chatRetentionPeriod));
            session = {
                id: sessionId,
                userId,
                sessionName: sessionName || generateSessionName(messages[0].content),
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                retentionPeriod: userPrefs.chatRetentionPeriod
            };

            await client.query(
                'INSERT INTO chat_sessions (id, user_id, session_name, messages, retention_period, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
                [sessionId, userId, session.sessionName, JSON.stringify(session.messages), session.retentionPeriod, expiresAt]
            );
        }



        // If model is "select for me", analyze the first message and choose appropriate model
        if (model === DEFAULT_MODEL && messages.length > 0) {
            const firstMessage = messages[0];
            model = selectModelBasedOnPrompt(firstMessage.content);
            console.log(`Auto-selected model: ${model} based on prompt analysis`);
        }

        // Validate model
        if (!ALLOWED_MODEL_PREFIXES.some(prefix => model.startsWith(prefix))) {
            res.status(400).json({ 
                error: 'Invalid model specified. Please use the models from the available models list.' 
            });
            return;
        }

        // Format messages for OpenAI API
        const formattedMessages = messages.map((msg: Message) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date()
        }));

        formattedMessages.unshift({
            role: 'system',
            content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.',
            timestamp: new Date()
        });

        const completion = await openai.chat.completions.create({
            model: model,
            messages: formattedMessages.map(({ role, content }: { role: 'user' | 'assistant' | 'system'; content: string }) => ({ role, content })),
            temperature: 0.7,
            max_tokens: 1000,
        });

        const response = completion.choices[0].message?.content || 'Sorry, I could not process your request.';

        // Update session
        session.messages.push(...formattedMessages);
        session.messages.push({
            role: 'assistant',
            content: response,
            timestamp: new Date()
        });
        session.updatedAt = new Date();

        // Update the session in the database
        await client.query(
            'UPDATE chat_sessions SET messages = $1, updated_at = $2 WHERE id = $3',
            [JSON.stringify(session.messages), session.updatedAt, sessionId]
        );

        res.json({ 
            response,
            model_used: model,
            sessionId,
            sessionName: session.sessionName,
            expiresAt: new Date(session.updatedAt.getTime() + getRetentionPeriodInMs(session.retentionPeriod))
        });
    } catch (error) {
        console.error('Error in chat API:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};

function getRetentionPeriodInMs(period: ChatRetentionPeriod): number {
    switch (period) {
        case ChatRetentionPeriod.ONE_DAY:
            return 24 * 60 * 60 * 1000;
        case ChatRetentionPeriod.ONE_WEEK:
            return 7 * 24 * 60 * 60 * 1000;
        case ChatRetentionPeriod.ONE_MONTH:
            return 30 * 24 * 60 * 60 * 1000;
        default:
            return 30 * 24 * 60 * 60 * 1000;
    }
}

export const getUserPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        
        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }

        const preferences = userPreferences.get(userId) || { ...DEFAULT_PREFERENCES, userId };
        res.json(preferences);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
};

export const updateUserPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, chatRetentionPeriod } = req.body;
        
        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }

        const currentPreferences = userPreferences.get(userId) || { ...DEFAULT_PREFERENCES, userId };
        const updatedPreferences = { 
            ...currentPreferences, 
            chatRetentionPeriod: chatRetentionPeriod || currentPreferences.chatRetentionPeriod 
        };
        
        userPreferences.set(userId, updatedPreferences);
        res.json(updatedPreferences);
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
};

export const cleanupExpiredSessions = async (_req: Request, res: Response): Promise<void> => {
    try {
        cleanupService.cleanupExpiredSessions();
        res.json({ message: 'Cleanup completed successfully' });
    } catch (error) {
        console.error('Error during session cleanup:', error);
        res.status(500).json({ error: 'Failed to cleanup sessions' });
    }
};

export const getUserChatHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;   

        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }

        const result = await client.query(
            'SELECT id, session_name, created_at, updated_at, messages FROM chat_sessions WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP ORDER BY updated_at DESC',
            [userId]
        );

        

        const userSessions = result.rows.map(row => ({
            id: row.id,
            sessionName: row.session_name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            lastMessage: row.messages[row.messages.length - 1]?.content || '',
            messageCount: row.messages.length
        }));

        res.json(userSessions);
        
    }
    catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
}

export const getChatSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const sessionId = req.params.sessionId;
        if (!sessionId) {
            res.status(400).json({ error: 'sessionId is required' });
            return;
        }

        const result = await client.query(
            'SELECT * FROM chat_sessions WHERE id = $1 AND expires_at > CURRENT_TIMESTAMP',
            [sessionId]
        );
        
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Session not found or expired' });
            return;
        }

        const session = result.rows[0];
        res.json({
            id: session.id,
            sessionName: session.session_name,
            messages: session.messages,
            createdAt: session.created_at,
            updatedAt: session.updated_at
        });
    }
    catch (error) {
        console.error('Error fetching chat session:', error);
        res.status(500).json({ error: 'Failed to fetch chat session' });
    }
}

