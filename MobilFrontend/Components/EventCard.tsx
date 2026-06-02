import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { Event, resolveEventImage } from '@/assets/constants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { COLORS } from '@/assets/constants'

interface EventCardProps {
  event: Event
  horizontal?: boolean
  onPress: () => void
}

export default function EventCard({ event, horizontal = false, onPress }: EventCardProps) {
  const eventDate = new Date(event.date)
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  if (horizontal) {
    return (
      <TouchableOpacity 
        className='mr-4 w-64 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'
        onPress={onPress}
      >
        <Image 
          source={{ uri: resolveEventImage(event.image) }}
          className='w-full h-32'
          style={{ resizeMode: 'cover' }}
        />
        <View className='p-3'>
          <Text className='text-black font-bold text-base' numberOfLines={1}>{event.title}</Text>
          <View className='flex-row items-center mt-1'>
            <Ionicons name="calendar-outline" size={12} color={COLORS.secondary} />
            <Text className='text-gray-500 text-xs ml-1'>{formattedDate}</Text>
          </View>
          <View className='flex-row items-center mt-1'>
            <Ionicons name="location-outline" size={12} color={COLORS.secondary} />
            <Text className='text-gray-500 text-xs ml-1' numberOfLines={1}>{event.location.venue}</Text>
          </View>
          <View className='flex-row justify-between items-center mt-2'>
            <Text className='text-primary font-bold'>${event.price}</Text>
            {event.isSoldOut && (
              <Text className='text-red-500 text-xs'>Sold Out</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity 
      className='mb-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'
      onPress={onPress}
    >
      <View className='flex-row'>
        <Image 
          source={{ uri: resolveEventImage(event.image) }}
          className='w-28 h-28'
          style={{ resizeMode: 'cover' }}
        />
        <View className='flex-1 p-3'>
          <Text className='text-black font-bold text-base' numberOfLines={1}>{event.title}</Text>
          <View className='flex-row items-center mt-1'>
            <Ionicons name="calendar-outline" size={14} color={COLORS.secondary} />
            <Text className='text-gray-500 text-sm ml-1'>{formattedDate}</Text>
          </View>
          <View className='flex-row items-center mt-1'>
            <Ionicons name="location-outline" size={14} color={COLORS.secondary} />
            <Text className='text-gray-500 text-sm ml-1' numberOfLines={1}>{event.location.venue}</Text>
          </View>
          <View className='flex-row justify-between items-center mt-2'>
            <Text className='text-primary font-bold text-lg'>${event.price}</Text>
            <Text className='text-gray-500 text-xs'>{event.availableSpots} spots left</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}