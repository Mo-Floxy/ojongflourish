import { Router } from 'express';
import { env } from '../config/env.js';
import { query, queryOne } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { isOneOf, maxLength, minLength, required, validate } from '../middleware/validate.js';
import { generateImage, IMAGE_STYLES, imageConfigured, ASPECT_RATIOS } from '../services/image.js';
import { asyncHandler, notFound, setupRequired } from '../utils/errors.js';

const router = Router();
router.use(authenticate);

const publicImage = (row) => ({
  id: row.id,
  prompt: row.prompt,
  negativePrompt: row.negative_prompt,
  style: row.style,
  aspectRatio: row.aspect_ratio,
  provider: row.provider,
  model: row.model,
  mimeType: row.mime_type,
  status: row.status,
  errorMessage: row.error_message,
  createdAt: row.created_at,
  fileUrl: `/api/images/${row.id}/file`,
});

router.get(
  '/config',
  asyncHandler(async (_req, res) => {
    res.json({
      configured: imageConfigured(),
      provider: env.image.provider,
      model: env.image.model,
      styles: IMAGE_STYLES,
      aspectRatios: ASPECT_RATIOS,
    });
  }),
);

router.post(
  '/generate',
  validate({
    prompt: [required('Prompt'), minLength('Prompt', 3), maxLength('Prompt', 4000)],
    style: [isOneOf('Style', IMAGE_STYLES)],
    aspectRatio: [isOneOf('Aspect ratio', ASPECT_RATIOS)],
  }),
  asyncHandler(async (req, res) => {
    if (!imageConfigured()) {
      throw setupRequired(
        'Image generation is not configured. Add IMAGE_API_KEY and IMAGE_PROVIDER to server/.env, then restart the server.',
        'IMAGE_NOT_CONFIGURED',
      );
    }

    const { prompt, negativePrompt, style, aspectRatio } = req.body;
    const [insert] = await query(
      `INSERT INTO generated_images
        (user_id, prompt, negative_prompt, style, aspect_ratio, provider, model, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, prompt.trim(), negativePrompt?.trim() || null, style, aspectRatio, env.image.provider, env.image.model],
    );
    const imageId = Number(insert.insertId);

    try {
      const result = await generateImage({
        prompt: prompt.trim(),
        style,
        aspectRatio,
        negativePrompt,
      });

      await query(
        `UPDATE generated_images
         SET image_data = ?, mime_type = ?, status = 'completed', error_message = NULL
         WHERE id = ? AND user_id = ?`,
        [result.buffer, result.mimeType, imageId, req.user.id],
      );

      const pref = await queryOne('SELECT auto_save_images FROM user_preferences WHERE user_id = ?', [req.user.id]);
      if (pref?.auto_save_images) {
        await query(
          `INSERT IGNORE INTO saved_creations (user_id, image_id, title)
           VALUES (?, ?, ?)`,
          [req.user.id, imageId, prompt.trim().slice(0, 180)],
        );
      }

      await query(
        'INSERT INTO usage_records (user_id, action, amount, provider, model) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'image_generation', 1, result.provider, result.model],
      );

      const image = await queryOne('SELECT * FROM generated_images WHERE id = ?', [imageId]);
      res.status(201).json({ image: publicImage(image) });
    } catch (error) {
      await query(
        'UPDATE generated_images SET status = ?, error_message = ? WHERE id = ?',
        ['failed', String(error.message || 'Generation failed').slice(0, 500), imageId],
      );
      throw error;
    }
  }),
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 40, 1), 100);
    const rows = await query(
      `SELECT gi.*, EXISTS(
         SELECT 1 FROM saved_creations sc WHERE sc.image_id = gi.id AND sc.user_id = ?
       ) AS is_saved
       FROM generated_images gi
       WHERE gi.user_id = ?
       ORDER BY gi.created_at DESC, gi.id DESC
       LIMIT ${limit}`,
      [req.user.id, req.user.id],
    );
    res.json({ images: rows.map((row) => ({ ...publicImage(row), isSaved: Boolean(row.is_saved) })) });
  }),
);

router.get(
  '/:id/file',
  asyncHandler(async (req, res) => {
    const image = await queryOne(
      'SELECT mime_type, image_data, remote_url, status FROM generated_images WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id],
    );
    if (!image) throw notFound('Image not found.', 'IMAGE_NOT_FOUND');
    if (image.status !== 'completed') throw notFound('This image is not available.', 'IMAGE_NOT_READY');

    if (image.image_data) {
      res.setHeader('Content-Type', image.mime_type || 'image/png');
      res.setHeader('Cache-Control', 'private, max-age=86400');
      return res.send(Buffer.from(image.image_data));
    }
    if (image.remote_url) return res.redirect(image.remote_url);
    throw notFound('Image data is unavailable.', 'IMAGE_DATA_MISSING');
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const image = await queryOne('SELECT id FROM generated_images WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!image) throw notFound('Image not found.', 'IMAGE_NOT_FOUND');
    await query('DELETE FROM generated_images WHERE id = ?', [image.id]);
    res.json({ message: 'Image deleted.' });
  }),
);

router.post(
  '/:id/save',
  asyncHandler(async (req, res) => {
    const image = await queryOne('SELECT id, prompt FROM generated_images WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!image) throw notFound('Image not found.', 'IMAGE_NOT_FOUND');

    const title = req.body?.title?.trim() || image.prompt.slice(0, 180);
    await query(
      `INSERT INTO saved_creations (user_id, image_id, title, notes)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title = VALUES(title)`,
      [req.user.id, image.id, title, req.body?.notes?.trim() || null],
    );
    res.status(201).json({ message: 'Saved to your creations.' });
  }),
);

export default router;
