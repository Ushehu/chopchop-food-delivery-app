// ============================================
// lib/appwrite/config.ts
// Appwrite Configuration
// ============================================
import { Client } from 'appwrite';

// Appwrite configuration from environment variables
export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  usersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
  avatarsBucketId: process.env.EXPO_PUBLIC_APPWRITE_AVATARS_BUCKET_ID!,
};

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

// Log configuration in development
if (__DEV__) {
  console.log('🔧 Appwrite Configuration:', {
    endpoint: appwriteConfig.endpoint,
    projectId: appwriteConfig.projectId,
    databaseId: appwriteConfig.databaseId,
  });
}