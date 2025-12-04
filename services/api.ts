import { Note } from "../types/Note";

// Simple unique ID generator (React Native compatible)
const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
};

// Groq API configuration - called directly from client
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1";

class ApiService {
  // Structure raw text into organized note using Groq AI
  async structureNote(
    rawText: string,
    noteType: "text" | "voice"
  ): Promise<Note> {
    if (!GROQ_API_KEY) {
      throw new Error(
        "GROQ_API_KEY is not configured. Please add EXPO_PUBLIC_GROQ_API_KEY to your .env file."
      );
    }

    const prompt = `You are an intelligent note-taking AI. Analyze this ${
      noteType === "voice" ? "voice transcription" : "text input"
    } and create a beautifully formatted note.

INPUT: "${rawText}"

AUTO-DETECT the type and generate appropriate HTML content:
- MEETING/EVENT: Show date, time, location, attendees in a nice card format
- TASK: Show task details, due date, priority with checkboxes
- REMINDER: Show reminder time, recurring info
- IDEA: Format as a creative idea card
- LEARNING: Format as study notes with key points
- GENERAL: Clean formatted content

Return JSON:
{
  "title": "Clear title (max 50 chars)",
  "content": "HTML content - use these elements:
    <div class='info-card'> for metadata cards
    <div class='info-row'><span class='icon'>📅</span><span class='label'>Date:</span><span class='value'>...</span></div>
    <div class='info-row'><span class='icon'>📍</span><span class='label'>Location:</span><span class='value'>...</span></div>
    <div class='info-row'><span class='icon'>👥</span><span class='label'>Attendees:</span><span class='value'>...</span></div>
    <div class='info-row'><span class='icon'>⏰</span><span class='label'>Time:</span><span class='value'>...</span></div>
    <div class='info-row'><span class='icon'>🎯</span><span class='label'>Priority:</span><span class='value'>...</span></div>
    <p> for paragraphs
    <ul><li> for lists
    <h3> for section headers
    <strong> for emphasis
    <div class='highlight'> for important info
    Be creative with emojis and formatting!",
  "tags": ["2-4 relevant tags"],
  "category": "meeting|event|task|reminder|idea|learning|personal|work|other",
  "eventDate": "YYYY-MM-DD or null",
  "eventTime": "HH:MM or null",
  "location": "location or null",
  "attendees": ["names"] or [],
  "dueDate": "YYYY-MM-DD or null",
  "priority": "low|medium|high|urgent or null",
  "reminderDate": "YYYY-MM-DD or null",
  "reminderTime": "HH:MM or null",
  "isRecurring": true/false or null,
  "recurrence": "daily|weekly|monthly or null"
}

IMPORTANT:
- Parse dates: "tomorrow", "next Monday", "Dec 12, 2025" → YYYY-MM-DD
- Parse times: "8am", "08:00", "8 in the morning" → HH:MM
- Make the HTML content visually appealing and informative
- Use emojis appropriately
- The content should be self-contained and readable`;

    try {
      const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || "Failed to structure note");
      }

      const data = await response.json();
      const structured = JSON.parse(data.choices[0].message.content || "{}");

      return {
        id: generateId(),
        originalText: rawText,
        title: structured.title || "Untitled Note",
        content: structured.content || `<p>${rawText}</p>`,
        tags: structured.tags || [],
        category: structured.category || "other",
        eventDate: structured.eventDate,
        eventTime: structured.eventTime,
        location: structured.location,
        attendees: structured.attendees,
        dueDate: structured.dueDate,
        priority: structured.priority,
        reminderDate: structured.reminderDate,
        reminderTime: structured.reminderTime,
        isRecurring: structured.isRecurring,
        recurrence: structured.recurrence,
        createdAt: new Date().toISOString(),
        noteType,
      };
    } catch (error: any) {
      console.error("[API] Structure note error:", error);
      throw new Error(error.message || "Failed to structure note");
    }
  }

  // Transcribe audio using Groq Whisper
  async transcribeAudio(
    audioUri: string
  ): Promise<{ text: string; duration: number }> {
    if (!GROQ_API_KEY) {
      throw new Error(
        "GROQ_API_KEY is not configured. Please add EXPO_PUBLIC_GROQ_API_KEY to your .env file."
      );
    }

    try {
      const audioResponse = await fetch(audioUri);
      const audioBlob = await audioResponse.blob();

      const formData = new FormData();
      formData.append("file", audioBlob, "recording.m4a");
      formData.append("model", "whisper-large-v3");

      const response = await fetch(`${GROQ_API_URL}/audio/transcriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || "Transcription failed");
      }

      const data = await response.json();
      return {
        text: data.text,
        duration: data.duration || 0,
      };
    } catch (error: any) {
      console.error("[API] Transcription error:", error);
      throw new Error(error.message || "Failed to transcribe audio");
    }
  }

  // Find related notes using AI
  async findRelatedNotes(
    currentNote: Note,
    otherNotes: Note[]
  ): Promise<string[]> {
    if (!GROQ_API_KEY || otherNotes.length === 0) {
      return [];
    }

    const prompt = `Given this note:
Title: "${currentNote.title}"
Tags: ${currentNote.tags?.join(", ") || "none"}

Find related notes. Return JSON: { "relatedIds": ["id1", "id2"] }

Other notes:
${otherNotes
  .slice(0, 20)
  .map(
    (n) =>
      `- ID: ${n.id}, Title: "${n.title}", Tags: ${
        n.tags?.join(", ") || "none"
      }`
  )
  .join("\n")}`;

    try {
      const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          max_tokens: 512,
        }),
      });

      if (!response.ok) return [];

      const data = await response.json();
      const result = JSON.parse(
        data.choices[0].message.content || '{"relatedIds":[]}'
      );
      return result.relatedIds || [];
    } catch {
      return [];
    }
  }
}

export const api = new ApiService();
