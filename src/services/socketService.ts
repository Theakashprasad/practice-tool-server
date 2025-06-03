import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Message, ChatRoom } from '../models/messageModel';
import { User } from '../models/userModel';
import { client } from '../config/db';

export class SocketService {
    private io: Server;
    private connectedUsers: Map<number, string> = new Map(); // userId -> socketId

    constructor(server: HttpServer, clientUrl: string) {
        this.io = new Server(server, {
            cors: {
                origin: clientUrl,
                methods: ['GET', 'POST'],
                credentials: true,
                allowedHeaders: ['Content-Type', 'Authorization']
            }
        });

        this.setupSocketHandlers();
    }

    private async saveMessage(message: Message): Promise<void> {
        try {
            // First ensure the chat room exists
            await client.query(
                'INSERT INTO chat_rooms (id, name, is_private) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
                [message.room_id, message.room_id, false]
            );

            // Then save the message
            await client.query(
                'INSERT INTO messages (sender_id, room_id, content) VALUES ($1, $2, $3) RETURNING id, created_at',
                [message.sender_id, message.room_id, message.content]
            );
        } catch (error) {
            console.error('Error saving message:', error);
            throw error;
        }
    }

    private async getRoomMessages(roomId: string): Promise<Message[]> {
        try {
            const result = await client.query(
                `SELECT m.*, u.email, u.first_name, u.last_name, u.level 
                FROM messages m 
                JOIN users u ON m.sender_id = u.id 
                WHERE m.room_id = $1 
                ORDER BY m.created_at ASC`,
                [roomId]
            );

            return result.rows.map(row => ({
                id: row.id,
                sender_id: row.sender_id,
                content: row.content,
                room_id: row.room_id,
                created_at: row.created_at,
                updated_at: row.updated_at,
                sender: {
                    id: row.sender_id,
                    email: row.email,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    level: row.level || 'staff',
                    active: true,
                    created_at: row.created_at,
                    updated_at: row.updated_at
                }
            }));
        } catch (error) {
            console.error('Error fetching room messages:', error);
            throw error;
        }
    }

    private setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            // Handle user authentication
            socket.on('authenticate', (user: User) => {
                this.connectedUsers.set(user.id, socket.id);
                console.log(`User ${user.id} authenticated`);
            });

            // Handle joining a chat room
            socket.on('join_room', async (roomId: string) => {
                socket.join(roomId);
                console.log(`User joined room: ${roomId}`);
                
                // Send room history to the user
                try {
                    const messages = await this.getRoomMessages(roomId);
                    socket.emit('room_history', messages);
                } catch (error) {
                    console.error('Error sending room history:', error);
                }
            });

            // Handle leaving a chat room
            socket.on('leave_room', (roomId: string) => {
                socket.leave(roomId);
                console.log(`User left room: ${roomId}`);
            });

            // Handle new messages
            socket.on('send_message', async (message: Message) => {
                if (message.room_id) {
                    try {
                        await this.saveMessage(message);
                        this.io.to(message.room_id).emit('new_message', message);
                    } catch (error) {
                        console.error('Error handling new message:', error);
                        socket.emit('error', { message: 'Failed to save message' });
                    }
                }
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                const userId = Array.from(this.connectedUsers.entries())
                    .find(([_, socketId]) => socketId === socket.id)?.[0];
                
                if (userId) {
                    this.connectedUsers.delete(userId);
                    console.log(`User ${userId} disconnected`);
                }
            });
        });
    }

    // Method to emit events to specific users
    public emitToUser(userId: number, event: string, data: any) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
        }
    }

    // Method to emit events to all users in a room
    public emitToRoom(roomId: string, event: string, data: any) {
        this.io.to(roomId).emit(event, data);
    }
} 