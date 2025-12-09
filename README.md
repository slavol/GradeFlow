# 🎓 GradeFlow — Smart Quiz Platform with Real-Time Evaluation & Analytics

**GradeFlow** este o aplicație web modernă, completă și scalabilă, concepută pentru **administrarea, susținerea și evaluarea quiz-urilor educaționale** în timp real. Platforma oferă o experiență profesională de evaluare digitală, fiind ideală pentru instituții educaționale, prezentări universitare și portofolii de programare.

## ✨ Funcționalități Cheie

GradeFlow oferă o suită de funcționalități pentru a eficientiza procesul de evaluare, atât pentru **Profesori** (🧑‍🏫), cât și pentru **Studenți** (🎓).

### 🧑‍🏫 Profesor (Teacher)

* **Creare & Gestionare Quiz-uri:** Adăugare titlu, descriere, timp-limită și generare automată a codului unic pentru sesiune.
* **Gestionare Întrebări:** Suport pentru întrebări **single-choice** și **multiple-choice**, cu posibilitatea de ordonare a pozițiilor.
* **Sesiuni LIVE:**
    * Pornire sesiune cu cod de acces.
    * **Monitorizare live** a studenților și vizualizare a scorurilor în timp real.
* **Analytics Detaliat:**
    * **Clasament** studenți.
    * Procent de **finalizare**, **scor mediu**.
    * Analiza performanței pe **fiecare întrebare** (procentaj de răspunsuri corecte).
* **Export CSV:** Export complet al rezultatelor sesiunii (email, scor, status finalizare, timpul de terminare).
* **Istoric Sesiuni:** Vizualizarea tuturor sesiunilor precedente.

### 🎓 Student (Student)

* **Dashboard Personal:** Istoric complet al tuturor quiz-urilor finalizate.
* **Join Sesiune:** Acces rapid prin codul unic oferit de profesor.
* **Workflow Complet:**
    * Întrebări afișate **una câte una**.
    * **Timer** pentru quiz-urile cu limită de timp.
    * Evaluare automată imediat după trimiterea răspunsului.
    * **Rezultate finale** detaliate și **clasament** la încheierea sesiunii.

---

## 🚀 Tehnologii Utilizate (Tech Stack)

| Componentă | Tehnologii | Descriere |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, React Router, TailwindCSS, Axios | Interfață dinamică, modernă și tipizată, cu stilizare rapidă. |
| **Backend** | Node.js, Express.js, PostgreSQL | Server API robust, bază de date relațională fiabilă. |
| **Autentificare** | JWT (JSON Web Tokens) | Protejarea rutelor și verificare roluri (`profesor`/`student`). |
| **Utilități** | json2csv | Modul pentru exportul rapid al rezultatelor în format CSV. |

---

## 🧠 Arhitectura Backend

Proiectul folosește o structură de fișiere clară, bazată pe separarea responsabilităților (MVC-like pattern), pentru a asigura mentenabilitatea și scalabilitatea.

* `controllers`: Logica de aplicare (ex: `Session`, `Quiz`, `Student`).
* `routes`: Definirea endpoint-urilor API.
* `repositories`: Interogări SQL structurate pentru interacțiunea cu baza de date.
* `middleware`: Gestionarea autentificării JWT și a verificării rolurilor.
* `db`: Conexiunea și gestionarea bazei de date PostgreSQL.
* `app.js`: Fișierul principal de configurare a serverului.

### 🔄 Fluxul unei Sesiuni Live

1.  **Profesorul** creează un quiz.
2.  **Profesorul** pornește o sesiune LIVE (se generează un cod de acces).
3.  **Studentul** introduce codul în aplicație (`Join Session`).
4.  **Serverul** validează studentul și îl înscrie la sesiune.
5.  **Studentul** parcurge întrebările și trimite răspunsurile.
6.  Fiecare răspuns este **evaluat automat** de către backend.
7.  La final, se generează **scorul final** și **clasamentul**.
8.  **Profesorul** vizualizează analytics-ul și poate **exporta CSV**.

---

## 🛠 Instalare și Rulare

Pentru a rula proiectul local, urmați pașii de mai jos:

### ⚙️ 1. Backend

1.  Accesați folderul `backend`:
    ```bash
    cd backend
    ```
2.  Instalați dependențele:
    ```bash
    npm install
    ```
3.  Porniți serverul (necesită o instanță de PostgreSQL configurată):
    ```bash
    npm start
    ```
    > Serverul rulează la adresa: **http://localhost:7050**

### 💻 2. Frontend

1.  Accesați folderul `frontend`:
    ```bash
    cd ../frontend
    ```
2.  Instalați dependențele:
    ```bash
    npm install
    ```
3.  Rulați aplicația:
    ```bash
    npm run dev
    ```
    > Aplicația rulează la adresa: **http://localhost:5173**

---

## 📌 API Endpoints Principale

Toate rutele sunt protejate prin middleware de autentificare (JWT) și verificare rol (`profesor`/`student`). Token-ul se trimite în header-ul `Authorization: Bearer TOKEN`.

| Categorie | Rute Principale (Exemple) |
| :--- | :--- |
| **Auth** | `/register`, `/login` |
| **Profesor** | `/quizzes` (listare, creare), `/quizzes/:id/questions`, `/sessions/start`, `/sessions/:id/results`, `/dashboard/stats` |
| **Student** | `/sessions/join`, `/sessions/:id/questions`, `/sessions/:id/submit`, `/personal-history` |

---

## 🤖 Modul AI (Versiune Viitoare)

Planificat pentru dezvoltare ulterioară, modulul AI va aduce îmbunătățiri semnificative:

* Analiză automată a performanței studenților.
* Recomandări personalizate de învățare.
* Generare automată de întrebări.
* Diagrame inteligente și interpretări avansate ale scorurilor.

---

## ✨ Contributor

Proiect realizat de: **Preda Slavoliub-Denis**