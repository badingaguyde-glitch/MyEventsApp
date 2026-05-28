import { View, Text, Touchable, TouchableOpacity } from 'react-native'
import React from 'react'
import { CategoryItemProps, COLORS } from '@/assets/constants'
import Ionicons from '@expo/vector-icons/Ionicons'

export default function CategoryItem( {item, isSelected,onPress}
    :CategoryItemProps ) {
  return (
    <TouchableOpacity className='mr-4 items-center' onPress={onPress}>
        <View className={`w-14 h-14 rounded-full justify-center mb-2 items-center
           ${isSelected ? 'bg-primary' : 'bg-surface'}`}>
            <Ionicons name={item.icon as any} size={24} 
            color={isSelected ? "#FFFF" : COLORS.primary} />
         </View> 

         <Text className={'text-xs font-medium ${isSelected ? "text-primary" : "text-secondary"}'}>{item.name}</Text>  
    </TouchableOpacity>
     
  )
}