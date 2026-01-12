const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("Missing GEMINI_API_KEY in environment");

const genAI = new GoogleGenerativeAI(apiKey);

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
});

function stripCodeFences(s) {
  return String(s || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function normalizeGeminiQuestions(arr) {
  if (!Array.isArray(arr)) return [];

  return arr.map((q) => {
    const options = Array.isArray(q?.options) ? q.options : [];

    return {
      title: String(q?.title ?? q?.text ?? "").trim(),
      question_type:
        String(q?.question_type ?? "single").toLowerCase() === "multiple"
          ? "multiple"
          : "single",
      options: options.map((o) => ({
        text: String(o?.text ?? "").trim(),
        is_correct: Boolean(o?.is_correct),
      })),
    };
  });
}

async function generateQuestionsFromText(text) {
  const prompt = `
Ești un asistent educațional.

Pe baza conținutului de mai jos, generează întrebări pentru un quiz.

Reguli:
- Returnează DOAR JSON valid (fără markdown, fără backticks)
- NU include explicații
- Formatul de ieșire: un array (listă) de întrebări
- Fiecare întrebare trebuie să respecte exact acest format:
[
  {
    "title": "Textul întrebării",
    "question_type": "single" | "multiple",
    "options": [
      { "text": "Opțiunea A", "is_correct": true | false }
    ]
  }
]

Cerințe:
- Întrebările și opțiunile să fie în limba română
- Întrebările să fie relevante pentru specializarea Informatică (secția română)
- Formulează întrebări clare, fără ambiguități
- Opțiunile să fie plauzibile (să nu fie evident care e răspunsul corect)
- Pentru "single" să existe exact o opțiune corectă
- Pentru "multiple" să existe cel puțin 2 opțiuni corecte

Conținut:
"""
${text}
"""
`.trim();

  const result = await model.generateContent(prompt);
  const raw = result?.response?.text?.() ?? "";

  const cleaned = stripCodeFences(raw);

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini raw output:", raw);
    throw new Error("Invalid JSON returned by Gemini");
  }

  return normalizeGeminiQuestions(parsed);
}

async function generateExplanationForWrongAnswer({
  questionTitle,
  questionType,
  options,
  selectedOptions,
  correctOptions,
}) {
  const prompt = `
Ești un asistent educațional pentru studenți.

Sarcină:
Explică pe scurt și clar de ce răspunsul ales este greșit și de ce răspunsul corect este corect.

Reguli:
- Răspunde în română
- Fără markdown, fără liste cu bullet-uri dacă nu e nevoie
- Maxim ~10 propoziții
- Menționează explicit care este răspunsul corect (ca text)

Întrebare:
"${questionTitle}"

Tip întrebare: ${questionType}

Opțiuni:
${options.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Răspuns ales de student:
${selectedOptions.length ? selectedOptions.join(" | ") : "(nimic selectat)"}

Răspuns corect:
${correctOptions.join(" | ")}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return (response.text() || "").trim();
}

module.exports = {
  generateQuestionsFromText,
  generateExplanationForWrongAnswer,
};