-- Optional: schema dedicată
-- CREATE SCHEMA gradeflow;
-- SET search_path TO gradeflow;

-- ==========================
-- 1. USERS
-- ==========================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'professor')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ==========================
-- 2. QUIZZES (create de profesori)
-- ==========================

CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- timp de rezolvare în minute
    duration_minutes INT NOT NULL DEFAULT 30,
    
    -- status: draft = în lucru, published = activ, closed = închis
    status VARCHAR(20) NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'published', 'closed')),
    
    -- codul pe care îl vor introduce studenții
    quiz_code VARCHAR(10) NOT NULL UNIQUE,
    
    -- profesorul care a creat quiz-ul
    created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- număr maxim de încercări per student (1 = default)
    max_attempts INT NOT NULL DEFAULT 1,
    
    -- randomizare întrebări / răspunsuri
    shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE,
    shuffle_answers  BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- interval opțional în care quiz-ul e activ
    start_time TIMESTAMP NULL,
    end_time   TIMESTAMP NULL,
    
    -- versionare + soft delete
    version INT NOT NULL DEFAULT 1,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_quizzes_quiz_code ON quizzes(quiz_code);

-- ==========================
-- 3. QUIZ MATERIALS (pentru AI)
-- ==========================

CREATE TABLE IF NOT EXISTS quiz_materials (
    id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,           -- pdf, docx, txt, etc
    storage_path TEXT NOT NULL,              -- path/URL unde e salvat fișierul
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    processed BOOLEAN NOT NULL DEFAULT FALSE, -- dacă a fost deja trecut prin AI
    extracted_text TEXT                       -- textul extras pentru AI
);

CREATE INDEX IF NOT EXISTS idx_quiz_materials_quiz_id ON quiz_materials(quiz_id);

-- ==========================
-- 4. QUIZ QUESTIONS
-- ==========================

CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('single', 'multiple')),
    
    -- punctajul întrebării (poți folosi și DECIMAL)
    points NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    
    version INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- ==========================
-- 5. QUIZ OPTIONS (variante de răspuns)
-- ==========================

CREATE TABLE IF NOT EXISTS quiz_options (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_options(question_id);

-- ==========================
-- 6. QUIZ ENROLLMENTS (student înscris la un quiz cu cod)
-- ==========================

CREATE TABLE IF NOT EXISTS quiz_enrollments (
    id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE (quiz_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_enrollments_quiz_id ON quiz_enrollments(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_enrollments_student_id ON quiz_enrollments(student_id);

-- ==========================
-- 7. QUIZ SESSIONS (început de quiz)
-- ==========================

CREATE TABLE IF NOT EXISTS quiz_sessions (
    id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    start_time TIMESTAMP NOT NULL DEFAULT NOW(),
    end_time   TIMESTAMP NULL,
    
    -- attempt ul curent (1, 2, etc)
    attempt_number INT NOT NULL DEFAULT 1,
    
    -- status: active / expired / submitted
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'expired', 'submitted'))
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_quiz_student ON quiz_sessions(quiz_id, student_id);

-- ==========================
-- 8. QUIZ SUBMISSIONS (o trimitere de quiz)
-- ==========================

CREATE TABLE IF NOT EXISTS quiz_submissions (
    id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INT REFERENCES quiz_sessions(id) ON DELETE SET NULL,
    
    score NUMERIC(6,2),
    max_score NUMERIC(6,2),
    
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'finished'
        CHECK (status IN ('finished', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_quiz_id ON quiz_submissions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_student_id ON quiz_submissions(student_id);

-- ==========================
-- 9. QUIZ ANSWERS (răspunsurile efective ale studentului)
-- ==========================

CREATE TABLE IF NOT EXISTS quiz_answers (
    id SERIAL PRIMARY KEY,
    submission_id INT NOT NULL REFERENCES quiz_submissions(id) ON DELETE CASCADE,
    question_id INT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_id   INT NOT NULL REFERENCES quiz_options(id) ON DELETE CASCADE,
    
    is_correct BOOLEAN  -- calculat la corectare (opțional)
);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_submission_id ON quiz_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON quiz_answers(question_id);

-- ==========================
-- 10. QUIZ TIME EVENTS (anti-fraud / analytics)
-- ==========================

CREATE TABLE IF NOT EXISTS quiz_time_events (
    id SERIAL PRIMARY KEY,
    session_id INT NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    
    event_type VARCHAR(50) NOT NULL,          -- focus_lost, focus_gained, question_viewed, etc
    question_id INT REFERENCES quiz_questions(id) ON DELETE SET NULL,
    
    event_time TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_time_events_session_id ON quiz_time_events(session_id);

-- ==========================
-- 11. PROFESSOR LOGS (activitatea profesorului)
-- ==========================

CREATE TABLE IF NOT EXISTS professor_logs (
    id SERIAL PRIMARY KEY,
    professor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INT REFERENCES quizzes(id) ON DELETE SET NULL,
    
    action TEXT NOT NULL,    -- ex: "CREATE_QUIZ", "PUBLISH_QUIZ", "ADD_QUESTION"
    meta JSONB,              -- info suplimentare (ex: { "questionId": 10 })
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_professor_logs_professor_id ON professor_logs(professor_id);
CREATE INDEX IF NOT EXISTS idx_professor_logs_quiz_id ON professor_logs(quiz_id);
