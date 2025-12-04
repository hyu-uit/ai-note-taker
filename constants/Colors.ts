const primaryPurple = '#6366F1';
const lightPurple = '#E8E9FF';
const textPrimary = '#1F2937';
const textSecondary = '#6B7280';
const background = '#F9FAFB';
const white = '#FFFFFF';
const success = '#10B981';
const warning = '#F59E0B';
const error = '#EF4444';

export const Colors = {
  light: {
    text: textPrimary,
    textSecondary: textSecondary,
    background: background,
    cardBackground: white,
    tint: primaryPurple,
    lightTint: lightPurple,
    icon: textSecondary,
    tabIconDefault: textSecondary,
    tabIconSelected: primaryPurple,
    border: '#E5E7EB',
    success: success,
    warning: warning,
    error: error,
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#111827',
    cardBackground: '#1F2937',
    tint: primaryPurple,
    lightTint: '#312E81',
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryPurple,
    border: '#374151',
    success: success,
    warning: warning,
    error: error,
  },
};

export const CategoryColors: { [key: string]: string } = {
  meeting: '#3B82F6',
  idea: '#8B5CF6',
  task: '#10B981',
  learning: '#F59E0B',
  personal: '#EC4899',
  work: '#6366F1',
  other: '#6B7280',
};
