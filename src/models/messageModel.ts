import { User } from './userModel';

export interface Message {
    id: number;
    sender_id: number;
    content: string;
    room_id?: string;
    created_at: Date;
    updated_at: Date;
    sender?: User;
}

export interface ChatRoom {
    id: string;
    name?: string;
    is_private: boolean;
    created_at: Date;
    updated_at: Date;
    participants?: User[];
} 