import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface HeaderProps {
  onSearchPress?: () => void;
  onThreadsPress?: () => void;
  onSettingsPress?: () => void;
}

export function Header({ onSearchPress, onThreadsPress, onSettingsPress }: HeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.logoContainer}>
        <View style={[styles.logoIcon, { backgroundColor: colors.tint }]}>
          <Ionicons name="flash" size={18} color="#FFFFFF" />
        </View>
        <Text style={[styles.logoText, { color: colors.text }]}>SmartNote AI</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={onSearchPress}
        >
          <Ionicons name="search-outline" size={22} color={colors.icon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={onThreadsPress}
        >
          <Ionicons name="git-branch-outline" size={22} color={colors.icon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={onSettingsPress}
        >
          <Ionicons name="settings-outline" size={22} color={colors.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
});
