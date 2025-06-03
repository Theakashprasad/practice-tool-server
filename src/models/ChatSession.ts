import { ChatRetentionPeriod } from './UserPreferences';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ChatSession {
    id: string;
    userId: string;
    sessionName: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    retentionPeriod: ChatRetentionPeriod;
}

export function isSessionExpired(session: ChatSession): boolean {
    const now = new Date();
    let expiryDate = new Date(session.updatedAt);
    
    switch (session.retentionPeriod) {
        case ChatRetentionPeriod.ONE_DAY:
            expiryDate.setDate(expiryDate.getDate() + 1);
            break; 
        case ChatRetentionPeriod.ONE_WEEK:
            expiryDate.setDate(expiryDate.getDate() + 7);
            break;
        case ChatRetentionPeriod.ONE_MONTH:
            expiryDate.setDate(expiryDate.getDate() + 30);
            break;
    }
    
    return now > expiryDate;
} 