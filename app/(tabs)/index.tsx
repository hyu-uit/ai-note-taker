import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Header } from "@/components/Header";
import { QuickNoteInput } from "@/components/QuickNoteInput";
import { NoteCard } from "@/components/NoteCard";
import { DiscoverCard } from "@/components/DiscoverCard";
import { CreateNoteModal } from "@/components/CreateNoteModal";
import { NoteDetailModal } from "@/components/NoteDetailModal";
import { CalendarSettings } from "@/components/CalendarSettings";
import { useNotes } from "@/context/NotesContext";
import { Note } from "@/types/Note";

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { notes, loading, discoverItems, refreshNotes } = useNotes();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotes();
    setRefreshing(false);
  };

  const handleNotePress = (note: Note) => {
    setSelectedNote(note);
    setDetailModalVisible(true);
  };

  const recentNotes = notes.slice(0, 5);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <Header
        onSearchPress={() => router.push("/(tabs)/search")}
        onThreadsPress={() => router.push("/(tabs)/threads")}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <QuickNoteInput onPress={() => setCreateModalVisible(true)} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Notes
            </Text>
            {notes.length > 5 && (
              <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
                <Text style={[styles.viewAll, { color: colors.tint }]}>
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {recentNotes.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No notes yet
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
                Tap the input above to capture your first thought
              </Text>
            </View>
          ) : (
            recentNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPress={() => handleNotePress(note)}
                linkedCount={Math.floor(Math.random() * 4)}
              />
            ))
          )}
        </View>

        {discoverItems.length > 0 && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, marginLeft: 16 },
              ]}
            >
              Discover
            </Text>
            {discoverItems.map((item) => (
              <DiscoverCard key={item.id} item={item} />
            ))}
          </View>
        )}

        {/* Google Calendar Integration */}
        <CalendarSettings />

        <View style={{ height: 100 }} />
      </ScrollView>

      <CreateNoteModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />

      <NoteDetailModal
        note={selectedNote}
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedNote(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    marginHorizontal: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
});
