🎓 GradeFlow — Smart Quiz Platform with Real-Time Evaluation & Analytics

GradeFlow este o aplicație web modernă pentru administrarea, susținerea și evaluarea quiz-urilor educaționale.
Platforma oferă o experiență completă atât pentru profesori, cât și pentru studenți:
	•	creare quiz-uri și întrebări
	•	sesiuni live cu cod de acces
	•	progres individual cu timp-limită
	•	evaluare automată a răspunsurilor
	•	rezultate detaliate
	•	clasament și analytics
	•	istoric personal pentru studenți
	•	export CSV pentru profesori

⸻

🚀 Tech Stack

Frontend
	•	React
	•	TypeScript
	•	React Router
	•	TailwindCSS
	•	Axios

Backend
	•	Node.js
	•	Express.js
	•	PostgreSQL
	•	JWT Authentication
	•	json2csv (pentru export CSV)

⸻

📁 Structura proiectului

Backend: controllers, routes, repositories, middleware, db, app.js
Frontend: pages (auth, professor, student), components, api, App.tsx

⸻

✨ Funcționalități principale

🧑‍🏫 Profesor

Creare și gestionare quiz-uri
	•	adăugare titlu, descriere, timp-limită
	•	generare automată cod pentru sesiune

Gestionare întrebări
	•	întrebări single-choice
	•	întrebări multiple-choice
	•	ordonarea pozițiilor

Sesiuni LIVE
	•	pornire sesiune cu cod
	•	monitorizare live a studenților
	•	vizualizare scoruri în timp real

Analytics
	•	clasament studenți
	•	procent de finalizare
	•	scor mediu
	•	analiza fiecărei întrebări
	•	procentaj de răspunsuri corecte

Export CSV

Export complet al rezultatelor sesiunii:
email, scor, finalizare, timpul de terminare

Istoric sesiuni

Profesorul poate vizualiza toate sesiunile precedente.

⸻

🎓 Student

Dashboard
	•	istoric complet al tuturor quiz-urilor finalizate

Join sesiune
	•	acces prin cod unic oferit de profesor

Workflow complet
	•	întrebări afișate una câte una
	•	timer dacă quiz-ul are limită de timp
	•	trimitere răspunsuri
	•	rezultate finale + detalii pentru fiecare întrebare
	•	clasament studenți

⸻

🛠 Instalare și Rulare

Backend
	1.	Accesezi folderul backend
	2.	Instalezi dependențele (npm install)
	3.	Pornești serverul (npm start)

Serverul rulează la adresa: http://localhost:7050

⸻

Frontend
	1.	Accesezi folderul frontend
	2.	Instalezi dependențele (npm install)
	3.	Rulezi aplicația (npm run dev)

Aplicația rulează la: http://localhost:5173

⸻

🔐 Autentificare (JWT)
	•	toate rutele sunt protejate prin token
	•	middleware-ul verifică rolul utilizatorului (profesor/student)
	•	token-ul se trimite în header: Authorization: Bearer TOKEN

⸻

🧠 Arhitectura Backend

controllers – logica de aplicare (Session, Quiz, Student)
repositories – interogări SQL structurate
routes – definirea endpoint-urilor API
middleware – autentificare + verificare roluri
db – conexiune și gestionare PostgreSQL

⸻

🔥 Fluxul unei sesiuni live
	1.	Profesorul creează un quiz
	2.	Profesorul pornește o sesiune (se generează cod)
	3.	Studentul introduce codul în aplicație
	4.	Serverul validează studentul și îl înscrie la sesiune
	5.	Studentul primește întrebările în ordine
	6.	Fiecare răspuns este evaluat automat
	7.	La final se generează scorul
	8.	Studentul vede rezultatele și clasamentul
	9.	Profesorul vede analytics + poate exporta CSV

⸻

📊 Dashboard Statistics (Profesor)

Backend calculează:
	•	numărul total de quiz-uri create
	•	numărul total de întrebări din toate quiz-urile
	•	numărul total de studenți evaluați

Cardurile din dashboard afișează aceste valori.

⸻

📌 API Endpoints (Principale)

Auth
	•	register
	•	login

Profesor
	•	listare quiz-uri
	•	creare, editare, ștergere quiz
	•	gestionare întrebări
	•	pornire sesiune live
	•	rezultate sesiune
	•	analytics întrebări
	•	export CSV
	•	statistici dashboard

Student
	•	join session
	•	preluare întrebări + timer
	•	trimitere răspuns
	•	rezultate finale
	•	clasament
	•	istoric personal

⸻

🤖 Modul AI (Versiune viitoare)

Planificat pentru versiunea completă:
	•	analiză automată a performanței studentului
	•	recomandări personalizate
	•	generare automată întrebări
	•	interpretare scor per întrebare
	•	diagrame inteligente

⸻

📝 TODO (viitor)
	•	UI pentru raport PDF
	•	modul AI complet
	•	feedback pentru studenți pe întrebări greșite
	•	mod prezentare live pentru profesori
	•	sistem badge-uri & gamificare

⸻

✨ Contributors

Proiect realizat de: Preda Slavoliub-Denis

⸻

🏁 Concluzie

GradeFlow este o platformă completă și scalabilă, care oferă o experiență profesională de evaluare digitală.
Proiectul este ideal pentru:
	•	instituții educaționale
	•	prezentări universitare
	•	portofoliu de programare
	•	dezvoltare ulterioară cu modul AI