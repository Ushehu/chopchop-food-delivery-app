import React from 'react';
import { View, Text, Image } from 'react-native';

interface InfoRowProps {
  icon: any;
  label: string;
  value: string;
  isLast?: boolean;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  label,
  value,
  isLast = false,
}) => {
  return (
    <View 
      className={`flex-row items-center py-2 ${
        !isLast ? 'border-b border-gray-100/30' : ''
      }`}
    >
      <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
        <Image
          source={icon}
          className="w-6 h-6"
          style={{ tintColor: '#FE8C00' }}
        />
      </View>
      <View className="flex-1">
        <Text className="text-[13px] font-quicksand text-gray-100 mb-1">
          {label}
        </Text>
        <Text className="text-[15px] font-quicksand-semibold text-black">
          {value}
        </Text>
      </View>
    </View>
  );
};