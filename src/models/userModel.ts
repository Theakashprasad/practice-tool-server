export type UserLevel = 'admin' | 'staff' | 'client';

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    level: UserLevel;
    password_hash?: string;
    reset_required?: boolean;
    mfa_token?: string;
    mfa_remember_until?: Date;
    google_id?: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
} 