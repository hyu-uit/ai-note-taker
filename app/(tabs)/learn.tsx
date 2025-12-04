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
import { Colors } from '@/constants/Colors';
import { useNotes } from '@/context/NotesContext';

export default function LearnScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { notes } = useNotes();

  const learningNotes = notes.filter(n => n.category === 'learning');
  const notesWithActions = notes.filter(n => n.actionItems && n.actionItems.length > 0);
  const totalActionItems = notesWithActions.reduce((acc, n) => acc + (n.actionItems?.length || 0), 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Learn</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Reinforce knowledge from your notes
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="document-text" size={24} color={colors.tint} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{notes.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Notes</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="book" size={24} color="#F59E0B" />
            <Text style={[styles.statNumber, { color: colors.text }]}>{learningNotes.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Learning Notes</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="checkbox" size={24} color="#10B981" />
            <Text style={[styles.statNumber, { color: colors.text }]}>{totalActionItems}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Action Items</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Learning Mode
          </Text>
          
          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colors.cardBackground }]}
          >
            <View style={[styles.featureIcon, { backgroundColor: colors.lightTint }]}>
              <Ionicons name="flash" size={24} color={colors.tint} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Quick Quiz
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                Test your knowledge with AI-generated questions from your notes
              </Text>
            </View>
            <View style={[styles.comingBadge, { backgroundColor: colors.tint + '20' }]}>
              <Text style={[styles.comingText, { color: colors.tint }]}>Coming Soon</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colors.cardBackground }]}
          >
            <View style={[styles.featureIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="repeat" size={24} color="#F59E0B" />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Spaced Repetition
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                Review notes at optimal intervals for long-term retention
              </Text>
            </View>
            <View style={[styles.comingBadge, { backgroundColor: '#F59E0B20' }]}>
              <Text style={[styles.comingText, { color: '#F59E0B' }]}>Coming Soon</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colors.cardBackground }]}
          >
            <View style={[styles.featureIcon, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="trending-up" size={24} color="#10B981" />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Progress Tracking
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                See what you're mastering vs. forgetting over time
              </Text>
            </View>
            <View style={[styles.comingBadge, { backgroundColor: '#10B98120' }]}>
              <Text style={[styles.comingText, { color: '#10B981' }]}>Coming Soon</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Daily Digest
          </Text>
          
          <View style={[styles.digestCard, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="sunny" size={32} color="#F59E0B" />
            <Text style={[styles.digestTitle, { color: colors.text }]}>
              Your Daily Summary
            </Text>
            <Text style={[styles.digestDesc, { color: colors.textSecondary }]}>
              {notes.length > 0 
                ? `You've captured ${notes.length} thought${notes.length !== 1 ? 's' : ''}. Keep building your second brain!`
                : 'Start capturing thoughts to see your daily digest'}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
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
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  comingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingText: {
    fontSize: 10,
    fontWeight: '600',
  },
  digestCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  digestTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  digestDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
