-- Insert sample users
INSERT INTO users (username, email, password_hash, role) VALUES
('johndoe', 'john@example.com', '$2b$10$hash1', 'user'),
('sarah_dev', 'sarah@example.com', '$2b$10$hash2', 'user'),
('mike_codes', 'mike@example.com', '$2b$10$hash3', 'user'),
('admin_user', 'admin@example.com', '$2b$10$hash4', 'admin');

-- Insert sample tags
INSERT INTO tags (name, description, usage_count) VALUES
('react', 'A JavaScript library for building user interfaces', 1234),
('javascript', 'A high-level programming language', 2156),
('typescript', 'A typed superset of JavaScript', 987),
('nextjs', 'A React framework for production', 654),
('nodejs', 'JavaScript runtime built on Chrome V8 engine', 543),
('css', 'Cascading Style Sheets', 432),
('html', 'HyperText Markup Language', 321),
('python', 'A high-level programming language', 876);

-- Insert sample questions
INSERT INTO questions (title, content, author_id, votes, views) VALUES
(
    'How to implement authentication in Next.js 14?',
    'I''m trying to implement authentication in my Next.js 14 application using the app router. What are the best practices?',
    (SELECT id FROM users WHERE username = 'johndoe'),
    15,
    245
),
(
    'React useState vs useReducer - when to use which?',
    'I''m confused about when to use useState and when to use useReducer in React. Can someone explain the differences?',
    (SELECT id FROM users WHERE username = 'sarah_dev'),
    8,
    156
),
(
    'Best practices for TypeScript with React components?',
    'What are the best practices for typing React components with TypeScript? Should I use interfaces or types?',
    (SELECT id FROM users WHERE username = 'mike_codes'),
    12,
    389
);

-- Link questions with tags
INSERT INTO question_tags (question_id, tag_id) VALUES
((SELECT id FROM questions WHERE title LIKE 'How to implement authentication%'), (SELECT id FROM tags WHERE name = 'nextjs')),
((SELECT id FROM questions WHERE title LIKE 'How to implement authentication%'), (SELECT id FROM tags WHERE name = 'react')),
((SELECT id FROM questions WHERE title LIKE 'React useState vs useReducer%'), (SELECT id FROM tags WHERE name = 'react')),
((SELECT id FROM questions WHERE title LIKE 'React useState vs useReducer%'), (SELECT id FROM tags WHERE name = 'javascript')),
((SELECT id FROM questions WHERE title LIKE 'Best practices for TypeScript%'), (SELECT id FROM tags WHERE name = 'typescript')),
((SELECT id FROM questions WHERE title LIKE 'Best practices for TypeScript%'), (SELECT id FROM tags WHERE name = 'react'));

-- Insert sample answers
INSERT INTO answers (content, question_id, author_id, votes, is_accepted) VALUES
(
    'For Next.js 14 with the app router, I''d recommend using NextAuth.js v5. Here''s a complete setup...',
    (SELECT id FROM questions WHERE title LIKE 'How to implement authentication%'),
    (SELECT id FROM users WHERE username = 'sarah_dev'),
    8,
    true
),
(
    'useState is great for simple state, while useReducer is better for complex state logic...',
    (SELECT id FROM questions WHERE title LIKE 'React useState vs useReducer%'),
    (SELECT id FROM users WHERE username = 'mike_codes'),
    5,
    false
);

-- Insert sample notifications
INSERT INTO notifications (user_id, type, message, link) VALUES
((SELECT id FROM users WHERE username = 'johndoe'), 'answer', 'Sarah answered your question "How to use React hooks?"', '/questions/1'),
((SELECT id FROM users WHERE username = 'sarah_dev'), 'vote', 'Your answer received 5 upvotes', '/questions/2'),
((SELECT id FROM users WHERE username = 'mike_codes'), 'mention', 'John mentioned you in a comment', '/questions/3');
