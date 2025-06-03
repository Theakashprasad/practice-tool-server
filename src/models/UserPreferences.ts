export enum ChatRetentionPeriod {
    ONE_DAY = '1_day',
    ONE_WEEK = '1_week',
    ONE_MONTH = '1_month'
}

export interface UserPreferences {
    userId: string;
    chatRetentionPeriod: ChatRetentionPeriod;
}

export const DEFAULT_PREFERENCES: Omit<UserPreferences, 'userId'> = {
    chatRetentionPeriod: ChatRetentionPeriod.ONE_MONTH
}; 