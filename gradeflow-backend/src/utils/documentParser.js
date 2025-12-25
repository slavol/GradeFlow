const mammoth = require("mammoth");

// IMPORTANT:
// pdf-parse@1.1.1 are un index.js care citește un fișier de test la require()
// => folosim direct implementarea din lib ca să evităm ENOENT.
let pdfParse;
try {
  pdfParse = require("pdf-parse/lib/pdf-parse.js");
} catch (e) {
  // fallback (dacă structura diferă)
  const mod = require("pdf-parse");
  pdfParse = mod?.default ?? mod;
}

async function extractText(file) {
  const mime = file.mimetype;

  if (mime === "application/pdf") {
    if (typeof pdfParse !== "function") {
      throw new Error("pdf-parse is not available as a function.");
    }
    const data = await pdfParse(file.buffer);
    return data?.text ?? "";
  }

  if (
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const res = await mammoth.extractRawText({ buffer: file.buffer });
    return res?.value ?? "";
  }

  throw new Error(`Unsupported file type: ${mime}`);
}

module.exports = { extractText };