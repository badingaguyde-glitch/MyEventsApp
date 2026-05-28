import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/Components/Header'
import EventCard from '@/Components/EventCard'
import { router } from 'expo-router'
import api from '@/assets/constants/api'
import { Event, CATEGORIES } from '@/assets/constants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { COLORS } from '@/assets/constants'

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      const response = await api.get(`/events/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchResults(response.data)
      
      // Save to recent searches
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches].slice(0, 5))
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchByCategory = async (category: string) => {
    setLoading(true)
    try {
      const response = await api.get(`/events/category?category=${category}`)
      setSearchResults(response.data)
      setSearchQuery(category)
    } catch (error) {
      console.error('Category search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNearbyEvents = async () => {
    // In a real app, get user's location
    setLoading(true)
    try {
      const response = await api.get('/events/nearby?lat=37.7749&lng=-122.4194&radius=10')
      setSearchResults(response.data.events)
    } catch (error) {
      console.error('Nearby events error:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <SafeAreaView className='flex-1 bg-white' edges={["top"]}>
      <Header showBack showLogo />

      {/* Search Input */}
      <View className='px-4 py-4'>
        <View className='flex-row items-center bg-gray-100 rounded-xl px-4'>
          <Ionicons name="search-outline" size={20} color={COLORS.secondary} />
          <TextInput
            className='flex-1 py-3 px-2 text-base'
            placeholder='Search events, venues, or categories...'
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      {searchResults.length === 0 && !loading && (
        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
          {/* Categories */}
          <View className='px-4 mb-6'>
            <Text className='text-lg font-bold text-black mb-3'>Popular Categories</Text>
            <View className='flex-row flex-wrap gap-2'>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  className='bg-gray-100 px-4 py-2 rounded-full'
                  onPress={() => searchByCategory(cat.name)}
                >
                  <Text className='text-black'>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location-based */}
          <View className='px-4 mb-6'>
            <Text className='text-lg font-bold text-black mb-3'>Discover Nearby</Text>
            <TouchableOpacity
              className='bg-primary p-4 rounded-xl flex-row items-center justify-between'
              onPress={getNearbyEvents}
            >
              <View>
                <Text className='text-white font-bold text-lg'>Events Near You</Text>
                <Text className='text-white/80 text-sm mt-1'>Find events in your area</Text>
              </View>
              <Ionicons name="location" size={30} color="white" />
            </TouchableOpacity>
          </View>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View className='px-4'>
              <Text className='text-lg font-bold text-black mb-3'>Recent Searches</Text>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  className='py-3 border-b border-gray-100 flex-row items-center'
                  onPress={() => {
                    setSearchQuery(search)
                    handleSearch()
                  }}
                >
                  <Ionicons name="time-outline" size={18} color={COLORS.secondary} />
                  <Text className='text-gray-700 ml-3 flex-1'>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Search Results */}
      {loading ? (
        <View className='flex-1 justify-center items-center'>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <EventCard 
              event={item} 
              onPress={() => router.push({ pathname: '/event/[id]', params: { id: item._id } } as any)}
            />
          )}
          ListEmptyComponent={
            searchQuery && !loading ? (
              <View className='flex-1 justify-center items-center py-20'>
                <Ionicons name="search-outline" size={60} color={COLORS.secondary} />
                <Text className='text-gray-500 text-lg mt-4'>No results found</Text>
                <Text className='text-gray-400 text-sm mt-2'>Try different keywords</Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}