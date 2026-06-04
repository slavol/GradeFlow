# 🎓 GradeFlow — Platformă Smart de Quiz-uri (LIVE) cu AI, Evaluare în Timp Real & Analytics

**GradeFlow** este o aplicație web completă pentru **crearea, rularea și evaluarea quiz-urilor** în timp real, cu roluri separate pentru **Profesori (🧑‍🏫)** și **Studenți (🎓)**. Include **sesiuni LIVE**, **analytics detaliat**, **export CSV**, plus un modul **AI (Gemini)** pentru:
- generarea automată de întrebări din documente (PDF/DOCX) pentru profesori
- explicații pentru răspunsuri greșite (cu **cache în DB**) pentru studenți

---

## 📌 Cuprins
- [Funcționalități](#-funcționalități)
  - [Profesor](#-profesor)
  - [Student](#-student)
  - [AI](#-ai)
- [Tech Stack](#-tech-stack)
- [Arhitectură](#-arhitectură)
- [Instalare & Rulare Locală](#-instalare--rulare-locală)
  - [Backend](#1-backend)
  - [Frontend](#2-frontend)
- [Variabile de Mediu](#-variabile-de-mediu)
- [API (Endpoints principale)](#-api-endpoints-principale)
- [Database (Prisma)](#-database-prisma)
- [Troubleshooting](#-troubleshooting)
- [Autor](#-autor)

---

## ✨ Funcționalități

### 🧑‍🏫 Profesor
- **Creare & Gestionare Quiz-uri**
  - titlu, descriere, limită de timp
  - tip creare: `manual` / `ai`
- **Gestionare Întrebări**
  - suport **single-choice** / **multiple-choice**
  - opțiuni multiple, marcarea răspunsului corect
  - ordonare prin câmpul `position`
- **Sesiuni LIVE**
  - pornire sesiune + cod unic de acces
  - monitorizare status (studenți, scoruri, finalizare)
- **Analytics detaliat**
  - clasament (ordonat după scor și timp)
  - procent finalizare, scor mediu
  - performanță pe întrebare (rata de răspuns corect)
- **Export CSV**
  - export rezultate (email, scor, status finalizare, finished_at)
- **Istoric sesiuni**
  - vizualizarea sesiunilor rulate anterior

### 🎓 Student
- **Dashboard personal**
  - istoric sesiuni finalizate
- **Join sesiune**
  - acces rapid cu codul de sesiune
- **Rulare quiz**
  - întrebări **una câte una**
  - **timer** pentru quiz-urile cu limită de timp
  - evaluare automată a răspunsului
- **Rezultate finale**
  - scor + procent
  - răspunsuri detaliate (ales vs corect)
  - clasament la final

### 🤖 AI
- **Profesor: generare întrebări din document**
  - upload **PDF/DOCX** → extragere text (pdf-parse / mammoth) → Gemini → întrebări normalizate
- **Student: explicație pentru răspuns greșit (cu cache)**
  - dacă studentul a răspuns greșit la o întrebare, poate cere o explicație
  - explicația este **salvată în DB** (`student_answers.explanation_text`, `explanation_created_at`)
  - la refresh / cereri ulterioare, explicația este returnată din cache (fără cost AI)

---

## 🧰 Tech Stack

**Frontend**
- React + TypeScript
- React Router
- TailwindCSS
- Axios
- Heroicons

**Backend**
- Node.js + Express.js
- PostgreSQL
- Prisma ORM
- JWT Auth + Role Guard (`professor` / `student`)
- Multer (upload fișiere)
- pdf-parse + mammoth (extragere text)
- json2csv (export CSV)

**AI**
- Google Gemini (`@google/generative-ai`)
- Model configurabil prin `GEMINI_MODEL` (ex: `gemini-2.5-flash`)

---

## 🏗 Arhitectură

Structură backend orientată pe separarea responsabilităților:
- `controllers/` — logică API (quiz, sesiuni, rezultate, AI)
- `routes/` — definirea rutelor (order matters)
- `repositories/` — acces DB (Prisma)
- `middleware/` — auth JWT, verificare rol, upload
- `services/` — integrare Gemini + utilitare
- `utils/` — parsare documente (PDF/DOCX)
- `prisma/` — schema + client

---

## 🛠 Instalare & Rulare Locală

### 1) Backend

```bash
cd gradeflow-backend
npm install
```

**1. Configurează `.env`** (vezi secțiunea [Variabile de Mediu](#-variabile-de-mediu))

**2. Prisma (migrări + client)**

```bash
npx prisma generate
npx prisma migrate dev
```

**3. Pornește serverul**

```bash
npm start
```

Serverul rulează pe:
- `http://localhost:7050`

---

### 2) Frontend

```bash
cd gradeflow-frontend
npm install
npm run dev
```

Aplicația rulează pe:
- `http://localhost:5173`

---

## 🔐 Variabile de Mediu

### Backend (`gradeflow-backend/.env`)

```env
# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/gradeflow?schema=public"

# JWT
JWT_SECRET="your_super_secret"

# Gemini
GEMINI_API_KEY="your_gemini_api_key"
# optional
GEMINI_MODEL="gemini-2.5-flash"

# optional (port)
PORT=7050
```

> Dacă nu setezi `GEMINI_MODEL`, aplicația folosește implicit `gemini-2.5-flash`.

---

## 🌐 API Endpoints Principale

> Toate rutele protejate cer header:
>
> `Authorization: Bearer <TOKEN>`

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Profesor — Quiz
- `POST /professor/create` — creează quiz
- `POST /professor/quiz/:quizId/questions` — adaugă întrebări
- `GET  /professor/quizzes` — listare quiz-uri
- `GET  /professor/quiz/:quizId` — detalii quiz

### Profesor — Sesiuni LIVE
- `POST /professor/session/start` — pornește sesiune pentru un quiz
- `GET  /professor/session/:sessionId` — status sesiune (live)
- `GET  /professor/session/:sessionId/results` — rezultate + analytics
- `GET  /professor/session/:sessionId/export-csv` — export CSV
- `GET  /professor/stats` — stats dashboard

### Profesor — AI (generare întrebări din document)
- `POST /ai/professor/generate-questions`
  - `multipart/form-data` cu `file` (PDF/DOCX)
  - (opțional) `hint` / instrucțiuni (dacă este suportat în frontend)

**Răspuns (exemplu):**
```json
{
  "success": true,
  "questions": [
    {
      "title": "Întrebare...",
      "question_type": "single",
      "options": [
        { "text": "A", "is_correct": false },
        { "text": "B", "is_correct": true }
      ]
    }
  ]
}
```

### Student — Sesiuni
- `POST /student/session/join` — intră în sesiune (cu `sessionCode`)
- `GET  /student/session/:id` — întrebare curentă + status
- `POST /student/session/:id/answer` — trimite răspuns (pe întrebare)
- `POST /student/session/:id/answer/all` — trimite toate răspunsurile (dacă e folosit)
- `GET  /student/session/:id/results` — rezultate + detalii + clasament
- `GET  /student/session/history` — istoric student

### Student — AI (explicație pentru răspuns greșit, cu cache)
- `POST /student/session/:sessionId/explanation/:questionId`

**Răspuns (exemplu):**
```json
{
  "success": true,
  "cached": true,
  "session_id": 12,
  "question_id": 3,
  "explanation": "Explicația...",
  "explanation_created_at": "2025-01-01T10:00:00.000Z",
  "selected_options": ["..."],
  "correct_options": ["..."]
}
```

---

## 🗄 Database (Prisma)

Baza de date este PostgreSQL, gestionată prin Prisma.

### Cache AI (Student)
În `student_answers` există câmpuri pentru cache:
- `explanation_text` (Text)
- `explanation_created_at` (DateTime)

Flux:
1. Student cere explicație pentru o întrebare greșită
2. Backend verifică dacă există `explanation_text`
3. Dacă există → returnează direct (cached)
4. Dacă nu → generează cu Gemini și salvează în DB



---

## 👤 Autor

Proiect realizat de: **Preda Slavoliub-Denis**
SDLC Hub webhook test
