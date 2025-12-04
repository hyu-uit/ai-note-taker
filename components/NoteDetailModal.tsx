import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { Colors, CategoryColors } from "../constants/Colors";
import { Note } from "../types/Note";
import { formatDistanceToNow, format } from "date-fns";
import { useNotes } from "../context/NotesContext";

interface NoteDetailModalProps {
  note: Note | null;
  visible: boolean;
  onClose: () => void;
}

export function NoteDetailModal({
  note,
  visible,
  onClose,
}: NoteDetailModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { deleteNote } = useNotes();
  const [webViewHeight, setWebViewHeight] = useState(300);

  if (!note) return null;

  const categoryColor = CategoryColors[note.category] || CategoryColors.other;

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

  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteNote(note.id);
          onClose();
        },
      },
    ]);
  };

  // Generate HTML with styling - includes script to measure height
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html, body {
          width: 100%;
          overflow-x: hidden;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 0;
          margin: 0;
          color: ${colorScheme === "dark" ? "#F9FAFB" : "#1F2937"};
          background: transparent;
          font-size: 16px;
          line-height: 1.6;
        }
        .info-card {
          background: ${
            colorScheme === "dark"
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.04)"
          };
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          border: 1px solid ${
            colorScheme === "dark"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.08)"
          };
        }
        .info-row {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid ${
            colorScheme === "dark"
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)"
          };
        }
        .info-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .info-row:first-child {
          padding-top: 0;
        }
        .icon {
          font-size: 18px;
          margin-right: 12px;
          width: 28px;
          text-align: center;
        }
        .label {
          color: ${colorScheme === "dark" ? "#9CA3AF" : "#6B7280"};
          font-size: 14px;
          margin-right: 8px;
          min-width: 80px;
        }
        .value {
          color: ${colorScheme === "dark" ? "#F9FAFB" : "#1F2937"};
          font-weight: 500;
          flex: 1;
        }
        p {
          margin-bottom: 12px;
        }
        h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 20px 0 12px 0;
          color: ${categoryColor};
        }
        h4 {
          font-size: 16px;
          font-weight: 600;
          margin: 16px 0 10px 0;
          color: ${colorScheme === "dark" ? "#F9FAFB" : "#1F2937"};
        }
        ul, ol {
          padding-left: 24px;
          margin-bottom: 12px;
        }
        li {
          margin-bottom: 8px;
        }
        .highlight {
          background: ${categoryColor}20;
          border-left: 4px solid ${categoryColor};
          padding: 12px 16px;
          border-radius: 0 8px 8px 0;
          margin: 12px 0;
        }
        strong, b {
          font-weight: 600;
          color: ${categoryColor};
        }
        .task-item {
          display: flex;
          align-items: flex-start;
          padding: 8px 0;
        }
        .task-checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid ${categoryColor};
          border-radius: 4px;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .priority-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .priority-urgent { background: #FEE2E2; color: #DC2626; }
        .priority-high { background: #FED7AA; color: #EA580C; }
        .priority-medium { background: #FEF3C7; color: #D97706; }
        .priority-low { background: #D1FAE5; color: #059669; }
        
        /* Ensure emojis render properly */
        .emoji {
          font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
        }
      </style>
    </head>
    <body>
      <div id="content">
        ${note.content || `<p>${note.originalText}</p>`}
      </div>
      <script>
        // Send height to React Native after content loads
        function sendHeight() {
          const height = document.getElementById('content').scrollHeight;
          window.ReactNativeWebView.postMessage(JSON.stringify({ height: height + 20 }));
        }
        
        // Send height on load and after images load
        window.onload = sendHeight;
        setTimeout(sendHeight, 100);
        setTimeout(sendHeight, 500);
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height && data.height > 50) {
        setWebViewHeight(Math.max(data.height, 100));
      }
    } catch (e) {
      // Ignore parse errors
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[styles.container, { backgroundColor: colors.cardBackground }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.handle} />
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {/* Category Badge */}
          <View style={styles.categoryRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryColor + "20" },
              ]}
            >
              <Ionicons
                name={getCategoryIcon()}
                size={16}
                color={categoryColor}
              />
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
              </Text>
            </View>
            <View
              style={[styles.typeBadge, { backgroundColor: colors.lightTint }]}
            >
              <Ionicons
                name={note.noteType === "voice" ? "mic" : "create"}
                size={14}
                color={colors.tint}
              />
              <Text style={[styles.typeText, { color: colors.tint }]}>
                {note.noteType === "voice" ? "Voice" : "Text"}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {note.title}
          </Text>

          {/* Date */}
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {format(new Date(note.createdAt), "MMMM d, yyyy · h:mm a")} ·{" "}
            {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
          </Text>

          {/* Dynamic HTML Content */}
          <View style={[styles.webViewContainer, { height: webViewHeight }]}>
            <WebView
              source={{ html: htmlContent }}
              style={styles.webView}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              originWhitelist={["*"]}
              onMessage={handleWebViewMessage}
              javaScriptEnabled={true}
            />
          </View>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <View style={styles.tagsContainer}>
                {note.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={[styles.tag, { backgroundColor: colors.lightTint }]}
                  >
                    <Text style={[styles.tagText, { color: colors.tint }]}>
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
  },
  headerActions: {
    position: "absolute",
    right: 16,
    top: 12,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    marginBottom: 20,
  },
  webViewContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  tagsSection: {
    marginTop: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
