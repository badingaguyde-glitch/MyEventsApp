import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/Components/Header'
import { useAuth } from '@/context/AuthContext'
import api from '@/assets/constants/api'
import { router } from 'expo-router'
import { CATEGORIES, COLORS } from '@/assets/constants'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import Ionicons from '@expo/vector-icons/Ionicons'

export default function CreateEvent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: [] as string[],
    date: new Date(),
    time: '',
    venue: '',
    address: '',
    city: '',
    capacity: '',
    price: '',
    image: null as any,
    coordinates: {
      lat: '',
      lng: '',
    }
  })

  const toggleCategory = (category: string) => {
    if (formData.category.includes(category)) {
      setFormData({
        ...formData,
        category: formData.category.filter(c => c !== category)
      })
    } else {
      setFormData({
        ...formData,
        category: [...formData.category, category]
      })
    }
  }

  const pickImage = async () => {
    // Use correct enum from expo-image-picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0].uri })
    }
  }

  const getCurrentLocation = async () => {
    setGettingLocation(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to set event coordinates')
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setFormData({
        ...formData,
        coordinates: {
          lat: location.coords.latitude.toString(),
          lng: location.coords.longitude.toString(),
        }
      })
      Alert.alert('Success', 'Location captured!')
    } catch (error) {
      Alert.alert('Error', 'Failed to get location')
    } finally {
      setGettingLocation(false)
    }
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title || !formData.description || formData.category.length === 0 || 
        !formData.venue || !formData.city || !formData.capacity) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Create location object as a proper object (not stringified separately)
      const locationObject = {
        venue: formData.venue,
        address: formData.address || '',
        city: formData.city
      }

      // Prepare coordinates as array of numbers [longitude, latitude]
      let coordinatesArray = null
      if (formData.coordinates.lat && formData.coordinates.lng) {
        coordinatesArray = [parseFloat(formData.coordinates.lng), parseFloat(formData.coordinates.lat)]
      }

      // Create data object for JSON request instead of FormData for complex nested objects
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date.toISOString(),
        time: formData.time || '12:00',
        location: locationObject,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price) || 0,
        coordinates: coordinatesArray
      }

      console.log('Submitting event data:', JSON.stringify(eventData, null, 2))

      // Send as JSON instead of FormData to avoid parsing issues
      const response = await api.post('/events', eventData, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      // If we have an image, upload it separately
      if (formData.image) {
        const imageFormData = new FormData()
        const uriParts = formData.image.split('.')
        const fileType = uriParts[uriParts.length - 1]
        imageFormData.append('image', {
          uri: formData.image,
          name: `event.${fileType}`,
          type: `image/${fileType}`,
        } as any)

        await api.put(`/events/${response.data._id}`, imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      
      console.log('Event created:', response.data)
      Alert.alert('Success', 'Event created successfully!')
      router.back()
    } catch (error: any) {
      console.error('Create event error:', error.response?.data || error)
      Alert.alert('Error', error.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  // If user is not logged in
  if (!user) {
    return (
      <SafeAreaView className='flex-1 bg-white justify-center items-center px-4'>
        <Ionicons name="lock-closed" size={60} color={COLORS.secondary} />
        <Text className='text-gray-500 text-lg text-center mt-4'>
          Please login to create events
        </Text>
        <TouchableOpacity 
          className='bg-black px-6 py-3 rounded-full mt-6'
          onPress={() => router.push('/login')}
        >
          <Text className='text-white font-bold'>Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex-1 mb-10 bg-white' edges={["top"]}>
      <Header showBack />
      <ScrollView className='flex-1 p-4' showsVerticalScrollIndicator={false}>
        <Text className='text-2xl font-bold text-black mb-4'>Create New Event</Text>

        {/* Title */}
        <View className='mb-4'>
          <Text className='text-gray-700 mb-2 font-semibold'>Event Title *</Text>
          <TextInput
            className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'
            placeholder="Enter event title"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
        </View>

        {/* Description */}
        <View className='mb-4'>
          <Text className='text-gray-700 mb-2 font-semibold'>Description *</Text>
          <TextInput
            className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'
            placeholder="Describe your event"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Categories */}
        <View className='mb-4'>
          <Text className='text-gray-700 mb-2 font-semibold'>Categories *</Text>
          <View className='flex-row flex-wrap gap-2'>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className={`px-4 py-2 rounded-full ${formData.category.includes(cat.name) ? 'bg-black' : 'bg-gray-100'}`}
                onPress={() => toggleCategory(cat.name)}
              >
                <Text className={formData.category.includes(cat.name) ? 'text-white' : 'text-black'}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date & Time */}
        <View className='flex-row gap-3 mb-4'>
          <View className='flex-1'>
            <Text className='text-gray-700 mb-2 font-semibold'>Date *</Text>
            <TouchableOpacity 
              className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{formData.date.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.date}
                mode="date"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false)
                  if (selectedDate) setFormData({ ...formData, date: selectedDate })
                }}
              />
            )}
          </View>
          <View className='flex-1'>
            <Text className='text-gray-700 mb-2 font-semibold'>Time *</Text>
            <TextInput
              className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'
              placeholder="e.g., 7:00 PM"
              value={formData.time}
              onChangeText={(text) => setFormData({ ...formData, time: text })}
            />
          </View>
        </View>

        {/* Location */}
        <View className='mb-4'>
          <Text className='text-gray-700 mb-2 font-semibold'>Venue Name *</Text>
          <TextInput
            className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3'
            placeholder="Venue name"
            value={formData.venue}
            onChangeText={(text) => setFormData({ ...formData, venue: text })}
          />
          
          <Text className='text-gray-700 mb-2 font-semibold'>Address *</Text>
          <TextInput
            className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3'
            placeholder="Street address"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
          />
          
          <Text className='text-gray-700 mb-2 font-semibold'>City *</Text>
          <TextInput
            className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'
            placeholder="City"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
          />
        </View>

        {/* Coordinates Section */}
        <View className='mb-4'>
          <View className='flex-row justify-between items-center mb-3'>
            <Text className='text-gray-700 font-semibold'>Event Location (Map) - Optional</Text>
            <TouchableOpacity 
              className='flex-row items-center'
              onPress={() => setUseCurrentLocation(!useCurrentLocation)}
            >
              <Text className='text-primary text-sm mr-2'>Use my location</Text>
              <Switch
                value={useCurrentLocation}
                onValueChange={setUseCurrentLocation}
                trackColor={{ false: '#767577', true: COLORS.primary }}
              />
            </TouchableOpacity>
          </View>

          {useCurrentLocation ? (
            <TouchableOpacity 
              className='bg-gray-100 border border-gray-200 rounded-xl p-4 items-center'
              onPress={getCurrentLocation}
              disabled={gettingLocation}
            >
              <Ionicons name="location" size={30} color={COLORS.primary} />
              <Text className='text-primary font-semibold mt-2'>
                {gettingLocation ? 'Getting location...' : 'Get Current Location'}
              </Text>
              {formData.coordinates.lat && formData.coordinates.lng && (
                <Text className='text-gray-500 text-xs mt-2'>
                  Lat: {formData.coordinates.lat}, Lng: {formData.coordinates.lng}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View className='gap-3'>
              <View className='flex-row gap-3'>
                <View className='flex-1'>
                  <Text className='text-gray-500 text-xs mb-1'>Latitude</Text>
                  <TextInput
                    className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'
                    placeholder="e.g., 37.7749"
                    value={formData.coordinates.lat}
                    onChangeText={(text) => setFormData({ 
                      ...formData, 
                      coordinates: { ...formData.coordinates, lat: text }
                    })}
                    keyboardType="numeric"
                  />
                </View>
                <View className='flex-1'>
                  <Text className='text-gray-500 text-xs mb-1'>Longitude</Text>
                  <TextInput
                    className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'
                    placeholder="e.g., -122.4194"
                    value={formData.coordinates.lng}
                    onChangeText={(text) => setFormData({ 
                      ...formData, 
                      coordinates: { ...formData.coordinates, lng: text }
                    })}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <Text className='text-gray-400 text-xs text-center'>
                You can get coordinates from Google Maps
              </Text>
            </View>
          )}
        </View>

        {/* Capacity & Price */}
        <View className='flex-row gap-3 mb-4'>
          <View className='flex-1'>
            <Text className='text-gray-700 mb-2 font-semibold'>Capacity *</Text>
            <TextInput
              className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'
              placeholder="Max attendees"
              value={formData.capacity}
              onChangeText={(text) => setFormData({ ...formData, capacity: text })}
              keyboardType="numeric"
            />
          </View>
          <View className='flex-1'>
            <Text className='text-gray-700 mb-2 font-semibold'>Price ($)</Text>
            <TextInput
              className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'
              placeholder="0 for free"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Image */}
        <View className='mb-6'>
          <Text className='text-gray-700 mb-2 font-semibold'>Event Image</Text>
          <TouchableOpacity 
            className='bg-gray-50 border border-gray-200 rounded-xl p-4 items-center'
            onPress={pickImage}
          >
            <Ionicons name="image-outline" size={30} color="black" />
            <Text className='text-black mt-2'>{formData.image ? 'Change Image' : 'Upload Image'}</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          className={`py-4 rounded-xl mt-4 mb-6 mx-2 ${loading ? 'bg-gray-400' : 'bg-black'}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className='text-white  text-center font-bold text-lg'>
            {loading ? 'Creating Event...' : '✨ Create Event ✨'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}