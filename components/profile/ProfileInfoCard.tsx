// ============================================
// components/profile/ProfileInfoCard.tsx
// ============================================
import React from 'react';
import { View } from 'react-native';
import { InfoRow } from './InfoRow';
import type { UserInfo } from '@/lib/api/profile';

interface ProfileInfoCardProps {
  userInfo: UserInfo;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ userInfo }) => {
  return (
    <View className="bg-white mx-5 rounded-2xl px-5 py-2 shadow-sm">
      <InfoRow
        icon={require('@/assets/icons/user.png')}
        label="Full Name"
        value={userInfo.fullName}
      />
      <InfoRow
        icon={require('@/assets/icons/envelope.png')}
        label="Email"
        value={userInfo.email}
      />
      <InfoRow
        icon={require('@/assets/icons/phone.png')}
        label="Phone number"
        value={userInfo.phone}
      />
      <InfoRow
        icon={require('@/assets/icons/location.png')}
        label="Address 1 - (Home)"
        value={userInfo.address1}
      />
      <InfoRow
        icon={require('@/assets/icons/location.png')}
        label="Address 2 - (Work)"
        value={userInfo.address2}
        isLast
      />
    </View>
  );
};