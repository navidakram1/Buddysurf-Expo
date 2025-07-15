export const COLORS = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  red: {
    500: '#ef4444',
    600: '#dc2626',
  },
  blue: {
    500: '#3b82f6',
  },
  yellow: {
    500: '#f59e0b',
  },
  purple: {
    500: '#8b5cf6',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 36,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const ACTIVITY_CATEGORIES = [
  { id: 'sports', name: 'Sports', icon: 'basketball', color: COLORS.red[500] },
  { id: 'social', name: 'Social', icon: 'people', color: COLORS.blue[500] },
  { id: 'food', name: 'Food', icon: 'restaurant', color: COLORS.yellow[500] },
  { id: 'outdoor', name: 'Outdoor', icon: 'leaf', color: COLORS.primary[500] },
  { id: 'learning', name: 'Learning', icon: 'book', color: COLORS.purple[500] },
];

export const SERVICE_CATEGORIES = [
  { id: 'tutoring', name: 'Tutoring', icon: 'school' },
  { id: 'fitness', name: 'Fitness', icon: 'fitness' },
  { id: 'tech', name: 'Tech', icon: 'laptop' },
  { id: 'creative', name: 'Creative', icon: 'brush' },
  { id: 'home', name: 'Home', icon: 'home' },
];

export const NOTIFICATION_TYPES = {
  CHAT: 'chat',
  ACTIVITY: 'activity',
  FRIEND_REQUEST: 'friend_request',
  SYSTEM: 'system',
};

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  ACTIVITY_IMAGES: 'activity-images',
  SERVICE_IMAGES: 'service-images',
  CHAT_MEDIA: 'chat-media',
};
