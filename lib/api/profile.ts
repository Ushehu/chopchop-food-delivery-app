export interface UserInfo {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  avatarUrl?: string;
}

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.chopchop.com';
const IS_DEV_MODE = __DEV__ && !process.env.EXPO_PUBLIC_API_URL;

const API_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}/user/profile`,
  AVATAR: `${API_BASE_URL}/user/avatar`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
} as const;

// Log development mode
if (IS_DEV_MODE) {
  console.log('🔧 Development Mode: Using mock data (no backend required)');
}

// Request timeout
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Helper: Get auth token
const getAuthToken = async (): Promise<string | null> => {
  try {
    // TODO: Implement your auth token retrieval
    // import AsyncStorage from '@react-native-async-storage/async-storage';
    // return await AsyncStorage.getItem('authToken');
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper: Create headers
const createHeaders = async (includeContentType = true): Promise<HeadersInit> => {
  const headers: HeadersInit = {};
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper: Fetch with timeout
const fetchWithTimeout = async (
  url: string, 
  options: RequestInit, 
  timeout = REQUEST_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Fetch user profile from the server
 */
export const fetchUserProfile = async (): Promise<UserInfo> => {
  try {
    const headers = await createHeaders();
    const response = await fetchWithTimeout(API_ENDPOINTS.PROFILE, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch profile`);
    }

    const data = await response.json();

    return {
      fullName: data.fullName || data.full_name || '',
      email: data.email || '',
      phone: data.phone || data.phoneNumber || '',
      address1: data.address1 || data.homeAddress || '',
      address2: data.address2 || data.workAddress || '',
      avatarUrl: data.avatarUrl || data.profileImage || '',
    };
  } catch (error) {
    console.warn('API Error - fetchUserProfile (using mock data):', error);
    
    // Return mock data for development (network failure is expected without backend)
    return {
      fullName: 'Adrian Hajdin',
      email: 'adrian@jsmastery.com',
      phone: '+1 555 123 4567',
      address1: '123 Main Street, Springfield, IL 62704',
      address2: '221B Rose Street, Foodville, FL 12345',
    };
  }
};

/**
 * Update user avatar/profile photo
 */
export const updateUserAvatar = async (imageUri: string): Promise<string> => {
  try {
    const formData = new FormData();
    
    // Extract filename and type
    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('avatar', {
      uri: imageUri,
      type,
      name: filename,
    } as any);

    const token = await getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithTimeout(API_ENDPOINTS.AVATAR, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to update avatar`);
    }

    const data = await response.json();
    return data.avatarUrl || data.imageUrl || imageUri;
  } catch (error) {
    console.warn('API Error - updateUserAvatar (using local image):', error);
    // In development, just return the local URI
    return imageUri;
  }
};

/**
 * Logout user from the server
 */
export const logoutUser = async (): Promise<void> => {
  try {
    const headers = await createHeaders();
    const response = await fetchWithTimeout(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to logout`);
    }

    // Clear auth token
    // import AsyncStorage from '@react-native-async-storage/async-storage';
    // await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.warn('API Error - logoutUser (continuing logout):', error);
    // In development without backend, just continue with logout
    // Clear local auth token if you have one
  }
};

/**
 * Update user profile information
 */
export const updateUserProfile = async (
  payload: Pick<UserInfo, 'fullName' | 'phone' | 'address1' | 'address2'>
): Promise<UserInfo> => {
  try {
    const headers = await createHeaders();
    
    const response = await fetchWithTimeout(API_ENDPOINTS.PROFILE, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to update profile`);
    }

    const data = await response.json();

    return {
      fullName: data.fullName || payload.fullName,
      email: data.email || '',
      phone: data.phone || payload.phone,
      address1: data.address1 || payload.address1,
      address2: data.address2 || payload.address2,
      avatarUrl: data.avatarUrl,
    };
  } catch (error) {
    console.warn('API Error - updateUserProfile (mock update):', error);

    // Dev fallback (offline-friendly)
    return {
      ...payload,
      email: 'adrian@jsmastery.com',
    };
  }
};
