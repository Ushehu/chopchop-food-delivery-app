import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface ProfileHeaderProps {
  onBackPress?: () => void;
  onSearchPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onBackPress,
  onSearchPress,
}) => {
  return (
    <View className="flex-row items-center justify-between px-5 py-2">
      <TouchableOpacity 
        className="w-10 h-10 items-center justify-center"
        onPress={onBackPress}
      >
        <Image
          source={require('@/assets/icons/arrow-back.png')}
          className="w-5 h-5"
          style={{ tintColor: '#000000' }}
        />
      </TouchableOpacity>
      <Text className="text-lg font-quicksand-semibold text-black">
        Profile
      </Text>
      <TouchableOpacity 
        className="w-10 h-10 items-center justify-center"
        onPress={onSearchPress}
      >
        <Image
          source={require('@/assets/icons/search.png')}
          className="w-5 h-5"
          style={{ tintColor: '#000000' }}
        />
      </TouchableOpacity>
    </View>
  );
};