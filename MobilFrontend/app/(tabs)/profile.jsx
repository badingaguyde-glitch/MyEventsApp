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
              onPress={() => router.push('/login')}
            >
              <Text className='text-white text-center font-bold text-lg'>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className='border-2 border-primary w-full py-4 rounded-xl'
              onPress={() => router.push('/login?mode=signup')}
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

              {myEvents.some(e => e.status === 'pending_payment') && (
                <View className='mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex-row items-start shadow-sm'>
                  <Ionicons name="mail-unread-outline" size={20} color="#d97706" style={{ marginTop: 2, marginRight: 8 }} />
                  <View className='flex-1'>
                    <Text className='text-amber-800 font-bold text-sm'>Unpaid Activation Fees</Text>
                    <Text className='text-amber-700 text-xs mt-1 leading-4'>
                      Some of your events are pending activation. Check your emails (including spam) for the activation payment links to publish them.
                    </Text>
                  </View>
                </View>
              )}

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
                          <View className={`px-2 py-1 rounded-full ${
                            event.status === 'active' 
                              ? 'bg-green-100' 
                              : event.status === 'pending_payment'
                              ? 'bg-amber-100'
                              : 'bg-red-100'
                          }`}>
                            <Text className={`text-xs font-bold ${
                              event.status === 'active' 
                                ? 'text-green-700' 
                                : event.status === 'pending_payment'
                                ? 'text-amber-700'
                                : 'text-red-700'
                            }`}>
                              {event.status === 'pending_payment' ? 'pending payment' : event.status}
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
                  className='flex-row justify-between items-center py-4 border-b border-gray-100'
                  onPress={() => setIsEditing(true)}
                >
                  <Text className='text-black font-semibold'>Edit Profile</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className='flex-row justify-between items-center py-4 border-b border-gray-100'
                  onPress={() => router.push('/create-event')}
                >
                  <Text className='text-black font-semibold'>Create Event</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className='flex-row justify-between items-center py-4 border-b border-gray-100'
                  onPress={() => router.push('/mytickets')}
                >
                  <Text className='text-black font-semibold'>My Tickets</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  className='flex-row justify-between items-center py-4 border-b border-gray-100'
                  onPress={() => router.push('/marketplace')}
                >
                  <Text className='text-black font-semibold'>Marketplace Prestataires</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  className='flex-row justify-between items-center py-4 border-b border-gray-100'
                  onPress={() => router.push('/social-feed')}
                >
                  <Text className='text-black font-semibold'>Fil Social</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
                </TouchableOpacity>

                <View className='flex-row justify-between items-center py-4 border-b border-gray-100'>
                  <Text className='text-black font-semibold'>Profil Public (Réseau)</Text>
                  <TouchableOpacity 
                    onPress={async () => {
                      try {
                        const newPublicState = !user.isProfilePublic;
                        const res = await api.put('/user', { isProfilePublic: newPublicState });
                        updateUser(res.data);
                        Alert.alert('Succès', `Profil rendu ${newPublicState ? 'public' : 'confidentiel'}`);
                      } catch(e) {
                        Alert.alert('Erreur', 'Impossible de modifier le profil');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg ${user.isProfilePublic ? 'bg-green-600' : 'bg-gray-400'}`}
                  >
                    <Text className='text-white text-xs font-bold'>{user.isProfilePublic ? 'Activé' : 'Désactivé'}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  className='flex-row justify-between items-center py-4 border-b border-gray-100'
                  onPress={() => router.push('/provider-dashboard')}
                >
                  <Text className='text-black font-semibold'>Espace Prestataire</Text>
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


    </SafeAreaView>
  )
}