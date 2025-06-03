import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { client } from '../config/db';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';

const ALLOWED_LEVELS = ['admin', 'staff', 'client'];

export const registerUser = async (req: Request, res: Response) => {
  const { first_name, last_name, email, password_hash, level, token } = req.body;

  if (!ALLOWED_LEVELS.includes(level)) {
     res.status(400).json({ error: 'Invalid user level' });
     return 
  }

  try {
    // Hash the password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password_hash, saltRounds);

    // Start a transaction
    await client.query('BEGIN');

    // Create the user
    const user = await client.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, level, active, reset_required)
       VALUES ($1, $2, $3, $4, $5, true, true) RETURNING *`,
      [first_name, last_name, email, hashedPassword, level]
    );

    // If token exists, update the invitation status
    if (token) {
      await client.query(
        'UPDATE invitations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE token = $2',
        ['completed', token]
      );
    }

    // Commit the transaction
    await client.query('COMMIT');

    res.status(201).json(user.rows[0]);
  } catch (err) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Registration error:', err);
    res.status(500).json({ error: 'User registration failed', details: err });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password_hash, mfaToken, rememberDevice } = req.body;

  try {
    // Get user from database
    const userResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.active) {
      res.status(403).json({ error: 'Your account is inactive. Please contact the administrator.' });
      return;
    }
    
    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password_hash, user.password_hash);
    
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid Credentials' });
      return;
    }

    // If MFA token is provided, verify it
    if (mfaToken) {
      if (!user.mfa_token) {
        // Generate new MFA secret if not set up
        const secret = speakeasy.generateSecret({
          length: 20,
          name: `Practice Tool (${user.email})`
        });

        // Verify the provided token with the new secret
        const verified = speakeasy.totp.verify({
          secret: secret.base32,
          encoding: 'base32',
          token: mfaToken
        });

        if (!verified) {
          res.status(401).json({ error: 'Invalid MFA token' });
          return;
        }

        // Update user with new MFA secret
        await client.query(
          'UPDATE users SET mfa_token = $1 WHERE id = $2',
          [secret.base32, user.id]
        );

        // Generate JWT token after successful MFA setup
        const token = jwt.sign(
          { 
            userId: user.id,
            email: user.email,
            level: user.level
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        res.json({ 
          token,
          user: {
            id: user.id,
            email: user.email,
            level: user.level,
            first_name: user.first_name,
            last_name: user.last_name
          }
        });
        return;
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfa_token,
        encoding: 'base32',
        token: mfaToken,
        window: 1 // Allow a 30-second window for token verification
      });

      if (!verified) {
        res.status(401).json({ error: 'Invalid MFA token' });
        return;
      }

      // If remember device is checked, update mfa_remember_until
      if (rememberDevice) {
        const rememberUntil = new Date();
        rememberUntil.setDate(rememberUntil.getDate() + 30); // 30 days from now
        await client.query(
          'UPDATE users SET mfa_remember_until = $1 WHERE id = $2',
          [rememberUntil, user.id]
        );
      }

      // Generate JWT token after successful MFA verification
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          level: user.level
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({ 
        token,
        user: {
          id: user.id,
          email: user.email,
          level: user.level,
          first_name: user.first_name,
          last_name: user.last_name
        }
      });
      return;
    } else if (user.mfa_token && !user.mfa_remember_until) {
      // If MFA is required but no token provided, show setup option
      res.json({
        mfaRequired: true,
        secret: user.mfa_token,
        otpauth_url: speakeasy.otpauthURL({
          secret: user.mfa_token,
          label: `Practice Tool (${user.email})`,
          issuer: 'Practice Tool'
        })
      });
      return;
    }

    // If reset_required is true, generate new MFA secret
    if (user.reset_required) {
      const secret = speakeasy.generateSecret({
        length: 20,
        name: `Practice Tool (${user.email})`
      });

      // Update user with new MFA secret
      await client.query(
        'UPDATE users SET mfa_token = $1, reset_required = false WHERE id = $2',
        [secret.base32, user.id]
      );

      res.json({
        reset_required: true,
        secret: secret.base32,
        otpauth_url: secret.otpauth_url
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        level: user.level
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        level: user.level,
        first_name: user.first_name,
        last_name: user.last_name
      },
      reset_required: user.reset_required
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err });
  }
};
