import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, CategoryColors } from '@/constants/Colors';
import { useNotes } from '@/context/NotesContext';

export default function ThreadsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { notes } = useNotes();

  const tagCounts: { [key: string]: number } = {};
  const categoryCounts: { [key: string]: number } = {};

  notes.forEach(note => {
    note.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    categoryCounts[note.category] = (categoryCounts[note.category] || 0) + 1;
  });

  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const sortedCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Threads</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your notes, connected by themes
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {notes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="git-branch-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No threads yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Create notes to see automatic connections
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                By Category
              </Text>
              <View style={styles.grid}>
                {sortedCategories.map(([category, count]) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryCard,
                      { 
                        backgroundColor: colors.cardBackground,
                        borderColor: CategoryColors[category] + '40',
                        borderWidth: 1,
                      }
                    ]}
                  >
                    <View 
                      style={[
                        styles.categoryIcon, 
                        { backgroundColor: CategoryColors[category] + '20' }
                      ]}
                    >
                      <Ionicons 
                        name={getCategoryIcon(category)} 
                        size={20} 
                        color={CategoryColors[category]} 
                      />
                    </View>
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                    <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
                      {count} note{count !== 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {sortedTags.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Top Tags
                </Text>
                <View style={styles.tagsContainer}>
                  {sortedTags.map(([tag, count]) => (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagChip, { backgroundColor: colors.lightTint }]}
                    >
                      <Text style={[styles.tagText, { color: colors.tint }]}>
                        #{tag}
                      </Text>
                      <View style={[styles.tagCount, { backgroundColor: colors.tint }]}>
                        <Text style={styles.tagCountText}>{count}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Thought Threads
              </Text>
              <View style={[styles.comingSoon, { backgroundColor: colors.cardBackground }]}>
                <Ionicons name="sparkles" size={24} color={colors.tint} />
                <Text style={[styles.comingSoonTitle, { color: colors.text }]}>
                  AI Connections Coming Soon
                </Text>
                <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
                  We'll automatically discover connections between your notes and surface relevant past thoughts
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getCategoryIcon(category: string): keyof typeof Ionicons.glyphMap {
  switch (category) {
    case 'meeting': return 'people';
    case 'idea': return 'bulb';
    case 'task': return 'checkbox';
    case 'learning': return 'book';
    case 'personal': return 'heart';
    case 'work': return 'briefcase';
    default: return 'document-text';
  }
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
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  comingSoon: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  comingSoonText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
});
