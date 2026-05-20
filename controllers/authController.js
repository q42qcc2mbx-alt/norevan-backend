import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const SALT_ROUNDS = 12;

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Email or username is already taken',
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const { rows } = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [username, email, passwordHash],
    );

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      data: { userId: rows[0].id },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0] ?? null;

    const hash = user?.password_hash ?? '$2a$12$invalidhashfortimingneutrality00000000000000000000000000';
    const isMatch = await bcrypt.compare(password, hash);

    if (!user || !isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '24h' },
    );

    res.json({
      status: 'success',
      message: 'Login successful',
      data: { token },
    });
  } catch (err) {
    next(err);
  }
};
