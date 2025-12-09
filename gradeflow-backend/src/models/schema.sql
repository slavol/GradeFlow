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
  time_limit INTEGER DEFAULT 0,          -- in minute (0 = nelimitat)
  creation_type TEXT NOT NULL,          -- manual / ai / etc
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
  position INTEGER DEFAULT 0            -- pentru ordinea întrebărilor
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
--     QUIZ RESULTS (offline / non-live)
--  (poți păstra pentru viitor, nu le atinge backend-ul de live)
-- ==========================
CREATE TABLE quiz_results (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP
);

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

-- ======================================================
--                LIVE SESSION STRUCTURE
-- ======================================================

-- 1) Sesiunea live pentru un quiz
CREATE TABLE quiz_sessions (
  id SERIAL PRIMARY KEY,
  quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
  professor_id INT REFERENCES users(id) ON DELETE CASCADE,
  session_code TEXT UNIQUE NOT NULL,                          -- VHRVQZ etc
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'closed')),                   -- doar aceste statusuri
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2) Sesiunea unui student în cadrul unei sesiuni live
CREATE TABLE student_sessions (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,                                    -- scor curent
  current_index INTEGER NOT NULL DEFAULT 0,                   -- index întrebării curente (0-based)
  completed BOOLEAN DEFAULT false,                            -- true când termină quiz-ul
  started_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT uniq_session_student UNIQUE (session_id, student_id)
);

-- 3) Răspunsurile studentului (LIVE)
--    Suportă atât single cât și multiple choices prin ARRAY
CREATE TABLE student_answers (
  id SERIAL PRIMARY KEY,
  student_session_id INTEGER REFERENCES student_sessions(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_ids INTEGER[] NOT NULL,                     -- ex: {3} sau {3,5}
  is_correct BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- (OPȚIONAL) Dacă vrei, poți RENUNȚA complet la astea:
--   session_participants
--   responses
-- pentru că sunt acoperite de student_sessions și student_answers.
-- Dacă nu vrei să le folosești deloc, mai bine nu le mai creezi.