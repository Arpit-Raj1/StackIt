import pool from './db';

// User operations
export const userQueries = {
  // Create a new user
  createUser: async (username: string, email: string, passwordHash: string) => {
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, role, reputation, created_at
    `;
    const result = await pool.query(query, [username, email, passwordHash]);
    return result.rows[0];
  },

  // Get user by email
  getUserByEmail: async (email: string) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  // Get user by username
  getUserByUsername: async (username: string) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  },

  // Get user by ID
  getUserById: async (id: string) => {
    const query = 'SELECT id, username, email, avatar_url, role, reputation, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },
};

// Question operations
export const questionQueries = {
  // Create a new question
  createQuestion: async (title: string, content: string, authorId: string, tags: string[] = []) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert question
      const questionQuery = `
        INSERT INTO questions (title, content, author_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const questionResult = await client.query(questionQuery, [title, content, authorId]);
      const question = questionResult.rows[0];

      // Add tags if provided
      if (tags.length > 0) {
        for (const tagName of tags) {
          // Insert or get tag
          const tagQuery = `
            INSERT INTO tags (name) VALUES ($1)
            ON CONFLICT (name) DO UPDATE SET usage_count = tags.usage_count + 1
            RETURNING id
          `;
          const tagResult = await client.query(tagQuery, [tagName]);
          const tagId = tagResult.rows[0].id;

          // Link question to tag
          await client.query(
            'INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2)',
            [question.id, tagId]
          );
        }
      }

      await client.query('COMMIT');
      return question;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Get all questions with pagination
  getQuestions: async (page = 1, limit = 10, sortBy = 'created_at') => {
    const offset = (page - 1) * limit;
    const query = `
      SELECT 
        q.*,
        u.username as author_username,
        u.avatar_url as author_avatar,
        COALESCE(a.answer_count, 0) as answer_count,
        array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM questions q
      LEFT JOIN users u ON q.author_id = u.id
      LEFT JOIN (
        SELECT question_id, COUNT(*) as answer_count
        FROM answers
        GROUP BY question_id
      ) a ON q.id = a.question_id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      GROUP BY q.id, u.username, u.avatar_url, a.answer_count
      ORDER BY q.${sortBy} DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  },

  // Get question by ID with answers
  getQuestionById: async (id: string) => {
    const questionQuery = `
      SELECT 
        q.*,
        u.username as author_username,
        u.avatar_url as author_avatar,
        u.reputation as author_reputation,
        array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM questions q
      LEFT JOIN users u ON q.author_id = u.id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE q.id = $1
      GROUP BY q.id, u.username, u.avatar_url, u.reputation
    `;
    
    const answersQuery = `
      SELECT 
        a.*,
        u.username as author_username,
        u.avatar_url as author_avatar,
        u.reputation as author_reputation
      FROM answers a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.question_id = $1
      ORDER BY a.is_accepted DESC, a.votes DESC, a.created_at ASC
    `;

    const [questionResult, answersResult] = await Promise.all([
      pool.query(questionQuery, [id]),
      pool.query(answersQuery, [id])
    ]);

    const question = questionResult.rows[0];
    if (!question) return null;

    return {
      ...question,
      answers: answersResult.rows
    };
  },

  // Search questions
  searchQuestions: async (searchTerm: string, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const query = `
      SELECT 
        q.*,
        u.username as author_username,
        u.avatar_url as author_avatar,
        COALESCE(a.answer_count, 0) as answer_count,
        array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
        ts_rank(to_tsvector('english', q.title || ' ' || q.content), plainto_tsquery('english', $1)) as rank
      FROM questions q
      LEFT JOIN users u ON q.author_id = u.id
      LEFT JOIN (
        SELECT question_id, COUNT(*) as answer_count
        FROM answers
        GROUP BY question_id
      ) a ON q.id = a.question_id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE to_tsvector('english', q.title || ' ' || q.content) @@ plainto_tsquery('english', $1)
      GROUP BY q.id, u.username, u.avatar_url, a.answer_count
      ORDER BY rank DESC, q.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [searchTerm, limit, offset]);
    return result.rows;
  },
};

// Answer operations
export const answerQueries = {
  // Create a new answer
  createAnswer: async (content: string, questionId: string, authorId: string) => {
    const query = `
      INSERT INTO answers (content, question_id, author_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [content, questionId, authorId]);
    return result.rows[0];
  },

  // Accept an answer
  acceptAnswer: async (answerId: string, questionAuthorId: string) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // First, unaccept any previously accepted answers for this question
      await client.query(`
        UPDATE answers 
        SET is_accepted = FALSE 
        WHERE question_id = (SELECT question_id FROM answers WHERE id = $1)
      `, [answerId]);
      
      // Accept the new answer
      await client.query('UPDATE answers SET is_accepted = TRUE WHERE id = $1', [answerId]);
      
      // Update question status
      await client.query(`
        UPDATE questions 
        SET has_accepted_answer = TRUE 
        WHERE id = (SELECT question_id FROM answers WHERE id = $1)
        AND author_id = $2
      `, [answerId, questionAuthorId]);
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};

// Vote operations
export const voteQueries = {
  // Vote on a question or answer
  vote: async (userId: string, votableType: 'question' | 'answer', votableId: string, voteType: 'up' | 'down') => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Remove existing vote if any
      await client.query(`
        DELETE FROM votes 
        WHERE user_id = $1 AND votable_type = $2 AND votable_id = $3
      `, [userId, votableType, votableId]);
      
      // Insert new vote
      await client.query(`
        INSERT INTO votes (user_id, votable_type, votable_id, vote_type)
        VALUES ($1, $2, $3, $4)
      `, [userId, votableType, votableId, voteType]);
      
      // Update vote count
      const voteChange = voteType === 'up' ? 1 : -1;
      const tableName = votableType === 'question' ? 'questions' : 'answers';
      await client.query(`
        UPDATE ${tableName} 
        SET votes = votes + $1 
        WHERE id = $2
      `, [voteChange, votableId]);
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Get user's vote on an item
  getUserVote: async (userId: string, votableType: 'question' | 'answer', votableId: string) => {
    const query = `
      SELECT vote_type FROM votes 
      WHERE user_id = $1 AND votable_type = $2 AND votable_id = $3
    `;
    const result = await pool.query(query, [userId, votableType, votableId]);
    return result.rows[0]?.vote_type || null;
  },
};

// Tag operations
export const tagQueries = {
  // Get all tags
  getAllTags: async () => {
    const query = 'SELECT * FROM tags ORDER BY usage_count DESC';
    const result = await pool.query(query);
    return result.rows;
  },

  // Get popular tags
  getPopularTags: async (limit = 20) => {
    const query = 'SELECT * FROM tags ORDER BY usage_count DESC LIMIT $1';
    const result = await pool.query(query, [limit]);
    return result.rows;
  },

  // Search tags
  searchTags: async (searchTerm: string) => {
    const query = `
      SELECT * FROM tags 
      WHERE name ILIKE $1 
      ORDER BY usage_count DESC
      LIMIT 10
    `;
    const result = await pool.query(query, [`%${searchTerm}%`]);
    return result.rows;
  },
};
