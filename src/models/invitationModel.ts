export interface Invitation {
    id?: number;
    email: string;
    token: string;
    level?: 'admin' | 'staff' | 'client';
    expires_at: Date;
    status?: string;
    created_at?: Date;
    updated_at?: Date;
}
