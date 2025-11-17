-- ==========================
--        USERS
-- ==========================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student','professor')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================
--        QUIZZES
-- ==========================
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

-- ==========================
--       QUESTIONS
-- ==========================
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('single','multiple')),
  created_at TIMESTAMP DEFAULT NOW(),
  position INTEGER DEFAULT 0
);

-- ==========================
--        OPTIONS
-- ==========================
CREATE TABLE options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================
--     QUIZ RESULTS
-- ==========================
CREATE TABLE quiz_results (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP
);

-- ==========================
--    QUIZ ANSWERS
-- ==========================
CREATE TABLE quiz_answers (
  id SERIAL PRIMARY KEY,
  result_id INTEGER REFERENCES quiz_results(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  option_id INTEGER REFERENCES options(id),
  is_correct BOOLEAN
);

-- ==========================
--  INSERT PROFESOR DE TEST
-- ==========================
INSERT INTO users (email, password, role)
VALUES ('prof@test.com', 'parola123', 'professor');