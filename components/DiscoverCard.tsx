import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { DiscoverItem } from '../types/Note';

interface DiscoverCardProps {
  item: DiscoverItem;
  onPress?: () => void;
}

export function DiscoverCard({ item, onPress }: DiscoverCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (item.type) {
      case 'resurfacing': return 'bulb';
      case 'thread': return 'git-branch';
      case 'explore': return 'compass';
      default: return 'sparkles';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={getIcon()} size={20} color={item.color} />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
});
