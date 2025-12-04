import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Note } from "../types/Note";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const STORAGE_KEY = "@google_auth_token";

interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

interface CalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: { email: string }[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: string; minutes: number }[];
  };
}

class GoogleCalendarService {
  private tokens: GoogleTokens | null = null;

  // Load saved tokens from storage
  async loadTokens(): Promise<GoogleTokens | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.tokens = JSON.parse(stored);
        return this.tokens;
      }
    } catch (e) {
      console.error("Failed to load Google tokens:", e);
    }
    return null;
  }

  // Save tokens to storage
  async saveTokens(tokens: GoogleTokens): Promise<void> {
    this.tokens = tokens;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }

  // Clear tokens (logout)
  async clearTokens(): Promise<void> {
    this.tokens = null;
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  // Check if connected
  async isConnected(): Promise<boolean> {
    const tokens = await this.loadTokens();
    return !!tokens?.accessToken;
  }

  // Get access token
  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  // Set tokens after OAuth
  async setTokensFromAuth(
    accessToken: string,
    refreshToken?: string
  ): Promise<void> {
    await this.saveTokens({
      accessToken,
      refreshToken,
      expiresAt: Date.now() + 3600 * 1000, // 1 hour
    });
  }

  // Create calendar event from note
  async createEventFromNote(
    note: Note
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    if (!this.tokens?.accessToken) {
      return { success: false, error: "Not connected to Google Calendar" };
    }

    if (!note.eventDate) {
      return { success: false, error: "No event date specified" };
    }

    try {
      // Build event object
      const event: CalendarEvent = {
        summary: note.title,
        description: `${
          note.content?.replace(/<[^>]*>/g, " ").trim() || ""
        }\n\n---\nCreated from SmartNote AI`,
        location: note.location,
        start: {},
        end: {},
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 30 },
            { method: "popup", minutes: 10 },
          ],
        },
      };

      // Set start/end times
      if (note.eventTime) {
        // Event with specific time
        const startDateTime = `${note.eventDate}T${note.eventTime}:00`;
        const endTime = note.eventEndTime || this.addHours(note.eventTime, 1);
        const endDateTime = `${note.eventDate}T${endTime}:00`;

        event.start = {
          dateTime: startDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        event.end = {
          dateTime: endDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      } else {
        // All-day event
        event.start = { date: note.eventDate };
        event.end = { date: note.eventDate };
      }

      // Add attendees if available (would need email validation)
      // For now, just include them in description
      if (note.attendees && note.attendees.length > 0) {
        event.description = `Attendees: ${note.attendees.join(", ")}\n\n${
          event.description
        }`;
      }

      // Call Google Calendar API
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.tokens.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Calendar API error:", error);

        if (response.status === 401) {
          // Token expired
          await this.clearTokens();
          return {
            success: false,
            error: "Session expired. Please reconnect Google Calendar.",
          };
        }

        return {
          success: false,
          error: error.error?.message || "Failed to create event",
        };
      }

      const data = await response.json();
      return { success: true, eventId: data.id };
    } catch (error: any) {
      console.error("Create event error:", error);
      return {
        success: false,
        error: error.message || "Failed to create event",
      };
    }
  }

  // Helper to add hours to time string
  private addHours(time: string, hours: number): string {
    const [h, m] = time.split(":").map(Number);
    const newHour = (h + hours) % 24;
    return `${String(newHour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // Get upcoming events (for display)
  async getUpcomingEvents(maxResults: number = 10): Promise<any[]> {
    if (!this.tokens?.accessToken) {
      return [];
    }

    try {
      const now = new Date().toISOString();
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
          `maxResults=${maxResults}&orderBy=startTime&singleEvents=true&timeMin=${now}`,
        {
          headers: {
            Authorization: `Bearer ${this.tokens.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.items || [];
    } catch {
      return [];
    }
  }
}

export const googleCalendar = new GoogleCalendarService();

// Hook for Google Sign-In
export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });

  return {
    request,
    response,
    promptAsync,
    isReady: !!request,
  };
}
