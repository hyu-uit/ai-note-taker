import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { VoiceRecordButton } from './VoiceRecordButton';
import { useNotes } from '../context/NotesContext';
import { Note } from '../types/Note';

interface CreateNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onNoteCreated?: (note: Note) => void;
}

type InputMode = 'choice' | 'text' | 'voice' | 'processing' | 'preview';

export function CreateNoteModal({ visible, onClose, onNoteCreated }: CreateNoteModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { structureText, structureVoice } = useNotes();

  const [mode, setMode] = useState<InputMode>('choice');
  const [textInput, setTextInput] = useState('');
  const [createdNote, setCreatedNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState('');

  const resetModal = () => {
    setMode('choice');
    setTextInput('');
    setCreatedNote(null);
    setError(null);
    setProcessingMessage('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    setMode('processing');
    setProcessingMessage('Structuring your thoughts...');
    setError(null);

    try {
      const note = await structureText(textInput);
      setCreatedNote(note);
      setMode('preview');
      onNoteCreated?.(note);
    } catch (err: any) {
      setError(err.message || 'Failed to structure note');
      setMode('text');
    }
  };

  const handleVoiceRecording = async (uri: string) => {
    setMode('processing');
    setProcessingMessage('Transcribing your voice...');
    setError(null);

    try {
      const note = await structureVoice(uri);
      setCreatedNote(note);
      setMode('preview');
      onNoteCreated?.(note);
    } catch (err: any) {
      setError(err.message || 'Failed to process voice note');
      setMode('voice');
    }
  };

  const renderContent = () => {
    switch (mode) {
      case 'choice':
        return (
          <View style={styles.choiceContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              Capture a thought
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Just speak or type - we'll organize it for you
            </Text>

            <View style={styles.optionButtons}>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: colors.lightTint }]}
                onPress={() => setMode('voice')}
              >
                <Ionicons name="mic" size={32} color={colors.tint} />
                <Text style={[styles.optionText, { color: colors.tint }]}>Voice</Text>
                <Text style={[styles.optionHint, { color: colors.textSecondary }]}>
                  Ramble freely
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: colors.lightTint }]}
                onPress={() => setMode('text')}
              >
                <Ionicons name="create" size={32} color={colors.tint} />
                <Text style={[styles.optionText, { color: colors.tint }]}>Text</Text>
                <Text style={[styles.optionHint, { color: colors.textSecondary }]}>
                  Type it out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'text':
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.textContainer}
          >
            <Text style={[styles.title, { color: colors.text }]}>
              Write your thoughts
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Don't worry about organization - just write
            </Text>

            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Start typing... meeting notes, random ideas, anything!"
              placeholderTextColor={colors.textSecondary}
              multiline
              value={textInput}
              onChangeText={setTextInput}
              autoFocus
            />

            {error && (
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.backButton, { borderColor: colors.border }]}
                onPress={() => setMode('choice')}
              >
                <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: textInput.trim() ? colors.tint : colors.border },
                ]}
                onPress={handleTextSubmit}
                disabled={!textInput.trim()}
              >
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                <Text style={styles.submitText}>Structure It</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        );

      case 'voice':
        return (
          <View style={styles.voiceContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              Record your thoughts
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Speak naturally - we'll transcribe and organize
            </Text>

            <View style={styles.voiceRecorderArea}>
              <VoiceRecordButton onRecordingComplete={handleVoiceRecording} />
            </View>

            {error && (
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            )}

            <TouchableOpacity
              style={[styles.backButtonFull, { borderColor: colors.border }]}
              onPress={() => setMode('choice')}
            >
              <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>
                Back
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'processing':
        return (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={[styles.processingText, { color: colors.text }]}>
              {processingMessage}
            </Text>
            <Text style={[styles.processingHint, { color: colors.textSecondary }]}>
              AI is transforming your thoughts into organized notes
            </Text>
          </View>
        );

      case 'preview':
        return (
          <ScrollView style={styles.previewContainer}>
            <View style={styles.successHeader}>
              <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={32} color={colors.success} />
              </View>
              <Text style={[styles.successText, { color: colors.success }]}>
                Note structured!
              </Text>
            </View>

            {createdNote && (
              <View style={[styles.previewCard, { backgroundColor: colors.background }]}>
                <Text style={[styles.previewTitle, { color: colors.text }]}>
                  {createdNote.title}
                </Text>
                <Text style={[styles.previewSummary, { color: colors.textSecondary }]}>
                  {createdNote.summary}
                </Text>

                <View style={styles.tagContainer}>
                  {createdNote.tags?.map((tag, index) => (
                    <View
                      key={index}
                      style={[styles.tag, { backgroundColor: colors.lightTint }]}
                    >
                      <Text style={[styles.tagText, { color: colors.tint }]}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {createdNote.actionItems?.length > 0 && (
                  <View style={styles.actionItemsSection}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                      Action Items
                    </Text>
                    {createdNote.actionItems.map((item, index) => (
                      <View key={index} style={styles.actionItem}>
                        <Ionicons name="checkbox-outline" size={16} color={colors.tint} />
                        <Text style={[styles.actionItemText, { color: colors.text }]}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.tint }]}
              onPress={handleClose}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.header}>
          <View style={styles.handle} />
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {renderContent()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  choiceContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  optionButton: {
    width: 140,
    height: 160,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionHint: {
    fontSize: 12,
  },
  textContainer: {
    flex: 1,
    padding: 24,
  },
  textInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 200,
    maxHeight: 300,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  voiceContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  voiceRecorderArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonFull: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  processingHint: {
    fontSize: 14,
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    padding: 24,
  },
  successHeader: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 20,
    fontWeight: '600',
  },
  previewCard: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  previewSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionItemsSection: {
    marginTop: 8,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionItemText: {
    fontSize: 14,
    flex: 1,
  },
  doneButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});
