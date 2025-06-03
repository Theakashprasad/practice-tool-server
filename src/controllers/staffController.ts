import { Request, Response } from 'express';
import { client } from '../config/db';

export const getStaff = async (req: Request, res: Response) => {
  try {
    const result = await client.query('SELECT "first_name", "last_name", "email", "level", "reset_required", "active" as status, "created_at", "updated_at" FROM users');
    console.log("result",result);
    
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving staff' });
  }
};

export const getStaffById = async (req: Request, res: any) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      'SELECT "first_name", "last_name", "email", "level", "reset_required", "active" as status, "created_at", "updated_at" FROM users WHERE id = $1', 
      [id]
    );
    const staffMember = result.rows[0];
    if (!staffMember) return res.status(404).json({ message: 'Staff not found' });
    res.status(200).json(staffMember);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving staff member' });
  }
};

export const createStaff = async (req: Request, res: any) => {
  const { first_name, last_name, email, level, reset_required, status } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO users ("first_name", "last_name", "email", "level", "reset_required", "active", "created_at", "updated_at") VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING "first_name", "last_name", "email", "level", "reset_required", "active" as status, "created_at", "updated_at"',
      [first_name, last_name, email, level, reset_required, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating staff member' });
  }
};

export const updateStaff = async (req: Request, res: any) => {
  const { id } = req.params;
  const { first_name, last_name, email, level, reset_required, status } = req.body;
  try {
    const result = await client.query(
      'UPDATE users SET "first_name" = COALESCE($1, "first_name"), "last_name" = COALESCE($2, "last_name"), "email" = COALESCE($3, "email"), "level" = COALESCE($4, "level"), "reset_required" = COALESCE($5, "reset_required"), "active" = COALESCE($6, "active"), "updated_at" = CURRENT_TIMESTAMP WHERE id = $7 RETURNING "first_name", "last_name", "email", "level", "reset_required", "active" as status, "created_at", "updated_at"',
      [first_name, last_name, email, level, reset_required, status, id]
    );
    const updatedStaff = result.rows[0];
    if (!updatedStaff) return res.status(404).json({ message: 'Staff not found' });
    res.status(200).json(updatedStaff);
  } catch (error) {
    res.status(500).json({ message: 'Error updating staff member' });
  }
};

export const deleteStaff = async (req: Request, res:any) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING "first_name", "last_name", "email", "level", "reset_required", "active" as status, "created_at", "updated_at"', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Staff not found' });
    res.status(204).json({ message: 'Staff deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting staff member' });
  }
};
