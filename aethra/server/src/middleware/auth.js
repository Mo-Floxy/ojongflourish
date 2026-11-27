import { queryOne } from '../db/pool.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { unauthorized } from '../utils/errors.js';

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const match = /^Bearer\s+(.+)$/i.exec(header);
    if (!match) throw unauthorized();

    const payload = verifyAccessToken(match[1]);
    const user = await queryOne(
      'SELECT id, first_name, last_name, email, avatar_color, role, is_active FROM users WHERE id = ?',
      [payload.sub],
    );
    if (!user || !user.is_active) throw unauthorized('This account is no longer active', 'ACCOUNT_INACTIVE');

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
