export const ROUTES = {
  // Tab Routes
  HOME: '/(tabs)/index' as const,
  SEARCH: '/(tabs)/search' as const,
  CART: '/(tabs)/cart' as const,
  PROFILE: '/(tabs)/profile' as const,
  
  // Auth Routes
  SIGN_IN: '/(auth)/sign-in' as const,
  SIGN_UP: '/(auth)/sign-up' as const,
  
  // Other Routes
  EDIT_PROFILE: '/edit-profile' as const,
} as const;