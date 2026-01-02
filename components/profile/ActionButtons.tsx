import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface ActionButtonsProps {
  onEditPress?: () => void;
  onLogoutPress?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEditPress,
  onLogoutPress,
}) => {
  return (
    <View>
      <TouchableOpacity 
        className="mx-5 mt-4 py-3 rounded-[28px] bg-white border-[1.5px] border-primary items-center"
        onPress={onEditPress}
      >
        <Text className="text-base font-quicksand-semibold text-primary">
          Edit Profile
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="flex-row mx-5 mt-2 py-3 rounded-[28px] bg-transparent border-[1.5px] border-error items-center justify-center"
        onPress={onLogoutPress}
      >
        <Image
          source={require('@/assets/icons/logout.png')}
          className="w-5 h-5 mr-2"
          style={{ tintColor: '#F14141' }}
        />
        <Text className="text-base font-quicksand-semibold text-error">
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
};