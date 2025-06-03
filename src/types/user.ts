export interface User {
    id?: number;
    first_name: string;
    last_name: string;
    email: string;
    level: string;
    password_hash: string;
    reset_required: boolean;
    mfa_token: string | null;
    mfa_remember_until: Date | null;
    google_id: string | null;
    active: boolean;
    created_at: Date;
    updated_at: Date;
} 