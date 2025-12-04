import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Note, DiscoverItem } from "../types/Note";
import { api } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  error: string | null;
  discoverItems: DiscoverItem[];
  addNote: (note: Note) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
  searchNotes: (query: string) => Promise<Note[]>;
  structureText: (text: string) => Promise<Note>;
  structureVoice: (audioUri: string) => Promise<Note>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const STORAGE_KEY = "@smartnote_notes";

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discoverItems, setDiscoverItems] = useState<DiscoverItem[]>([]);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    generateDiscoverItems();
  }, [notes]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (err) {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const saveNotesLocally = async (updatedNotes: Note[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
  };

  const generateDiscoverItems = () => {
    const items: DiscoverItem[] = [];

    if (notes.length > 5) {
      const oldNote = notes[Math.floor(Math.random() * (notes.length - 3)) + 3];
      if (oldNote) {
        items.push({
          id: "resurface-" + oldNote.id,
          type: "resurfacing",
          title: `Resurfacing: ${oldNote.title}`,
          description: `"${(oldNote.content || oldNote.originalText || "")
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 60)}..." might be relevant to your recent work`,
          noteIds: [oldNote.id],
          icon: "lightbulb",
          color: "#F59E0B",
        });
      }
    }

    const tagCounts: { [key: string]: string[] } = {};
    notes.forEach((note) => {
      note.tags?.forEach((tag) => {
        if (!tagCounts[tag]) tagCounts[tag] = [];
        tagCounts[tag].push(note.id);
      });
    });

    const threads = Object.entries(tagCounts)
      .filter(([_, ids]) => ids.length >= 2)
      .slice(0, 2);

    threads.forEach(([tag, ids]) => {
      items.push({
        id: "thread-" + tag,
        type: "thread",
        title: `Thread: ${tag}`,
        description: `${ids.length} notes connected about ${tag}`,
        noteIds: ids,
        icon: "git-branch",
        color: "#8B5CF6",
      });
    });

    const unusedTags = notes
      .flatMap((n) => n.tags || [])
      .filter((tag) => !tagCounts[tag] || tagCounts[tag].length === 1)
      .slice(0, 1);

    if (unusedTags.length > 0) {
      items.push({
        id: "explore-" + unusedTags[0],
        type: "explore",
        title: "Explore More",
        description: `You mentioned "${unusedTags[0]}" but haven't explored it yet`,
        icon: "compass",
        color: "#10B981",
      });
    }

    setDiscoverItems(items.slice(0, 3));
  };

  const addNote = async (note: Note) => {
    try {
      const updatedNotes = [note, ...notes];
      setNotes(updatedNotes);
      await saveNotesLocally(updatedNotes);
    } catch (err) {
      setError("Failed to save note");
      throw err;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const updatedNotes = notes.filter((n) => n.id !== noteId);
      setNotes(updatedNotes);
      await saveNotesLocally(updatedNotes);
    } catch (err) {
      setError("Failed to delete note");
      throw err;
    }
  };

  const refreshNotes = async () => {
    await loadNotes();
  };

  const searchNotes = async (query: string): Promise<Note[]> => {
    if (!query.trim()) return notes;

    const searchLower = query.toLowerCase();
    return notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(searchLower) ||
        note.content?.toLowerCase().includes(searchLower) ||
        note.originalText?.toLowerCase().includes(searchLower) ||
        note.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  };

  const structureText = async (text: string): Promise<Note> => {
    try {
      const structured = await api.structureNote(text, "text");
      await addNote(structured);
      return structured;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const structureVoice = async (audioUri: string): Promise<Note> => {
    try {
      const { text } = await api.transcribeAudio(audioUri);
      const structured = await api.structureNote(text, "voice");
      await addNote(structured);
      return structured;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        error,
        discoverItems,
        addNote,
        deleteNote,
        refreshNotes,
        searchNotes,
        structureText,
        structureVoice,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
