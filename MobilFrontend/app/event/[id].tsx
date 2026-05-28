import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import Header from '@/Components/Header'
import api from '@/assets/constants/api'
import { Event, COLORS } from '@/assets/constants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAuth } from '@/context/AuthContext'

export default function EventDetails() {
  const { id } = useLocalSearchParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchEventDetails()
  }, [id])

  const fetchEventDetails = async () => {
    try {
      const response = await api.get(`/events/${id}`)
      setEvent(response.data)
    } catch (error) {
      console.error('Error fetching event:', error)
      Alert.alert('Error', 'Failed to load event details')
    } finally {
      setLoading(false)
    }
  }

  const handleBuyTicket = async () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to purchase tickets',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/login') }
        ]
      )
      return
    }

    setBuying(true)
    try {
      await api.post('/tickets', { eventId: id, price: event?.price })
      Alert.alert('Success', 'Ticket purchased successfully!')
      fetchEventDetails() // Refresh to update available spots
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to purchase ticket')
    } finally {
      setBuying(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView className='flex-1 bg-white justify-center items-center'>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    )
  }

  if (!event) {
    return (
      <SafeAreaView className='flex-1 bg-white justify-center items-center'>
        <Text className='text-gray-500'>Event not found</Text>
      </SafeAreaView>
    )
  }

  const eventDate = new Date(event.date)
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const isSoldOut = event.availableSpots === 0 || event.isSoldOut
  const isPastEvent = eventDate < new Date()

  return (
    <SafeAreaView className='flex-1 mb-10 bg-white' edges={["top"]}>
      <Header showBack />

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {/* Event Image */}
        <Image 
          source={{ uri: event.image }}
          className='w-full h-64'
          style={{ resizeMode: 'cover' }}
        />

        <View className='p-4'>
          {/* Title and Category */}
          <View className='mb-4'>
            <View className='flex-row flex-wrap gap-2 mb-2'>
              {event.category.map((cat, index) => (
                <View key={index} className='bg-gray-100 px-3 py-1 rounded-full'>
                  <Text className='text-gray-600 text-xs'>{cat}</Text>
                </View>
              ))}
            </View>
            <Text className='text-2xl font-bold text-black'>{event.title}</Text>
          </View>

          {/* Date & Time */}
          <View className='bg-gray-50 rounded-xl p-4 mb-4'>
            <View className='flex-row items-center mb-3'>
              <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
              <Text className='text-black font-semibold ml-3'>{formattedDate}</Text>
            </View>
            <View className='flex-row items-center'>
              <Ionicons name="time-outline" size={24} color={COLORS.primary} />
              <Text className='text-black font-semibold ml-3'>{formattedTime}</Text>
            </View>
          </View>

          {/* Location */}
          <View className='bg-gray-50 rounded-xl p-4 mb-4'>
  <View className='flex-row items-center mb-2'>
    <Ionicons name="location-outline" size={24} color={COLORS.primary} />
    <Text className='text-black font-semibold ml-3'>{event.location.venue}</Text>
  </View>
  <Text className='text-gray-600 ml-9'>{event.location.address}</Text>
  <Text className='text-gray-600 ml-9 mb-3'>{event.location.city}</Text>
  
  {/* Map Button */}
  <TouchableOpacity 
    className='mt-2 bg-primary/10 p-4 rounded-xl flex-row items-center justify-center'
    onPress={() => {
      // Build address string
      const address = `${event.location.venue}, ${event.location.address}, ${event.location.city}`
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      Linking.openURL(url)
    }}
  >
    <Ionicons name="map" size={24} color={COLORS.primary} />
    <Text className='text-primary font-semibold ml-2'>Open in Google Maps</Text>
  </TouchableOpacity>
</View>

          {/* Description */}
          <View className='bg-gray-50 rounded-xl p-4 mb-4'>
            <Text className='text-lg font-bold text-black mb-2'>About This Event</Text>
            <Text className='text-gray-600 leading-6'>{event.description}</Text>
          </View>

          {/* Availability */}
          <View className='flex-row justify-between items-center bg-gray-50 rounded-xl p-4 mb-4'>
            <View>
              <Text className='text-gray-500 text-sm'>Available Spots</Text>
              <Text className='text-2xl font-bold text-black'>{event.availableSpots}</Text>
              <Text className='text-gray-500 text-xs'>out of {event.capacity}</Text>
            </View>
            <View className='items-end'>
              <Text className='text-gray-500 text-sm'>Price</Text>
              <Text className='text-3xl font-bold text-primary'>${event.price}</Text>
            </View>
          </View>

          {/* Organizer */}
          <View className='bg-gray-50 rounded-xl p-4 mb-6'>
            <Text className='text-gray-500 text-sm mb-1'>Organized by</Text>
            <Text className='text-black font-semibold'>
              {typeof event.organizer === 'object' 
                ? `${event.organizer.name} ${event.organizer.lastName}`
                : 'Event Organizer'}
            </Text>
          </View>

          {/* BUY TICKET BUTTON */}
          {isPastEvent ? (
            <View className='bg-gray-300 py-4 rounded-xl mb-6'>
              <Text className='text-gray-600 text-center font-bold text-lg'>
                This event has passed
              </Text>
            </View>
          ) : isSoldOut ? (
            <View className='bg-red-500 py-4 rounded-xl mb-6'>
              <Text className='text-white text-center font-bold text-lg'>
                Sold Out
              </Text>
            </View>
          ) : (
            <TouchableOpacity 
              className={`py-4 rounded-xl mb-6 ${buying ? 'bg-gray-400' : 'bg-black'}`}
              onPress={handleBuyTicket}
              disabled={buying}
            >
              <Text className='text-white text-center font-bold text-lg'>
                {buying ? 'Processing...' : `Buy Ticket - $${event.price}`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}