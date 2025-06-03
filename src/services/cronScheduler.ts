import cron from 'node-cron';
import { ChatCleanupService } from './chatCleanupService';

export class CronScheduler {
    private cleanupService: ChatCleanupService;

    constructor(cleanupService: ChatCleanupService) {
        this.cleanupService = cleanupService;
    }

    public startCleanupSchedule(): void {
        // Run every day at midnight
        cron.schedule('0 0 * * *', () => {
            console.log('Running scheduled cleanup of expired chat sessions...');
            this.cleanupService.cleanupExpiredSessions();
        });

        // Also run every hour to clean up sessions that expired during the day
        cron.schedule('0 * * * *', () => {
            console.log('Running hourly cleanup of expired chat sessions...');
            this.cleanupService.cleanupExpiredSessions();
        });
    }
} 