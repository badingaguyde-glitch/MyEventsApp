import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native'
import React, { useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/Components/Header'
import { useAuth } from '@/context/AuthContext'
import { COLORS } from '@/assets/constants'
import Ionicons from '@expo/vector-icons/Ionicons'
import api from '@/assets/constants/api'
import { router, useFocusEffect } from 'expo-router'
import { MyEvent } from '@/assets/constants'




export default function Profile() {
  const { user, logout, updateUser, loading: authLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
   const [myEvents, setMyEvents] = useState([])   // This should work now
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
    lastName: '',
    interests: '',
  })
  const [authLoading2, setAuthLoading2] = useState(false)

  const { login, register } = useAuth()

  const fetchMyEvents = async () => {
    if (!user) return
    try {
      const response = await api.get('/events/mine')
      console.log('My events response:', response.data) // Debug log
      setMyEvents(response.data)
    } catch (error) {
      console.error('Error fetching my events:', error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchMyEvents()
      }
    }, [user])
  )

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const response = await api.put('/user', {
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        interests: formData.interests.split(',').map(i => i.trim()),
      })
      updateUser(response.data)
      setIsEditing(false)
      Alert.alert('Success', 'Profile updated successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async () => {
    if (!authForm.email || !authForm.password) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    if (!isLogin && (!authForm.name || !authForm.lastName)) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    setAuthLoading2(true)
    try {
      if (isLogin) {
        await login(authForm.email, authForm.password)
      } else {
        await register({
          name: authForm.name,
          lastName: authForm.lastName,
          email: authForm.email,
          password: authForm.password,
          interests: authForm.interests.split(',').map(i => i.trim()).filter(i => i),
        })
      }
      setShowAuthModal(false)
      setAuthForm({ email: '', password: '', name: '', lastName: '', interests: '' })
      fetchMyEvents()
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Authentication failed')
    } finally {
      setAuthLoading2(false)
    }
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => logout() }
      ]
    )
  }

  const [formData, setFormData] = useState({
    name: user?.name || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    interests: user?.interests?.join(', ') || '',
  })

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        lastName: user.lastName || '',
        email: user.email || '',
        interests: user.interests?.join(', ') || '',
      })
    }
  }, [user])

  if (authLoading) {
    return (
      <SafeAreaView className='flex-1 bg-white justify-center items-center'>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex-1 bg-white' edges={["top"]}>
      <Header showBack showLogo />

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {!user ? (
          // Not Logged In - Show CTA
          <View className='flex-1 justify-center items-center px-6 py-20'>
            <View className='w-24 h-24 bg-primary/10 rounded-full justify-center items-center mb-6'>
              <Ionicons name="person-outline" size={50} color={COLORS.primary} />
            </View>
            <Text className='text-2xl font-bold text-black text-center mb-2'>Welcome!</Text>
            <Text className='text-gray-500 text-center mb-8'>
              Login or create an account to manage your events and tickets
            </Text>
            <TouchableOpacity 
              className='bg-primary w-full py-4 rounded-xl mb-3'
              onPress={() => {
                setIsLogin(true)
                setShowAuthModal(true)
              }}
            >
              <Text className='text-white text-center font-bold text-lg'>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className='border-2 border-primary w-full py-4 rounded-xl'
              onPress={() => {
                setIsLogin(false)
                setShowAuthModal(true)
              }}
            >
              <Text className='text-primary text-center font-bold text-lg'>Sign Up</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // User is Logged In
          <>
            {/* Profile Header */}
            <View className='items-center py-6 bg-gray-50'>
              <View className='w-24 h-24 rounded-[10px] bg-black justify-center items-center mb-3'>
                <Text className='text-white text-3xl font-bold'>
                  {user.name?.charAt(0)}{user.lastName?.charAt(0)}
                </Text>
              </View>
              <Text className='text-xl font-bold text-black'>{user.name} {user.lastName}</Text>
              <Text className='text-gray-500 text-sm mt-1'>{user.email}</Text>
              <View className='bg-gray-200 px-3 py-1 rounded-full mt-2'>
                <Text className='text-sm text-gray-700 capitalize'>{user.role}</Text>
              </View>
            </View>

            {/* Stats Cards */}
            <View className='flex-row gap-3 p-4'>
              <View className='flex-1 bg-primary/10 p-4 rounded-xl'>
                <Text className='text-2xl font-bold text-primary'>{myEvents.length}</Text>
                <Text className='text-gray-600 text-sm mt-1'>Events Hosted</Text>
              </View>
              <View className='flex-1 bg-primary/10 p-4 rounded-xl'>
                <Text className='text-2xl font-bold text-primary'>
                  {myEvents.reduce((sum, event) => sum + (event.soldTickets || 0), 0)}
                </Text>
                <Text className='text-gray-600 text-sm mt-1'>Tickets Sold</Text>
              </View>
            </View>

            {/* My Events Section */}
            <View className='px-4 mb-4'>
              <View className='flex-row justify-between items-center mb-3'>
                <Text className='text-lg font-bold text-black'>My Events</Text>
                <TouchableOpacity 
                  className='bg-primary px-4 py-2 rounded-lg'
                  onPress={() => router.push('/create-event')}
                >
                  <Text className='text-white font-semibold'>+ Create Event</Text>
                </TouchableOpacity>
              </View>

              {myEvents.length === 0 ? (
                <View className='bg-gray-50 rounded-xl p-8 items-center'>
                  <Ionicons name="calendar-outline" size={50} color={COLORS.secondary} />
                  <Text className='text-gray-500 text-center mt-3'>
                    {"You haven't created any events yet"}
                  </Text>
                  <TouchableOpacity 
                    className='mt-4'
                    onPress={() => router.push('/create-event')}
                  >
                    <Text className='text-primary font-semibold'>Create Your First Event →</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                myEvents.map((event) => (
                  <TouchableOpacity 
                    key={event._id}
                    className='bg-white border border-gray-100 rounded-xl mb-3 overflow-hidden shadow-sm'
                    onPress={() => router.push(`/manage-event/${event._id}`)}
                  >
                    <View className='flex-row'>
                      <View className='w-24 h-24 bg-gray-200 justify-center items-center'>
                        <Ionicons name="calendar" size={30} color={COLORS.primary} />
                      </View>
                      <View className='flex-1 p-3'>
                        <Text className='text-black font-bold'>{event.title}</Text>
                        <Text className='text-gray-500 text-sm mt-1'>
                          {new Date(event.date).toLocaleDateString()}
                        </Text>
                        <View className='flex-row justify-between items-center mt-2'>
                          <Text className='text-primary font-semibold'>
                            {event.availableSpots ?? event.capacity - (event.soldTickets || 0)} spots left
                          </Text>
                          <View className={`px-2 py-1 rounded-full ${event.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Text className={`text-xs ${event.status === 'active' ? 'text-green-700' : 'text-red-700'}`}>
                              {event.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Edit Profile Section */}
            {isEditing ? (
              <View className='p-4 border-t border-gray-100'>
                <Text className='text-xl font-bold text-black mb-4'>Edit Profile</Text>
                <View className='mb-4'>
                  <Text className='text-gray-700 mb-2 font-semibold'>First Name</Text>
                  <TextInput
                    className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>
                <View className='mb-4'>
                  <Text className='text-gray-700 mb-2 font-semibold'>Last Name</Text>
                  <TextInput
                    className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                  />
                </View>
                <View className='mb-4'>
                  <Text className='text-gray-700 mb-2 font-semibold'>Email</Text>
                  <TextInput
                    className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View className='mb-6'>
                  <Text className='text-gray-700 mb-2 font-semibold'>Interests (comma separated)</Text>
                  <TextInput
                    className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'
                    value={formData.interests}
                    onChangeText={(text) => setFormData({ ...formData, interests: text })}
                    placeholder="Music, Sports, Tech, etc."
                  />
                </View>
                <View className='flex-row gap-3'>
                  <TouchableOpacity 
                    className='flex-1 bg-black   py-3 rounded-xl'
                    onPress={handleUpdate}
                    disabled={loading}
                  >
                    <Text className='text-white text-center font-bold'>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className='flex-1 bg-gray-300 py-3 rounded-xl'
                    onPress={() => setIsEditing(false)}
                  >
                    <Text className='text-black text-center font-bold'>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className='p-4 border-t border-gray-100'>
                <TouchableOpacity 
                  className='flex-row justify-between items-center py-4'
                  onPress={() => setIsEditing(true)}
                >
                  <Text className='text-black font-semibold'>Edit Profile</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className='flex-row justify-between items-center py-4'
                  onPress={() => router.push('/mytickets')}
                >
                  <Text className='text-black font-semibold'>My Tickets</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  className='bg-red-500 flex-row items-center justify-center py-3 rounded-xl mt-4'
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={20} color="white" />
                  <Text className='text-white font-bold ml-2'>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Auth Modal */}
      <Modal
        visible={showAuthModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAuthModal(false)}
      >
        <TouchableOpacity 
          className='flex-1 bg-black/50 justify-center items-center'
          activeOpacity={1}
          onPress={() => setShowAuthModal(false)}
        >
          <TouchableOpacity 
            className='bg-white rounded-2xl mx-6 p-6 w-[350px]'
            activeOpacity={1}
            onPress={() => {}}
          >
            <View className='items-center mb-4'>
              <View className='w-16 h-16 bg-primary rounded-full justify-center items-center'>
                <Ionicons name="ticket" size={30} color="white" />
              </View>
              <Text className='text-2xl font-bold text-black mt-2'>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Text>
            </View>

            {!isLogin && (
              <>
                <TextInput
                  className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3'
                  placeholder="First Name"
                  value={authForm.name}
                  onChangeText={(text) => setAuthForm({ ...authForm, name: text })}
                />
                <TextInput
                  className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3'
                  placeholder="Last Name"
                  value={authForm.lastName}
                  onChangeText={(text) => setAuthForm({ ...authForm, lastName: text })}
                />
              </>
            )}

            <TextInput
              className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3'
              placeholder="Email"
              value={authForm.email}
              onChangeText={(text) => setAuthForm({ ...authForm, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3'
              placeholder="Password"
              value={authForm.password}
              onChangeText={(text) => setAuthForm({ ...authForm, password: text })}
              secureTextEntry
            />

            {!isLogin && (
              <TextInput
                className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4'
                placeholder="Interests (Music, Sports, etc.)"
                value={authForm.interests}
                onChangeText={(text) => setAuthForm({ ...authForm, interests: text })}
              />
            )}

            <TouchableOpacity 
              className={`py-3 rounded-xl mb-3 ${authLoading2 ? 'bg-gray-400' : 'bg-primary'}`}
              onPress={handleAuth}
              disabled={authLoading2}
            >
              <Text className='text-white text-center font-bold'>
                {authLoading2 ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text className='text-center text-gray-600'>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text className='text-primary font-bold'>{isLogin ? 'Sign Up' : 'Login'}</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className='mt-3'
              onPress={() => setShowAuthModal(false)}
            >
              <Text className='text-center text-gray-500'>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}