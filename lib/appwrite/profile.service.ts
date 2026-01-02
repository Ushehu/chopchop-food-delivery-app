
import { Account, Databases, Storage, ID, Models } from 'appwrite';
import { client, appwriteConfig } from './config';
import { mapUserDocumentToUser, type UserDocument } from '@/store/auth.store';

// Initialize Appwrite services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Use config values
const DATABASE_ID = appwriteConfig.databaseId;
const USERS_COLLECTION_ID = appwriteConfig.usersCollectionId;
const AVATARS_BUCKET_ID = appwriteConfig.avatarsBucketId;

// ============================================
// TYPES
// ============================================
export interface UserInfo {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  avatarUrl?: string;
  userId?: string;
}

export interface AppwriteUser extends Models.User<Models.Preferences> {
  // Additional Appwrite user fields
}

// ============================================
// PROFILE SERVICE
// ============================================

/**
 * Fetch user profile from Appwrite
 * Combines account data and user document data
 */
export const fetchUserProfile = async (): Promise<UserInfo> => {
  try {
    // Get current account
    const accountData = await account.get();
    
    // Get user document from database
    const userDoc = await databases.getDocument<UserDocument>(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      accountData.$id
    );

    // Get avatar URL if exists
    let avatarUrl: string | undefined;
    if (userDoc.avatarFileId) {
      avatarUrl = storage.getFileView(AVATARS_BUCKET_ID, userDoc.avatarFileId).toString();
    }

    return {
      fullName: userDoc.name || accountData.name || '',
      email: accountData.email || '',
      phone: userDoc.phone || accountData.phone || '',
      address1: userDoc.address1 || '',
      address2: userDoc.address2 || '',
      avatarUrl,
      userId: accountData.$id,
    };
  } catch (error: any) {
    console.error('Appwrite Error - fetchUserProfile:', error);
    
    // If in development and error, return mock data
    if (__DEV__) {
      console.log('🔧 Using mock data in development');
      return {
        fullName: 'Adrian Hajdin',
        email: 'adrian@jsmastery.com',
        phone: '+1 555 123 4567',
        address1: '123 Main Street, Springfield, IL 62704',
        address2: '221B Rose Street, Foodville, FL 12345',
      };
    }
    
    throw new Error(error.message || 'Failed to fetch profile');
  }
};

/**
 * Update user profile in Appwrite
 */
export const updateUserProfile = async (
  profileData: Partial<UserInfo>
): Promise<UserInfo> => {
  try {
    // Get current user ID
    const accountData = await account.get();
    const userId = accountData.$id;

    // Prepare update data (only database fields)
    const updateData: Partial<UserDocument> = {};
    
    if (profileData.fullName !== undefined) {
      updateData.name = profileData.fullName;
      // Also update account name
      await account.updateName(profileData.fullName);
    }
    
    if (profileData.phone !== undefined) {
      updateData.phone = profileData.phone;
    }
    
    if (profileData.address1 !== undefined) {
      updateData.address1 = profileData.address1;
    }
    
    if (profileData.address2 !== undefined) {
      updateData.address2 = profileData.address2;
    }

    // Update user document
    await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId,
      updateData
    );

    // Return updated profile
    return await fetchUserProfile();
  } catch (error: any) {
    console.error('Appwrite Error - updateUserProfile:', error);
    
    // In development, return the updated data
    if (__DEV__) {
      console.log('🔧 Mock update in development');
      return profileData as UserInfo;
    }
    
    throw new Error(error.message || 'Failed to update profile');
  }
};

/**
 * Update user avatar in Appwrite Storage
 */
export const updateUserAvatar = async (imageUri: string): Promise<string> => {
  try {
    // Get current user
    const accountData = await account.get();
    const userId = accountData.$id;

    // Get user document to check for existing avatar
    const userDoc = await databases.getDocument<UserDocument>(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId
    );

    // Delete old avatar if exists
    if (userDoc.avatarFileId) {
      try {
        await storage.deleteFile(AVATARS_BUCKET_ID, userDoc.avatarFileId);
      } catch (err) {
        console.warn('Failed to delete old avatar:', err);
      }
    }

    // Convert image URI to File/Blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Create file name
    const filename = `avatar_${userId}_${Date.now()}.jpg`;
    const file = new File([blob], filename, { type: 'image/jpeg' });

    // Upload new avatar
    const uploadedFile = await storage.createFile(
      AVATARS_BUCKET_ID,
      ID.unique(),
      file
    );

    // Update user document with new avatar file ID
    await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId,
      { avatarFileId: uploadedFile.$id }
    );

    // Return avatar URL
    return storage.getFileView(AVATARS_BUCKET_ID, uploadedFile.$id).toString();
  } catch (error: any) {
    console.error('Appwrite Error - updateUserAvatar:', error);
    
    // In development, return the local image URI
    if (__DEV__) {
      console.log('🔧 Mock avatar upload in development');
      return imageUri;
    }
    
    throw new Error(error.message || 'Failed to upload avatar');
  }
};

/**
 * Logout user from Appwrite
 */
export const logoutUser = async (): Promise<void> => {
  try {
    // Delete current session
    await account.deleteSession('current');
    
    // Clear any local storage if needed
    // await AsyncStorage.removeItem('user');
  } catch (error: any) {
    console.error('Appwrite Error - logoutUser:', error);
    
    // In development, just log and continue
    if (__DEV__) {
      console.log('🔧 Mock logout in development');
      return;
    }
    
    throw new Error(error.message || 'Failed to logout');
  }
};

/**
 * Check if user is authenticated
 */
export const getCurrentUser = async (): Promise<AppwriteUser | null> => {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    return null;
  }
};

/**
 * Fetch user document and convert to store-compatible format
 * Used when you need to update the auth store
 */
export const fetchUserForStore = async (userId: string) => {
  try {
    const userDoc = await databases.getDocument<UserDocument>(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId
    );
    
    // Convert to User type for store
    return mapUserDocumentToUser(userDoc);
  } catch (error: any) {
    console.error('Error fetching user for store:', error);
    throw error;
  }
};