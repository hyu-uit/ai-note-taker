import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { NoteCard } from '@/components/NoteCard';
import { NoteDetailModal } from '@/components/NoteDetailModal';
import { useNotes } from '@/context/NotesContext';
import { Note } from '@/types/Note';

export default function SearchScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { notes, searchNotes } = useNotes();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim()) {
        setSearchResults(notes);
        return;
      }
      
      setIsSearching(true);
      const results = await searchNotes(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, notes]);

  const handleNotePress = (note: Note) => {
    setSelectedNote(note);
    setDetailModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Search Notes</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by title, content, or tags..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Ionicons
            name="close-circle"
            size={20}
            color={colors.textSecondary}
            onPress={() => setSearchQuery('')}
          />
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.tint} />
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery 
                ? 'Try a different search term' 
                : 'Create your first note to get started'}
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
              {searchResults.length} note{searchResults.length !== 1 ? 's' : ''}
            </Text>
            {searchResults.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPress={() => handleNotePress(note)}
              />
            ))}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  resultCount: {
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 14,
  },
});
