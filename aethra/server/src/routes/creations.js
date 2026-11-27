import { Router } from 'express';
import { query, queryOne } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, notFound } from '../utils/errors.js';

const router = Router();
router.use(authenticate);

const mapCreation = (row) => ({
  id: row.id,
  imageId: row.image_id,
  title: row.title,
  notes: row.notes,
  isFavourite: Boolean(row.is_favourite),
  createdAt: row.created_at,
  prompt: row.prompt,
  style: row.style,
  aspectRatio: row.aspect_ratio,
  mimeType: row.mime_type,
  status: row.status,
  fileUrl: `/api/images/${row.image_id}/file`,
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const search = String(req.query.search || '').trim().slice(0, 120);
    const pattern = `%${search}%`;
    const rows = await query(
      `SELECT sc.*, gi.prompt, gi.style, gi.aspect_ratio, gi.mime_type, gi.status
       FROM saved_creations sc
       JOIN generated_images gi ON gi.id = sc.image_id
       WHERE sc.user_id = ? AND (? = '' OR sc.title LIKE ? OR gi.prompt LIKE ? OR gi.style LIKE ?)
       ORDER BY sc.created_at DESC, sc.id DESC
       LIMIT 120`,
      [req.user.id, search, pattern, pattern, pattern],
    );
    res.json({ creations: rows.map(mapCreation) });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const row = await queryOne(
      `SELECT sc.*, gi.prompt, gi.style, gi.aspect_ratio, gi.mime_type, gi.status
       FROM saved_creations sc
       JOIN generated_images gi ON gi.id = sc.image_id
       WHERE sc.id = ? AND sc.user_id = ?`,
      [req.params.id, req.user.id],
    );
    if (!row) throw notFound('Creation not found.', 'CREATION_NOT_FOUND');
    res.json({ creation: mapCreation(row) });
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const creation = await queryOne('SELECT id FROM saved_creations WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!creation) throw notFound('Creation not found.', 'CREATION_NOT_FOUND');

    const title = req.body?.title?.trim().slice(0, 180);
    const notes = req.body?.notes?.trim().slice(0, 2000);
    const favourite = req.body?.isFavourite;

    await query(
      `UPDATE saved_creations
       SET title = COALESCE(?, title), notes = COALESCE(?, notes), is_favourite = COALESCE(?, is_favourite)
       WHERE id = ?`,
      [title || null, notes === '' ? null : notes || null, typeof favourite === 'boolean' ? Number(favourite) : null, creation.id],
    );

    const updated = await queryOne(
      `SELECT sc.*, gi.prompt, gi.style, gi.aspect_ratio, gi.mime_type, gi.status
       FROM saved_creations sc JOIN generated_images gi ON gi.id = sc.image_id WHERE sc.id = ?`,
      [creation.id],
    );
    res.json({ creation: mapCreation(updated) });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const creation = await queryOne('SELECT id FROM saved_creations WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!creation) throw notFound('Creation not found.', 'CREATION_NOT_FOUND');
    await query('DELETE FROM saved_creations WHERE id = ?', [creation.id]);
    res.json({ message: 'Removed from your creations.' });
  }),
);

export default router;
