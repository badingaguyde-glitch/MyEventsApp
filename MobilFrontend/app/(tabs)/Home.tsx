import { View, Text, ScrollView, Image, Dimensions, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/Components/Header'
import { BANNERS, CATEGORIES } from '@/assets/constants'
import { router, useFocusEffect } from 'expo-router'
import CategoryItem from '@/Components/CategoryItem'
import EventCard from '@/Components/EventCard'
import { useAuth } from '@/context/AuthContext'
import api from '@/assets/constants/api'
import { Event } from '@/assets/constants'
import LoadingSpinner from '@/Components/LoadingSpinner'

const { width } = Dimensions.get("window")

export default function Home() {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0)
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { user } = useAuth()

  const categories = [{ id: 'all', name: 'All', icon: "grid" }, ...CATEGORIES]

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events')
      const allEvents = response.data
      
      // Get featured events (first 3)
      setFeaturedEvents(allEvents.slice(0, 3))
      // Get upcoming events (next 4)
      setUpcomingEvents(allEvents.slice(3, 7))
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchEvents()
    setRefreshing(false)
  }

  useFocusEffect(
    useCallback(() => {
      fetchEvents()
    }, [])
  )

  const navigateToEvents = (category?: string) => {
    router.push({ 
      pathname: '/events',
      params: category ? { category } : {}
    })
  }

  const navigateToEventDetails = (eventId: string) => {
    router.push(`/event/${eventId}`)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <SafeAreaView className='flex-1 bg-white' edges={["top"]}>
      <Header showMenu showLogo />

      <ScrollView 
        className='flex-1' 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Banner Slider */}
  <View className='mb-6'>

 
  <ScrollView 
    horizontal 
    pagingEnabled  
    showsHorizontalScrollIndicator={false} 
    className='w-full h-48 rounded-xl'
    style={{ height: 200 }}  
    onScroll={(event) => {
      const slide= Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width  )
      if (slide !== activeBannerIndex)
      setActiveBannerIndex(slide);
    }} 
  >
    {BANNERS.map((banner, index) => (
      <View 
        key={index} 
        className='relative bg-gray-200 overflow-hidden rounded-xl'
        style={{ 
          width: width - 32,  // ← Style object properly
          height: 200,
          marginRight: 16,
          marginLeft: 16
        }}
      >
        <Image 
          source={{uri: banner.image}}
          className='w-full h-full'
          style={{ resizeMode: 'cover' }}  // ← Move resizeMode here
        />
        <View className='absolute  bottom-4 left-4 z-10'>
          <Text className='text-white text-2xl'>{banner.title}</Text>
          <Text className='text-white text-sm'>{banner.subtitle}</Text>

          <View className='flex-row gap-2'>
            <TouchableOpacity className='mt-2 bg-white px-4 py-2 rounded-full self-start'  onPress={() => router.push('/events')}>
            <Text className='text-primary font-bold'>Explore Now</Text>
          </TouchableOpacity>
          <TouchableOpacity className='mt-2 bg-white px-4 py-2 rounded-full self-start'  >
            <Text className='text-primary font-bold'  
            onPress={() => router.push('/create-event')}>Host an Event</Text>
          </TouchableOpacity>

        

          </View> 
        </View>
        
        <View className='absolute inset-0 bg-black/40'/>
      </View>
    ))}
  </ScrollView>
  {/* pagination indicators */}
  <View className='flex-row justify-center mt-3 gap-2'>
    {BANNERS.map((_, index) => (
      <View 
        key={index} 
        className={` h-2 rounded-full ${index === activeBannerIndex ? ' w-4 bg-black' : 'w-2 bg-gray-300'}`} 
      />
    )) }
    </View> 
     </View>

     {/*categories*/}
     <View className='mb-6'>
      <View className='flex-row justify-between items-center mb-4'>
        <Text className='text-xl font-bold text-black  p-2'>Categories</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} >
        
       {categories.map((cat:any)=>(
         <CategoryItem key={cat.id} item={cat} isSelected={false}
         onPress={() => router.push({ 
          pathname: '/events', 
          params: { category: cat.name === 'All' ? '' : cat.name }
           })} 
          />
        ))}
      </ScrollView>

     </View>


        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <View className='px-4 mb-8'>
            <Text className='text-xl font-bold text-black mb-4'>Featured Events</Text>
            {featuredEvents.map((event) => (
              <EventCard 
                key={event._id} 
                event={event} 
                onPress={() => navigateToEventDetails(event._id)}
              />
            ))}
          </View>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View className='px-4 mb-8'>
            <Text className='text-xl font-bold text-black mb-4'>Upcoming Events</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {upcomingEvents.map((event) => (
                <EventCard 
                  key={event._id} 
                  event={event} 
                  horizontal
                  onPress={() => navigateToEventDetails(event._id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

       
        
      </ScrollView>
    </SafeAreaView>
  )
}