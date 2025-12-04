import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Platform, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CreateNoteModal } from '@/components/CreateNoteModal';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [createModalVisible, setCreateModalVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.tabIconDefault,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              height: 88,
              paddingBottom: 28,
            },
            default: {
              height: 64,
              paddingBottom: 8,
            },
          }),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'search' : 'search-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: '',
            tabBarIcon: () => (
              <View style={[styles.createButton, { backgroundColor: colors.tint }]}>
                <Ionicons name="mic" size={28} color="#FFFFFF" />
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setCreateModalVisible(true);
            },
          }}
        />
        <Tabs.Screen
          name="threads"
          options={{
            title: 'Threads',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'git-branch' : 'git-branch-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: 'Learn',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'school' : 'school-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>

      <CreateNoteModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
