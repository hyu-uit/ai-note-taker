import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';

interface VoiceRecordButtonProps {
  onRecordingComplete: (uri: string) => void;
  disabled?: boolean;
}

export function VoiceRecordButton({ onRecordingComplete, disabled }: VoiceRecordButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Please grant microphone permission to record voice notes');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setDuration(0);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      setDuration(0);
      
      if (uri) {
        onRecordingComplete(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={[styles.durationContainer, { backgroundColor: colors.error + '20' }]}>
          <View style={[styles.recordingDot, { backgroundColor: colors.error }]} />
          <Text style={[styles.durationText, { color: colors.error }]}>
            {formatDuration(duration)}
          </Text>
        </View>
      )}
      
      <Animated.View style={{ transform: [{ scale: isRecording ? pulseAnim : 1 }] }}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isRecording ? colors.error : colors.tint }
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isRecording ? 'stop' : 'mic'} 
            size={28} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </Animated.View>
      
      {!isRecording && (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Tap to record
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
});
