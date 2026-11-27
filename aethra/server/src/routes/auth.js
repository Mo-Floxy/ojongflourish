import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { query, queryOne, withTransaction } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import {
  isEmail,
  maxLength,
  minLength,
  required,
  strongPassword,
  validate,
} from '../middleware/validate.js';
import { asyncHandler, badRequest, conflict, notFound, setupRequired, unauthorized } from '../utils/errors.js';
import { hashToken, issueTokenPair, refreshExpiryDate } from '../utils/tokens.js';

const router = Router();

const publicUser = (user) => ({
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  fullName: `${user.first_name} ${user.last_name}`.trim(),
  email: user.email,
  avatarColor: user.avatar_color,
  role: user.role,
});

async function storeRefreshToken(connection, userId, token) {
  await connection.execute(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, hashToken(token), refreshExpiryDate()],
  );
}

router.post(
  '/register',
  validate({
    firstName: [required('First name'), maxLength('First name', 80)],
    lastName: [required('Last name'), maxLength('Last name', 80)],
    email: [required('Email'), isEmail(), maxLength('Email', 255)],
    password: [required('Password'), strongPassword()],
  }),
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) throw conflict('An account with this email already exists.', 'EMAIL_TAKEN');

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await withTransaction(async (connection) => {
      const [insert] = await connection.execute(
        'INSERT INTO users (first_name, last_name, email, password_hash, avatar_color) VALUES (?, ?, ?, ?, ?)',
        [firstName.trim(), lastName.trim(), normalizedEmail, passwordHash, 'blue'],
      );
      const userId = Number(insert.insertId);

      await connection.execute('INSERT INTO user_preferences (user_id) VALUES (?)', [userId]);

      const tokens = await issueTokenPair({ id: userId });
      await storeRefreshToken(connection, userId, tokens.refreshToken);

      await connection.execute(
        'INSERT INTO usage_records (user_id, action, amount, provider, model) VALUES (?, ?, ?, ?, ?)',
        [userId, 'chat_message', 0, 'system', 'registration'],
      );

      return { userId, tokens };
    });

    const user = await queryOne('SELECT * FROM users WHERE id = ?', [result.userId]);
    res.status(201).json({ user: publicUser(user), tokens: result.tokens });
  }),
);

router.post(
  '/login',
  validate({
    email: [required('Email'), isEmail()],
    password: [required('Password')],
  }),
  asyncHandler(async (req, res) => {
    const email = req.body.email.trim().toLowerCase();
    const user = await queryOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !user.is_active) throw unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(req.body.password, user.password_hash);
    if (!valid) throw unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');

    const tokens = await issueTokenPair(user);
    await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
    await query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, hashToken(tokens.refreshToken), refreshExpiryDate()],
    );

    res.json({ user: publicUser(user), tokens });
  }),
);

router.post(
  '/refresh',
  validate({ refreshToken: [required('Refresh token')] }),
  asyncHandler(async (req, res) => {
    const tokenHash = hashToken(req.body.refreshToken);
    const record = await queryOne(
      `SELECT rt.id AS token_id, rt.user_id, u.id, u.first_name, u.last_name, u.email, u.avatar_color, u.role
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = ? AND rt.revoked_at IS NULL AND rt.expires_at > NOW()`,
      [tokenHash],
    );
    if (!record) throw unauthorized('Refresh token is invalid or expired.', 'INVALID_REFRESH_TOKEN');

    const tokens = await withTransaction(async (connection) => {
      await connection.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?', [record.token_id]);
      const next = await issueTokenPair({ id: record.user_id });
      await storeRefreshToken(connection, record.user_id, next.refreshToken);
      return next;
    });

    res.json({ tokens });
  }),
);

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.body?.refreshToken;
    if (token) {
      await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?', [hashToken(token)]);
    }
    res.json({ message: 'Signed out successfully.' });
  }),
);

router.post(
  '/forgot-password',
  validate({ email: [required('Email'), isEmail()] }),
  asyncHandler(async (req, res) => {
    const email = req.body.email.trim().toLowerCase();
    const user = await queryOne('SELECT id, first_name, email FROM users WHERE email = ?', [email]);
    let devToken = null;

    // Always return the same message so account existence is not disclosed.
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      devToken = token;
      await query(
        'UPDATE users SET password_reset_token_hash = ?, password_reset_expires_at = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?',
        [hashToken(token), user.id],
      );

      if (env.mail.mode === 'smtp') {
        if (!env.mail.host) throw setupRequired('Email delivery is not configured on this server.', 'MAIL_NOT_CONFIGURED');
        const transporter = nodemailer.createTransport({
          host: env.mail.host,
          port: env.mail.port,
          secure: env.mail.port === 465,
          auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined,
        });
        const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;
        await transporter.sendMail({
          from: env.mail.from,
          to: user.email,
          subject: 'Reset your AETHRA password',
          text: `Hi ${user.first_name},\n\nUse this link to reset your password: ${resetUrl}\n\nThe link expires in 30 minutes.`,
          html: `<p>Hi ${user.first_name},</p><p><a href="${resetUrl}">Reset your AETHRA password</a></p><p>This link expires in 30 minutes.</p>`,
        });
      }
    }

    const response = {
      message: 'If an account exists for that email, a reset link has been prepared.',
    };
    if (env.mail.mode === 'dev') {
      // Local development only: the token is returned so the flow can be tested
      // without an SMTP server. Always present (null when no account matched).
      response.devResetToken = devToken;
    }
    res.json(response);
  }),
);

router.post(
  '/reset-password',
  validate({
    token: [required('Reset token')],
    password: [required('Password'), strongPassword()],
  }),
  asyncHandler(async (req, res) => {
    const tokenHash = hashToken(req.body.token);
    const user = await queryOne(
      `SELECT id FROM users
       WHERE password_reset_token_hash = ? AND password_reset_expires_at > NOW()`,
      [tokenHash],
    );
    if (!user) throw badRequest('This reset link is invalid or has expired.', 'INVALID_RESET_TOKEN');

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    await withTransaction(async (connection) => {
      await connection.execute(
        'UPDATE users SET password_hash = ?, password_reset_token_hash = NULL, password_reset_expires_at = NULL WHERE id = ?',
        [passwordHash, user.id],
      );
      await connection.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ?', [user.id]);
    });

    res.json({ message: 'Password updated. You can now sign in.' });
  }),
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) throw notFound('Account not found.', 'USER_NOT_FOUND');
    res.json({ user: publicUser(user) });
  }),
);

export default router;
