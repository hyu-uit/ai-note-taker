import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface QuickNoteInputProps {
  onPress: () => void;
}

export function QuickNoteInput({ onPress }: QuickNoteInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity 
        style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
          Quick note...
        </Text>
        <View style={[styles.addButton, { backgroundColor: colors.tint }]}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
      
      <Text style={[styles.tagline, { color: colors.textSecondary }]}>
        "Capture chaos. Retrieve clarity."
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingLeft: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  placeholder: {
    fontSize: 16,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
});
