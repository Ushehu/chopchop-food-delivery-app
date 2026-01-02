import React, { useState, useEffect, useCallback } from 'react';
import { 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  View, 
  Text, 
  TouchableOpacity, 
  RefreshControl,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ProfileInfoCard } from '@/components/profile/ProfileInfoCard';
import { ActionButtons } from '@/components/profile/ActionButtons';
import {
  fetchUserProfile,
  updateUserAvatar,
  logoutUser,
  type UserInfo,
} from '@/lib/appwrite/profile.service';

// ============================================
// TYPES
// ============================================
interface ProfileState {
  userInfo: UserInfo;
  isLoading: boolean;
  isRefreshing: boolean;
  isUploadingAvatar: boolean;
  error: string | null;
}

// ============================================
// CONSTANTS
// ============================================
const INITIAL_USER_INFO: UserInfo = {
  fullName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
};

const IMAGE_PICKER_OPTIONS = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1] as [number, number],
  quality: 0.8,
};


// ============================================
// MAIN COMPONENT
// ============================================
const Profile: React.FC = () => {
  // ============================================
  // STATE
  // ============================================
  const [state, setState] = useState<ProfileState>({
    userInfo: INITIAL_USER_INFO,
    isLoading: true,
    isRefreshing: false,
    isUploadingAvatar: false,
    error: null,
  });

  // ============================================
  // LIFECYCLE
  // ============================================
  
  // Load profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Reload profile when screen comes into focus (after edit)
  useFocusEffect(
    useCallback(() => {
      // Reload silently when returning from edit screen
      if (!state.isLoading) {
        loadUserProfile(true);
      }
    }, [state.isLoading])
  );

  // ============================================
  // DATA LOADING
  // ============================================
  
  /**
   * Load user profile from Appwrite
   * @param silent - If true, don't show loading spinner
   */
  const loadUserProfile = async (silent = false) => {
    try {
      if (!silent) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
      }
      
      const profile = await fetchUserProfile();
      
      setState(prev => ({ 
        ...prev, 
        userInfo: profile, 
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to load profile';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
      
      if (!silent) {
        Alert.alert(
          'Error',
          'Failed to load your profile. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  /**
   * Refresh profile data (pull-to-refresh)
   */
  const handleRefresh = async () => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true }));
      const profile = await fetchUserProfile();
      setState(prev => ({ 
        ...prev, 
        userInfo: profile, 
        isRefreshing: false,
        error: null 
      }));
    } catch (err) {
      setState(prev => ({ ...prev, isRefreshing: false }));
      Alert.alert('Error', 'Failed to refresh profile.');
    }
  };

  // ============================================
  // NAVIGATION HANDLERS
  // ============================================
  
  const handleBackPress = () => {
  if (router.canGoBack()) {
    router.back();
  }
  // Stays on profile if no history
};

  const handleSearchPress = () => {
    router.push('/(tabs)/search');
  };

  const handleEditProfile = () => {
    router.push({
      pathname: '/(tabs)/edit-profile',
      params: {
        fullName: state.userInfo.fullName,
        email: state.userInfo.email,
        phone: state.userInfo.phone,
        address1: state.userInfo.address1,
        address2: state.userInfo.address2,
      },
    } as any);
  };

  // ============================================
  // IMAGE PICKER
  // ============================================
  
  /**
   * Request camera or gallery permissions
   */
  const requestPermissions = async (
    type: 'camera' | 'library'
  ): Promise<boolean> => {
    try {
      const permission = type === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          `We need ${type === 'camera' ? 'camera' : 'photo library'} access to update your profile picture.`,
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (err) {
      console.error('Permission request error:', err);
      return false;
    }
  };

  /**
   * Pick image from camera
   */
  const pickImageFromCamera = async () => {
    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS);

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Camera error:', err);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  /**
   * Pick image from library
   */
  const pickImageFromLibrary = async () => {
    const hasPermission = await requestPermissions('library');
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Library error:', err);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  /**
   * Upload avatar to Appwrite Storage
   */
  const uploadAvatar = async (imageUri: string) => {
    try {
      setState(prev => ({ ...prev, isUploadingAvatar: true }));
      
      // Upload to Appwrite
      const updatedAvatarUrl = await updateUserAvatar(imageUri);
      
      // Update local state
      setState(prev => ({ 
        ...prev, 
        userInfo: { ...prev.userInfo, avatarUrl: updatedAvatarUrl },
        isUploadingAvatar: false 
      }));
      
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (err) {
      setState(prev => ({ ...prev, isUploadingAvatar: false }));
      console.error('Avatar upload error:', err);
      Alert.alert(
        'Error', 
        'Failed to update profile photo. Please try again.'
      );
    }
  };

  /**
   * Show avatar edit options
   */
  const handleEditAvatar = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: pickImageFromCamera,
        },
        {
          text: 'Choose from Library',
          onPress: pickImageFromLibrary,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // ============================================
  // LOGOUT
  // ============================================
  
  /**
   * Show logout confirmation
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout,
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Perform logout and navigate to sign-in
   */
  const performLogout = async () => {
    try {
      // Delete Appwrite session
      await logoutUser();
      
      // Navigate to sign-in (replace to prevent back)
      router.replace('/(auth)/sign-in');
      
      // Show success message
      setTimeout(() => {
        Alert.alert('Success', 'Logged out successfully!');
      }, 500);
    } catch (err) {
      console.error('Logout error:', err);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  // ============================================
  // RENDER STATES
  // ============================================
  
  // Loading state
  if (state.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white-100">
        <ProfileHeader 
          onBackPress={handleBackPress}
          onSearchPress={handleSearchPress}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FE8C00" />
          <Text className="text-sm font-quicksand text-gray-100 mt-4">
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (state.error && !state.userInfo.fullName) {
    return (
      <SafeAreaView className="flex-1 bg-white-100">
        <ProfileHeader 
          onBackPress={handleBackPress}
          onSearchPress={handleSearchPress}
        />
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-6xl mb-4">😔</Text>
          <Text className="text-lg font-quicksand-semibold text-black text-center mb-2">
            Oops! Something went wrong
          </Text>
          <Text className="text-base font-quicksand text-gray-100 text-center mb-6">
            {state.error}
          </Text>
          <TouchableOpacity 
            className="bg-primary px-8 py-4 rounded-full"
            onPress={() => loadUserProfile()}
            activeOpacity={0.7}
          >
            <Text className="text-white font-quicksand-semibold text-base">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  return (
    <SafeAreaView className="flex-1 bg-white-100">
      <ProfileHeader 
        onBackPress={handleBackPress}
        onSearchPress={handleSearchPress}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={state.isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#FE8C00"
            colors={['#FE8C00']}
          />
        }
      >
        <ProfileAvatar 
          imageSource={
            state.userInfo.avatarUrl 
              ? { uri: state.userInfo.avatarUrl }
              : require('@/assets/icons/person.png')
          }
          onEditPress={handleEditAvatar}
          isUploading={state.isUploadingAvatar}
        />

        <ProfileInfoCard userInfo={state.userInfo} />

        <ActionButtons 
          onEditPress={handleEditProfile}
          onLogoutPress={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;