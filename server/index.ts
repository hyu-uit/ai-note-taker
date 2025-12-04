import express from "express";
import cors from "cors";
import multer from "multer";
import Groq from "groq-sdk";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Using Groq's free API with Llama model for chat and Whisper for transcription
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const upload = multer({
  dest: "/tmp/uploads/",
  limits: { fileSize: 25 * 1024 * 1024 },
});

// In-memory storage for notes (in production, use a database)
let notes: any[] = [];

// Structure raw text into organized note
app.post("/api/structure-note", async (req, res) => {
  try {
    const { rawText, noteType } = req.body;

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ error: "No text provided" });
    }

    const prompt = `You are a smart note-taking assistant. Take this raw ${
      noteType === "voice" ? "voice transcription" : "text input"
    } and transform it into a well-structured note.

Raw input:
"${rawText}"

Please respond with JSON in this exact format:
{
  "title": "A clear, concise title (max 50 chars)",
  "summary": "A 2-3 sentence summary of the main points",
  "structuredContent": "The full content, organized with proper formatting. Use bullet points for lists, separate paragraphs for different ideas.",
  "actionItems": ["array of action items extracted from the note, empty if none"],
  "tags": ["array of 2-4 relevant topic tags"],
  "category": "one of: meeting, idea, task, learning, personal, work, other"
}

Keep the user's voice and intent while making it more organized and readable.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 2048,
    });

    const structured = JSON.parse(response.choices[0].message.content || "{}");

    res.json({
      id: uuidv4(),
      originalText: rawText,
      ...structured,
      createdAt: new Date().toISOString(),
      noteType,
    });
  } catch (error: any) {
    console.error("Error structuring note:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to structure note" });
  }
});

// Transcribe audio file
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const audioReadStream = fs.createReadStream(req.file.path);

    const transcription = await groq.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-large-v3",
    });

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.json({
      text: transcription.text,
      duration: (transcription as any).duration || 0,
    });
  } catch (error: any) {
    console.error("Error transcribing:", error);
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    res
      .status(500)
      .json({ error: error.message || "Failed to transcribe audio" });
  }
});

// Save note
app.post("/api/notes", (req, res) => {
  try {
    const note = {
      ...req.body,
      id: req.body.id || uuidv4(),
      createdAt: req.body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = notes.findIndex((n) => n.id === note.id);
    if (existingIndex >= 0) {
      notes[existingIndex] = note;
    } else {
      notes.unshift(note);
    }

    res.json(note);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all notes
app.get("/api/notes", (req, res) => {
  res.json(notes);
});

// Search notes
app.get("/api/notes/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.json(notes);
    }

    const searchLower = q.toLowerCase();
    const filtered = notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(searchLower) ||
        note.summary?.toLowerCase().includes(searchLower) ||
        note.structuredContent?.toLowerCase().includes(searchLower) ||
        note.originalText?.toLowerCase().includes(searchLower) ||
        note.tags?.some((tag: string) =>
          tag.toLowerCase().includes(searchLower)
        )
    );

    res.json(filtered);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Find related notes using AI
app.post("/api/notes/find-related", async (req, res) => {
  try {
    const { noteId } = req.body;
    const currentNote = notes.find((n) => n.id === noteId);

    if (!currentNote || notes.length < 2) {
      return res.json([]);
    }

    const otherNotes = notes.filter((n) => n.id !== noteId).slice(0, 20);

    if (otherNotes.length === 0) {
      return res.json([]);
    }

    const prompt = `Given this note:
Title: "${currentNote.title}"
Content: "${
      currentNote.summary || currentNote.structuredContent?.slice(0, 200)
    }"
Tags: ${currentNote.tags?.join(", ") || "none"}

Find which of these other notes are related. Return JSON with format: { "relatedIds": ["id1", "id2"] }
Only include notes that are genuinely related by topic, theme, or context.

Other notes:
${otherNotes
  .map(
    (n) =>
      `- ID: ${n.id}, Title: "${n.title}", Tags: ${
        n.tags?.join(", ") || "none"
      }`
  )
  .join("\n")}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 512,
    });

    const result = JSON.parse(
      response.choices[0].message.content || '{"relatedIds":[]}'
    );
    res.json(result.relatedIds || []);
  } catch (error: any) {
    console.error("Error finding related notes:", error);
    res.json([]);
  }
});

// Delete note
app.delete("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  notes = notes.filter((n) => n.id !== id);
  res.json({ success: true });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", notesCount: notes.length });
});

const PORT = parseInt(process.env.PORT || "3001", 10);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`SmartNote AI backend running on port ${PORT}`);
});
