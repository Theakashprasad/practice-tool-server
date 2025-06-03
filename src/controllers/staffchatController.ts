import { Request, Response } from 'express';
import { client } from '../config/db';


export const getChatRooms = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await client.query(
            `SELECT cr.*, 
            COUNT(DISTINCT m.id) as message_count,
            COUNT(DISTINCT m.sender_id) as participant_count
            FROM chat_rooms cr
            LEFT JOIN messages m ON cr.id = m.room_id
            GROUP BY cr.id
            ORDER BY cr.updated_at DESC`
        );

        const rooms = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            is_private: row.is_private,
            created_at: row.created_at,
            updated_at: row.updated_at,
            message_count: parseInt(row.message_count),
            participant_count: parseInt(row.participant_count)
        }));

        res.json(rooms);
    } catch (error) {
        console.error('Error fetching chat rooms:', error);
        res.status(500).json({ error: 'Failed to fetch chat rooms' });
    }
};

export const getRoomMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;

        const result = await client.query(
            `SELECT m.*, u.email, u.first_name, u.last_name 
            FROM messages m 
            JOIN users u ON m.sender_id = u.id 
            WHERE m.room_id = $1 
            ORDER BY m.created_at ASC`,
            [roomId]
        );

        const messages = result.rows.map(row => ({
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
                last_name: row.last_name
            }
        }));

        res.json(messages);
    } catch (error) {
        console.error('Error fetching room messages:', error);
        res.status(500).json({ error: 'Failed to fetch room messages' });
    }
};

