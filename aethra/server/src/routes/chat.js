import { Router } from 'express';
import { query, queryOne, withTransaction } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { isNumberInRange, maxLength, minLength, required, validate } from '../middleware/validate.js';
import { chatConfigured, streamChatCompletion } from '../services/ai.js';
import { asyncHandler, badRequest, notFound, setupRequired } from '../utils/errors.js';

const router = Router();
router.use(authenticate);

const MAX_HISTORY = 24;

function writeSse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function ownedConversation(id, userId) {
  const conversation = await queryOne(
    'SELECT id, title, user_id FROM conversations WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  if (!conversation) throw notFound('Conversation not found.', 'CONVERSATION_NOT_FOUND');
  return conversation;
}

async function prepareConversation(userId, conversationId, firstContent) {
  if (conversationId) {
    const conversation = await ownedConversation(conversationId, userId);
    return { conversation, isNew: false };
  }
  const title = firstContent.replace(/\s+/g, ' ').trim().slice(0, 58) || 'New conversation';
  const [result] = await query(
    'INSERT INTO conversations (user_id, title, model) VALUES (?, ?, ?)',
    [userId, title, null],
  );
  return {
    conversation: { id: Number(result.insertId), title, user_id: userId },
    isNew: true,
  };
}

async function streamTurn(req, res, conversation, isNew = false) {
  const history = await query(
    `SELECT role, content FROM messages
     WHERE conversation_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT ${MAX_HISTORY}`,
    [conversation.id],
  );
  const messages = [
    { role: 'system', content: 'You are AETHRA, a thoughtful, capable personal AI assistant. Be clear, concise and genuinely helpful.' },
    ...history.reverse().map((row) => ({ role: row.role, content: row.content })),
  ];

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  writeSse(res, 'start', { conversationId: conversation.id, title: conversation.title, isNew });

  const controller = new AbortController();
  let clientClosed = false;
  const onClose = () => {
    clientClosed = true;
    controller.abort();
  };
  req.on('close', onClose);

  let fullText = '';
  let model = null;

  try {
    const result = await streamChatCompletion({
      messages,
      signal: controller.signal,
      onToken: (token) => {
        fullText += token;
        writeSse(res, 'token', { token });
      },
    });
    fullText = result.text;
    model = result.model;
  } catch (error) {
    if (!clientClosed) {
      writeSse(res, 'error', {
        message: error.name === 'AbortError' ? 'Response was interrupted.' : error.message || 'Something went wrong.',
        code: error.code || 'AI_ERROR',
      });
    }
  } finally {
    req.off('close', onClose);
  }

  if (fullText.trim()) {
    const tokenCount = Math.ceil(fullText.length / 4);
    try {
      const assistantId = await withTransaction(async (connection) => {
        const [insert] = await connection.execute(
          'INSERT INTO messages (conversation_id, user_id, role, content, token_count) VALUES (?, ?, ?, ?, ?)',
          [conversation.id, req.user.id, 'assistant', fullText, tokenCount],
        );
        await connection.execute(
          'INSERT INTO usage_records (user_id, action, amount, provider, model) VALUES (?, ?, ?, ?, ?)',
          [req.user.id, 'chat_message', tokenCount, 'ai', model],
        );
        return Number(insert.insertId);
      });
      writeSse(res, 'done', { messageId: assistantId, content: fullText, model, partial: clientClosed });
    } catch (error) {
      writeSse(res, 'error', { message: 'Could not save this response.', code: 'PERSISTENCE_ERROR' });
    }
  }

  res.end();
}

router.get(
  '/conversations',
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT c.id, c.title, c.created_at, c.updated_at,
              (SELECT m.content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_message,
              (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) AS message_count
       FROM conversations c
       WHERE c.user_id = ? AND c.is_archived = 0
       ORDER BY c.updated_at DESC
       LIMIT 60`,
      [req.user.id],
    );
    res.json({ conversations: rows });
  }),
);

router.post(
  '/conversations',
  validate({ title: [maxLength('Title', 180)] }),
  asyncHandler(async (req, res) => {
    const title = req.body.title?.trim() || 'New conversation';
    const [result] = await query(
      'INSERT INTO conversations (user_id, title) VALUES (?, ?)',
      [req.user.id, title],
    );
    res.status(201).json({ conversation: { id: Number(result.insertId), title } });
  }),
);

router.get(
  '/conversations/:id/messages',
  asyncHandler(async (req, res) => {
    const conversation = await ownedConversation(req.params.id, req.user.id);
    const messages = await query(
      `SELECT id, role, content, token_count, created_at
       FROM messages WHERE conversation_id = ? ORDER BY created_at ASC, id ASC LIMIT 300`,
      [conversation.id],
    );
    res.json({ conversation, messages });
  }),
);

router.delete(
  '/conversations/:id',
  asyncHandler(async (req, res) => {
    await ownedConversation(req.params.id, req.user.id);
    await query('DELETE FROM conversations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Conversation deleted.' });
  }),
);

router.post(
  '/messages',
  validate({
    content: [required('Message'), minLength('Message', 1), maxLength('Message', 8000)],
    conversationId: [isNumberInRange('Conversation', 1, Number.MAX_SAFE_INTEGER)],
  }),
  asyncHandler(async (req, res) => {
    if (!chatConfigured()) {
      throw setupRequired(
        'AI chat is not configured. Add AI_API_KEY and AI_PROVIDER to server/.env, then restart the server.',
        'AI_NOT_CONFIGURED',
      );
    }

    const content = req.body.content.trim();
    const { conversation, isNew } = await prepareConversation(
      req.user.id,
      req.body.conversationId,
      content,
    );

    await query(
      'INSERT INTO messages (conversation_id, user_id, role, content) VALUES (?, ?, ?, ?)',
      [conversation.id, req.user.id, 'user', content],
    );

    await streamTurn(req, res, conversation, isNew);
  }),
);

router.post(
  '/regenerate/:messageId',
  asyncHandler(async (req, res) => {
    if (!chatConfigured()) {
      throw setupRequired('AI chat is not configured on this server.', 'AI_NOT_CONFIGURED');
    }

    const assistant = await queryOne(
      `SELECT m.id, m.conversation_id, m.created_at
       FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE m.id = ? AND m.role = 'assistant' AND c.user_id = ?`,
      [req.params.messageId, req.user.id],
    );
    if (!assistant) throw notFound('Assistant message not found.', 'MESSAGE_NOT_FOUND');

    const userMessage = await queryOne(
      `SELECT content FROM messages
       WHERE conversation_id = ? AND role = 'user' AND id < ?
       ORDER BY id DESC LIMIT 1`,
      [assistant.conversation_id, assistant.id],
    );
    if (!userMessage) throw badRequest('There is no earlier message to regenerate.', 'NO_SOURCE_MESSAGE');

    await query('DELETE FROM messages WHERE conversation_id = ? AND id >= ?', [assistant.conversation_id, assistant.id]);

    const conversation = await ownedConversation(assistant.conversation_id, req.user.id);
    await streamTurn(req, res, conversation);
  }),
);

export default router;
