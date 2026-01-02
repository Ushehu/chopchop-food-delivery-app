// ============================================
// app/(tabs)/edit-profile.tsx
// Edit Profile Screen with Appwrite Integration
// ============================================
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { updateUserProfile } from '@/lib/appwrite/profile.service';

// ============================================
// TYPES
// ============================================
interface EditProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
}

interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  address1?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================
const EditProfile: React.FC = () => {
  // Get params from navigation
  const params = useLocalSearchParams<{
    fullName?: string;
    email?: string;
    phone?: string;
    address1?: string;
    address2?: string;
  }>();

  // ============================================
  // STATE
  // ============================================
  const [formData, setFormData] = useState<EditProfileFormData>({
    fullName: params.fullName || '',
    email: params.email || '',
    phone: params.phone || '',
    address1: params.address1 || '',
    address2: params.address2 || '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // ============================================
  // VALIDATION
  // ============================================
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation (read-only, but validate format)
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Address 1 validation
    if (!formData.address1.trim()) {
      newErrors.address1 = 'Home address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleInputChange = (field: keyof EditProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Save profile changes to Appwrite
   */
  const handleSave = async () => {
    // Validate
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    try {
      setIsSaving(true);
      
      // Update profile in Appwrite
      // Note: Email is managed by Appwrite account and typically requires verification
      // So we only update the fields in the users collection
      await updateUserProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        address1: formData.address1,
        address2: formData.address2,
      });

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to profile
              router.back();
            },
          },
        ]
      );
    } catch (err) {
      console.error('Update profile error:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to update profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle cancel with unsaved changes check
   */
  const handleCancel = () => {
    // Check for changes
    const hasChanges = 
      formData.fullName !== (params.fullName || '') ||
      formData.email !== (params.email || '') ||
      formData.phone !== (params.phone || '') ||
      formData.address1 !== (params.address1 || '') ||
      formData.address2 !== (params.address2 || '');

    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <SafeAreaView className="flex-1 bg-white-100">
      <ProfileHeader
        onBackPress={handleCancel}
        onSearchPress={() => {}} // Disable search in edit mode
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="px-5 pt-6 pb-4">
            <Text className="text-2xl font-quicksand-bold text-black">
              Edit Profile
            </Text>
            <Text className="text-sm font-quicksand text-gray-100 mt-1">
              Update your personal information
            </Text>
          </View>

          {/* Form */}
          <View className="bg-white mx-5 rounded-2xl px-5 py-6 shadow-sm">
            {/* Full Name */}
            <View className="mb-5">
              <Text className="text-sm font-quicksand-semibold text-black mb-2">
                Full Name
              </Text>
              <TextInput
                className={`bg-white-100 rounded-xl px-4 py-3 font-quicksand text-base text-black ${
                  errors.fullName ? 'border border-error' : ''
                }`}
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                placeholder="Enter your full name"
                placeholderTextColor="#878787"
                autoCapitalize="words"
                editable={!isSaving}
              />
              {errors.fullName && (
                <Text className="text-xs font-quicksand text-error mt-1">
                  {errors.fullName}
                </Text>
              )}
            </View>

            {/* Email (Read-only) */}
            <View className="mb-5">
              <Text className="text-sm font-quicksand-semibold text-black mb-2">
                Email
              </Text>
              <TextInput
                className="bg-gray-100/30 rounded-xl px-4 py-3 font-quicksand text-base text-gray-100"
                value={formData.email}
                editable={false}
                placeholder="Email address"
                placeholderTextColor="#878787"
              />
              <Text className="text-xs font-quicksand text-gray-100 mt-1">
                Email cannot be changed here. Contact support if needed.
              </Text>
            </View>

            {/* Phone */}
            <View className="mb-5">
              <Text className="text-sm font-quicksand-semibold text-black mb-2">
                Phone Number
              </Text>
              <TextInput
                className={`bg-white-100 rounded-xl px-4 py-3 font-quicksand text-base text-black ${
                  errors.phone ? 'border border-error' : ''
                }`}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Enter your phone number"
                placeholderTextColor="#878787"
                keyboardType="phone-pad"
                editable={!isSaving}
              />
              {errors.phone && (
                <Text className="text-xs font-quicksand text-error mt-1">
                  {errors.phone}
                </Text>
              )}
            </View>

            {/* Address 1 - Home */}
            <View className="mb-5">
              <Text className="text-sm font-quicksand-semibold text-black mb-2">
                Address 1 (Home)
              </Text>
              <TextInput
                className={`bg-white-100 rounded-xl px-4 py-3 font-quicksand text-base text-black ${
                  errors.address1 ? 'border border-error' : ''
                }`}
                value={formData.address1}
                onChangeText={(value) => handleInputChange('address1', value)}
                placeholder="Enter your home address"
                placeholderTextColor="#878787"
                multiline
                numberOfLines={2}
                editable={!isSaving}
              />
              {errors.address1 && (
                <Text className="text-xs font-quicksand text-error mt-1">
                  {errors.address1}
                </Text>
              )}
            </View>

            {/* Address 2 - Work */}
            <View>
              <Text className="text-sm font-quicksand-semibold text-black mb-2">
                Address 2 (Work) - Optional
              </Text>
              <TextInput
                className="bg-white-100 rounded-xl px-4 py-3 font-quicksand text-base text-black"
                value={formData.address2}
                onChangeText={(value) => handleInputChange('address2', value)}
                placeholder="Enter your work address"
                placeholderTextColor="#878787"
                multiline
                numberOfLines={2}
                editable={!isSaving}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="px-5 mt-6">
            {/* Save Button */}
            <TouchableOpacity
              className={`py-4 rounded-full items-center justify-center ${
                isSaving ? 'bg-primary/50' : 'bg-primary'
              }`}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              {isSaving ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="text-white font-quicksand-semibold text-base ml-2">
                    Saving...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-quicksand-semibold text-base">
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              className="py-4 rounded-full items-center justify-center mt-3 border border-gray-100/30"
              onPress={handleCancel}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              <Text className="text-gray-100 font-quicksand-semibold text-base">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfile;