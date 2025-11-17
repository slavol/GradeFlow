CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student','professor')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    professor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    time_limit INTEGER DEFAULT 0,
    creation_type TEXT NOT NULL,
    join_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('single', 'multiple')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);