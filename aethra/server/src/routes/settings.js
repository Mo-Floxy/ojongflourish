import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { query, queryOne, withTransaction } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import {
  isBoolean,
  isNumberInRange,
  isOneOf,
  maxLength,
  required,
  strongPassword,
  validate,
} from '../middleware/validate.js';
import { asyncHandler, unauthorized } from '../utils/errors.js';

const router = Router();
router.use(authenticate);

const publicUser = (user) => ({
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  fullName: `${user.first_name} ${user.last_name}`.trim(),
  email: user.email,
  avatarColor: user.avatar_color,
  role: user.role,
  createdAt: user.created_at,
  lastLoginAt: user.last_login_at,
});

const mapPreferences = (row) => ({
  theme: row.theme,
  accent: row.accent,
  voiceEnabled: Boolean(row.voice_enabled),
  voiceName: row.voice_name,
  voiceRate: Number(row.voice_rate),
  voicePitch: Number(row.voice_pitch),
  autoSaveImages: Boolean(row.auto_save_images),
  emailNotifications: Boolean(row.email_notifications),
  reducedMotion: Boolean(row.reduced_motion),
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const user = await queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const preferences = await queryOne('SELECT * FROM user_preferences WHERE user_id = ?', [req.user.id]);
    res.json({ user: publicUser(user), preferences: mapPreferences(preferences) });
  }),
);

router.patch(
  '/profile',
  validate({
    firstName: [required('First name'), maxLength('First name', 80)],
    lastName: [required('Last name'), maxLength('Last name', 80)],
    avatarColor: [isOneOf('Accent colour', ['blue', 'violet', 'cyan', 'rose', 'amber'])],
  }),
  asyncHandler(async (req, res) => {
    await query(
      'UPDATE users SET first_name = ?, last_name = ?, avatar_color = ? WHERE id = ?',
      [req.body.firstName.trim(), req.body.lastName.trim(), req.body.avatarColor || 'blue', req.user.id],
    );
    const user = await queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
    res.json({ user: publicUser(user) });
  }),
);

router.patch(
  '/preferences',
  validate({
    theme: [isOneOf('Theme', ['dark', 'midnight', 'aurora'])],
    accent: [isOneOf('Accent', ['blue', 'violet', 'cyan', 'rose', 'amber'])],
    voiceEnabled: [isBoolean('Voice enabled')],
    voiceName: [maxLength('Voice', 80)],
    voiceRate: [isNumberInRange('Voice rate', 0.5, 2)],
    voicePitch: [isNumberInRange('Voice pitch', 0.5, 2)],
    autoSaveImages: [isBoolean('Auto-save images')],
    emailNotifications: [isBoolean('Email notifications')],
    reducedMotion: [isBoolean('Reduced motion')],
  }),
  asyncHandler(async (req, res) => {
    const body = req.body;
    await query(
      `UPDATE user_preferences SET
        theme = COALESCE(?, theme),
        accent = COALESCE(?, accent),
        voice_enabled = COALESCE(?, voice_enabled),
        voice_name = COALESCE(?, voice_name),
        voice_rate = COALESCE(?, voice_rate),
        voice_pitch = COALESCE(?, voice_pitch),
        auto_save_images = COALESCE(?, auto_save_images),
        email_notifications = COALESCE(?, email_notifications),
        reduced_motion = COALESCE(?, reduced_motion)
       WHERE user_id = ?`,
      [
        body.theme ?? null,
        body.accent ?? null,
        typeof body.voiceEnabled === 'boolean' ? Number(body.voiceEnabled) : null,
        body.voiceName ?? null,
        body.voiceRate ?? null,
        body.voicePitch ?? null,
        typeof body.autoSaveImages === 'boolean' ? Number(body.autoSaveImages) : null,
        typeof body.emailNotifications === 'boolean' ? Number(body.emailNotifications) : null,
        typeof body.reducedMotion === 'boolean' ? Number(body.reducedMotion) : null,
        req.user.id,
      ],
    );
    const preferences = await queryOne('SELECT * FROM user_preferences WHERE user_id = ?', [req.user.id]);
    res.json({ preferences: mapPreferences(preferences) });
  }),
);

router.post(
  '/password',
  validate({
    currentPassword: [required('Current password')],
    newPassword: [required('New password'), strongPassword('New password')],
  }),
  asyncHandler(async (req, res) => {
    const user = await queryOne('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const valid = await bcrypt.compare(req.body.currentPassword, user.password_hash);
    if (!valid) throw unauthorized('Current password is incorrect.', 'INVALID_PASSWORD');

    const hash = await bcrypt.hash(req.body.newPassword, 12);
    await withTransaction(async (connection) => {
      await connection.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
      await connection.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ?', [req.user.id]);
    });

    res.json({ message: 'Password changed. Please sign in again on other devices.' });
  }),
);

router.get(
  '/usage',
  asyncHandler(async (req, res) => {
    const totals = await query(
      `SELECT action, COUNT(*) AS sessions, COALESCE(SUM(amount), 0) AS units
       FROM usage_records WHERE user_id = ? GROUP BY action`,
      [req.user.id],
    );
    const recent = await query(
      `SELECT action, amount, provider, model, created_at AS createdAt
       FROM usage_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
      [req.user.id],
    );
    const counts = await queryOne(
      `SELECT
        (SELECT COUNT(*) FROM conversations WHERE user_id = ?) AS conversations,
        (SELECT COUNT(*) FROM generated_images WHERE user_id = ?) AS images,
        (SELECT COUNT(*) FROM saved_creations WHERE user_id = ?) AS creations`,
      [req.user.id, req.user.id, req.user.id],
    );
    res.json({ totals, recent, counts });
  }),
);

export default router;
