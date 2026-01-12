const mammoth = require("mammoth");

let pdfParse;
try {
  pdfParse = require("pdf-parse/lib/pdf-parse.js");
} catch (e) {
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