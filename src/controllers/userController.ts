import { Request, Response } from 'express';
import { client } from '../config/db';
import bcrypt from 'bcrypt';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await client.query('SELECT id, "first_name", "last_name", "email", "level", "reset_required", "active", "created_at", "updated_at" FROM users');
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving users', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    if (!id) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }
    
    const result = await client.query(
      'SELECT "first_name", "last_name", "email", "level", "reset_required", "active" as status, "created_at", "updated_at" FROM users WHERE id = $1', 
      [id]
    );
    const user = result.rows[0];
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ message: 'Error retrieving user', error: error instanceof Error ? error.message : String(error) });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { first_name, last_name, email, level, reset_required, active, password } = req.body;
  try {
    // Convert status to boolean if it's not already
    
    // Validate required fields
    if (!first_name || !last_name || !email || !level || !password) {
      res.status(400).json({ message: 'Missing required fields (first_name, last_name, email, level, and password are required)' });
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const result = await client.query(
      'INSERT INTO users ("first_name", "last_name", "email", "level", "reset_required", "active", "password_hash", "created_at", "updated_at") VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING "first_name", "last_name", "email", "level", "reset_required", "active" as status, "created_at", "updated_at"',
      [first_name, last_name, email, level, reset_required ?? false, active, password_hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating user',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { first_name, last_name, email, level, reset_required, active, password } = req.body;
  try {
    let query = 'UPDATE users SET "first_name" = COALESCE($1, "first_name"), "last_name" = COALESCE($2, "last_name"), "email" = COALESCE($3, "email"), "level" = COALESCE($4, "level"), "reset_required" = COALESCE($5, "reset_required"), "active" = COALESCE($6, "active")';
    let params = [first_name, last_name, email, level, reset_required, active];

    // If password is provided, hash it and add to update
    if (password) {
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      query += ', "password_hash" = $' + (params.length + 1);
      params.push(password_hash);
    }

    query += ', "updated_at" = CURRENT_TIMESTAMP WHERE id = $' + (params.length + 1) + ' RETURNING "first_name", "last_name", "email", "level", "reset_required", "active" as active, "created_at", "updated_at"';
    params.push(id);

    const result = await client.query(query, params);
    const updatedUser = result.rows[0];
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING "first_name", "last_name", "email", "level", "reset_required", "active" as status, "created_at", "updated_at"', [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(204).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};
