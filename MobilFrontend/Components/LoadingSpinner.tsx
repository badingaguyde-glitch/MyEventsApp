import { View, ActivityIndicator } from 'react-native'
import React from 'react'
import { COLORS } from '@/assets/constants'

export default function LoadingSpinner() {
  return (
    <View className='flex-1 bg-white justify-center items-center'>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  )
}