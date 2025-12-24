-- CreateEnum
CREATE TYPE "SessionMode" AS ENUM ('LIVE', 'ALL');

-- CreateTable
CREATE TABLE "options" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER,
    "text" TEXT NOT NULL,
    "is_correct" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER,
    "title" TEXT NOT NULL,
    "question_type" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "position" INTEGER DEFAULT 0,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" SERIAL NOT NULL,
    "result_id" INTEGER,
    "question_id" INTEGER,
    "option_id" INTEGER,
    "is_correct" BOOLEAN,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_results" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER,
    "quiz_id" INTEGER,
    "score" INTEGER DEFAULT 0,
    "started_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(6),

    CONSTRAINT "quiz_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_sessions" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER,
    "professor_id" INTEGER,
    "session_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "mode" "SessionMode" NOT NULL DEFAULT 'LIVE',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" SERIAL NOT NULL,
    "professor_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "time_limit" INTEGER DEFAULT 0,
    "creation_type" TEXT NOT NULL,
    "join_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_answers" (
    "id" SERIAL NOT NULL,
    "student_session_id" INTEGER,
    "question_id" INTEGER,
    "selected_option_ids" INTEGER[],
    "is_correct" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_sessions" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER,
    "student_id" INTEGER,
    "score" INTEGER DEFAULT 0,
    "current_index" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN DEFAULT false,
    "started_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_sessions_session_code_key" ON "quiz_sessions"("session_code");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_join_code_key" ON "quizzes"("join_code");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_session_student" ON "student_sessions"("session_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "quiz_results"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_student_session_id_fkey" FOREIGN KEY ("student_session_id") REFERENCES "student_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student_sessions" ADD CONSTRAINT "student_sessions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "quiz_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student_sessions" ADD CONSTRAINT "student_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
