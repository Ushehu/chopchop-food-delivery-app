export const MESSAGES = {
  ERROR: {
    LOAD_PROFILE: 'Failed to load your profile. Please try again.',
    REFRESH_PROFILE: 'Failed to refresh profile.',
    UPDATE_AVATAR: 'Failed to update profile photo.',
    LOGOUT: 'Failed to logout. Please try again.',
    CAMERA: 'Failed to take photo. Please try again.',
    LIBRARY: 'Failed to select photo. Please try again.',
  },
  SUCCESS: {
    AVATAR_UPDATED: 'Profile photo updated successfully!',
    LOGOUT: 'Logged out successfully!',
  },
  PERMISSION: {
    TITLE: 'Permission Required',
    CAMERA: 'We need camera access to update your profile picture.',
    LIBRARY: 'We need photo library access to update your profile picture.',
  },
} as const;