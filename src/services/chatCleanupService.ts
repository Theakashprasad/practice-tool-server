import { ChatSession, isSessionExpired } from '../models/ChatSession';

export class ChatCleanupService {
    private chatSessions: Map<string, ChatSession>;

    constructor(chatSessions: Map<string, ChatSession>) {
        this.chatSessions = chatSessions;
    }

    public cleanupExpiredSessions(): void {
        console.log('Starting cleanup of expired chat sessions...');
        let cleanupCount = 0;

        for (const [sessionId, session] of this.chatSessions.entries()) {
            if (isSessionExpired(session)) {
                this.chatSessions.delete(sessionId);
                cleanupCount++;
            }
        }

        console.log(`Cleanup completed. Removed ${cleanupCount} expired sessions.`);
    }
} 