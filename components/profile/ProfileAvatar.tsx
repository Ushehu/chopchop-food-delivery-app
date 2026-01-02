import React from 'react';
import { View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

interface ProfileAvatarProps {
  imageSource: any;
  onEditPress?: () => void;
  isUploading?: boolean;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  imageSource,
  onEditPress,
  isUploading = false,
}) => {
  return (
    <View className="items-center pt-4 pb-4">
      <View className="relative">
        <Image
          source={imageSource}
          className="w-[100px] h-[100px] rounded-full bg-gray-300"
        />
        {isUploading && (
          <View className="absolute inset-0 items-center justify-center bg-black/50 rounded-full">
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
        )}
        <TouchableOpacity 
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary items-center justify-center border-[3px] border-white"
          onPress={onEditPress}
          disabled={isUploading}
          activeOpacity={0.7}
        >
          <Image
            source={require('@/assets/icons/pencil.png')}
            className="w-4 h-4"
            style={{ tintColor: '#ffffff' }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};