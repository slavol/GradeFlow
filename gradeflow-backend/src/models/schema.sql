
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
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('single','multiple')),
  created_at TIMESTAMP DEFAULT NOW(),
  position INTEGER DEFAULT 0          
);


CREATE TABLE options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

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

INSERT INTO users (email, password, role)
VALUES ('prof@test.com', 'parola123', 'professor');


CREATE TABLE quiz_sessions (
  id SERIAL PRIMARY KEY,
  quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
  professor_id INT REFERENCES users(id) ON DELETE CASCADE,
  session_code TEXT UNIQUE NOT NULL,                          
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'closed')),                   
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE student_sessions (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,                                    
  current_index INTEGER NOT NULL DEFAULT 0,                   
  completed BOOLEAN DEFAULT false,                           
  started_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT uniq_session_student UNIQUE (session_id, student_id)
);


CREATE TABLE student_answers (
  id SERIAL PRIMARY KEY,
  student_session_id INTEGER REFERENCES student_sessions(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_ids INTEGER[] NOT NULL,                     
  is_correct BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
