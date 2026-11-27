import { Router } from 'express';
import { query } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { isNumberInRange, validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();
router.use(authenticate);

router.post(
  '/sessions',
  validate({ durationSec: [isNumberInRange('Duration', 0, 3600)] }),
  asyncHandler(async (req, res) => {
    const duration = Math.round(Number(req.body?.durationSec) || 0);
    await query(
      'INSERT INTO usage_records (user_id, action, amount, provider, model) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'voice_session', Math.max(1, duration), 'browser', 'web-speech'],
    );
    res.status(201).json({ message: 'Voice session recorded.' });
  }),
);

export default router;
