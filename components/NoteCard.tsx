import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, CategoryColors } from "../constants/Colors";
import { Note } from "../types/Note";
import { formatDistanceToNow } from "date-fns";

// Extract plain text preview from HTML content
const getPreviewText = (content: string, maxLength: number = 80): string => {
  if (!content) return "";
  // Remove HTML tags and get plain text
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + "...";
};

// Get quick info based on note type
const getQuickInfo = (note: Note): string | null => {
  if (note.eventDate) {
    return `📅 ${note.eventDate}${
      note.eventTime ? ` at ${note.eventTime}` : ""
    }`;
  }
  if (note.dueDate) {
    return `⏰ Due: ${note.dueDate}`;
  }
  if (note.reminderDate) {
    return `🔔 ${note.reminderDate}${
      note.reminderTime ? ` at ${note.reminderTime}` : ""
    }`;
  }
  if (note.location) {
    return `📍 ${note.location}`;
  }
  return null;
};

interface NoteCardProps {
  note: Note;
  onPress?: () => void;
  linkedCount?: number;
}

export function NoteCard({ note, onPress, linkedCount = 0 }: NoteCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const categoryColor = CategoryColors[note.category] || CategoryColors.other;

  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(note.createdAt), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const getCategoryIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (note.category) {
      case "meeting":
      case "event":
        return "calendar";
      case "idea":
        return "bulb";
      case "task":
        return "checkbox";
      case "reminder":
        return "alarm";
      case "learning":
        return "book";
      case "personal":
        return "heart";
      case "work":
        return "briefcase";
      default:
        return "document-text";
    }
  };

  const quickInfo = getQuickInfo(note);
  const preview = getPreviewText(note.content || note.originalText);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: categoryColor + "20" },
          ]}
        >
          <Ionicons name={getCategoryIcon()} size={18} color={categoryColor} />
        </View>

        <View style={styles.content}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {note.title}
          </Text>

          {quickInfo && (
            <Text
              style={[styles.quickInfo, { color: categoryColor }]}
              numberOfLines={1}
            >
              {quickInfo}
            </Text>
          )}

          <Text
            style={[styles.preview, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {preview}
          </Text>

          <View style={styles.footer}>
            <Text style={[styles.time, { color: colors.textSecondary }]}>
              {getTimeAgo()}
            </Text>
            {note.tags && note.tags.length > 0 && (
              <View style={styles.tagsPreview}>
                {note.tags.slice(0, 2).map((tag, index) => (
                  <Text
                    key={index}
                    style={[styles.tagText, { color: colors.tint }]}
                  >
                    #{tag}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  quickInfo: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  time: {
    fontSize: 12,
  },
  tagsPreview: {
    flexDirection: "row",
    gap: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
