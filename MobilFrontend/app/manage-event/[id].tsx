import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, RefreshControl, Linking, Switch } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import Header from '@/Components/Header'
import api from '@/assets/constants/api'
import { COLORS } from '@/assets/constants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAuth } from '@/context/AuthContext'
import { CameraView, useCameraPermissions } from 'expo-camera'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface Participant {
  ticketId: string
  ticketCode: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  purchaseDate: string
  status: string
  checkInTime?: string
}

interface EventData {
  _id: string
  title: string
  description: string
  category: string[]
  date: string
  capacity: number
  location: {
    venue: string
    address: string
    city: string
  }
  price: number
  image: string
  status: string
  availableSpots?: number
  isSoldOut?: boolean
  soldTickets?: number
  checkedIn?: number
}

export default function ManageEvent() {
  const { id } = useLocalSearchParams()
  const { user } = useAuth()
  const [event, setEvent] = useState<EventData | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [ticketCode, setTicketCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'participants'>('overview')
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [offlineQueue, setOfflineQueue] = useState<string[]>([])
  const [syncingOffline, setSyncingOffline] = useState(false)

  const handlePayEvent = async () => {
    setPaymentLoading(true)
    try {
      const response = await api.post(`/events/${id}/pay`)
      if (response.data.stripeUrl) {
        Linking.openURL(response.data.stripeUrl)
      } else if (response.data.event?.status === 'active') {
        Alert.alert('Success', 'Event activated successfully!')
        fetchEventDetails()
      } else {
        Alert.alert('Success', 'Event activated!')
        fetchEventDetails()
      }
    } catch (error: any) {
      console.error('Payment generation error:', error)
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate payment session')
    } finally {
      setPaymentLoading(false)
    }
  }

  const fetchEventDetails = async () => {
    try {
      const eventRes = await api.get(`/events/${id}`)
      setEvent(eventRes.data)
      await AsyncStorage.setItem(`offline_event_${id}`, JSON.stringify(eventRes.data))
      
      const participantsRes = await api.get(`/events/${id}/participants`)
      const participantsList = participantsRes.data.participants || []
      setParticipants(participantsList)
      await AsyncStorage.setItem(`offline_participants_${id}`, JSON.stringify(participantsList))
    } catch (error: any) {
      console.error('Error fetching event details:', error)
      try {
        const cachedEvent = await AsyncStorage.getItem(`offline_event_${id}`)
        const cachedParticipants = await AsyncStorage.getItem(`offline_participants_${id}`)
        if (cachedEvent && cachedParticipants) {
          setEvent(JSON.parse(cachedEvent))
          setParticipants(JSON.parse(cachedParticipants))
          setIsOfflineMode(true)
          Alert.alert('Offline Mode Active', 'Failed to reach the server. Loaded cached event and participant data instead.')
        } else {
          if (error.response?.status === 403) {
            Alert.alert('Access Denied', 'You are not authorized to manage this event')
            router.back()
          } else {
            Alert.alert('Error', 'Failed to load event details. No cached data available.')
          }
        }
      } catch (cacheError) {
        console.error('Cache read error:', cacheError)
        Alert.alert('Error', 'Failed to load event details')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadOfflineData = async () => {
    try {
      const cachedQueue = await AsyncStorage.getItem(`offline_queue_${id}`)
      if (cachedQueue) {
        setOfflineQueue(JSON.parse(cachedQueue))
      }
    } catch (err) {
      console.error('Error loading offline queue:', err)
    }
  }

  const handleSyncOfflineCheckins = async () => {
    if (offlineQueue.length === 0) return

    setSyncingOffline(true)
    try {
      const response = await api.post('/tickets/bulk-verify', {
        eventId: id,
        ticketCodes: offlineQueue
      })
      
      const successCount = response.data.successful
      const failedCount = response.data.failed
      
      Alert.alert(
        'Synchronization Complete',
        `Successfully synced ${successCount} tickets.\nFailed tickets: ${failedCount}.`
      )
      
      setOfflineQueue([])
      await AsyncStorage.removeItem(`offline_queue_${id}`)
      fetchEventDetails()
    } catch (error: any) {
      console.error('Error syncing check-ins:', error)
      Alert.alert(
        'Sync Failed',
        error.response?.data?.message || 'Could not connect to the server to sync offline check-ins. Please try again when you have internet access.'
      )
    } finally {
      setSyncingOffline(false)
    }
  }

  const handleToggleOfflineMode = async (value: boolean) => {
    if (value) {
      try {
        const cachedParticipants = await AsyncStorage.getItem(`offline_participants_${id}`)
        if (!cachedParticipants || JSON.parse(cachedParticipants).length === 0) {
          Alert.alert(
            'Cache Unavailable',
            'No cached participants found. Please connect to the internet and load the details page once to cache event data before enabling offline mode.',
            [{ text: 'OK' }]
          )
          return
        }
        setIsOfflineMode(true)
        Alert.alert('Offline Mode Active', 'You are now verifying tickets locally. Offline changes will need to be synced.')
      } catch (err) {
        console.error('Error enabling offline mode:', err)
      }
    } else {
      setIsOfflineMode(false)
      if (offlineQueue.length > 0) {
        Alert.alert(
          'Sync Required',
          `You have ${offlineQueue.length} unsynced check-ins. Would you like to synchronize them now?`,
          [
            { text: 'Sync Now', onPress: () => handleSyncOfflineCheckins() },
            { text: 'Cancel', style: 'cancel' }
          ]
        )
      }
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchEventDetails()
  }

  const handleVerifyTicket = async (code: string) => {
    const formattedCode = code.trim().toUpperCase()
    if (!formattedCode) {
      Alert.alert('Error', 'Please enter a ticket code')
      return false
    }

    setVerifying(true)
    try {
      if (isOfflineMode) {
        const participantIdx = participants.findIndex(p => p.ticketCode === formattedCode)
        if (participantIdx === -1) {
          Alert.alert('Invalid Ticket', 'Ticket code not found for this event.')
          setVerifying(false)
          return false
        }

        const participant = participants[participantIdx]
        if (participant.status === 'used') {
          Alert.alert('Invalid Ticket', 'Ticket has already been used.')
          setVerifying(false)
          return false
        }

        if (participant.status === 'cancelled') {
          Alert.alert('Invalid Ticket', 'Ticket has been cancelled.')
          setVerifying(false)
          return false
        }

        const updatedParticipants = [...participants]
        updatedParticipants[participantIdx] = {
          ...participant,
          status: 'used',
          checkInTime: new Date().toISOString()
        }
        setParticipants(updatedParticipants)
        await AsyncStorage.setItem(`offline_participants_${id}`, JSON.stringify(updatedParticipants))

        const newQueue = [...offlineQueue, formattedCode]
        setOfflineQueue(newQueue)
        await AsyncStorage.setItem(`offline_queue_${id}`, JSON.stringify(newQueue))

        Alert.alert('Success (Offline)', `Checked in ${participant.user?.firstName} ${participant.user?.lastName} offline.`)
        
        setTicketCode('')
        setShowVerifyModal(false)
        setShowScanner(false)
        setScanned(false)
        setVerifying(false)
        return true
      } else {
        const response = await api.post('/tickets/verify', {
          eventId: id,
          ticketCode: formattedCode
        })
        
        if (response.data.valid) {
          Alert.alert('Success', response.data.message)
          fetchEventDetails() // Refresh participants list
          setTicketCode('')
          setShowVerifyModal(false)
          setShowScanner(false)
          setScanned(false)
          return true
        } else {
          Alert.alert('Invalid Ticket', response.data.message)
          return false
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to verify ticket')
      return false
    } finally {
      setVerifying(false)
    }
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return
    setScanned(true)
    // The QR code contains the ticket code
    handleVerifyTicket(data)
  }

  const openScanner = async () => {
    const { granted } = await requestPermission()
    if (granted) {
      setShowScanner(true)
      setScanned(false)
    } else {
      Alert.alert('Permission Needed', 'Camera permission is required to scan QR codes')
    }
  }

  const handleCancelEvent = async () => {
    Alert.alert(
      'Cancel Event',
      'Are you sure you want to cancel this event? All tickets will be cancelled.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel Event', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/events/${id}`)
              Alert.alert('Success', 'Event cancelled successfully')
              router.back()
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel event')
            }
          }
        }
      ]
    )
  }

  useEffect(() => {
    fetchEventDetails()
    loadOfflineData()
  }, [id])

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

  const soldTickets = participants.length
  const totalRevenue = soldTickets * event.price
  const checkedIn = participants.filter(p => p.status === 'used').length

  return (
    <SafeAreaView className='flex-1 bg-white' edges={["top"]}>
      <Header showBack />

      <ScrollView 
        className='flex-1'
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Event Header */}
        <View className='relative'>
          <View className='w-full h-48 bg-gray-200 justify-center items-center'>
            <Ionicons name="calendar" size={60} color={COLORS.primary} />
          </View>
          <View className='absolute top-4 right-4'>
            <View className={`px-3 py-1 rounded-full ${
              event.status === 'active' 
                ? 'bg-green-500' 
                : event.status === 'pending_payment'
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}>
              <Text className='text-white text-xs font-bold uppercase'>
                {event.status === 'pending_payment' ? 'pending payment' : event.status}
              </Text>
            </View>
          </View>
        </View>

        <View className='p-4'>
          {event.status === 'pending_payment' && (
            <View className='bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 shadow-sm'>
              <View className='flex-row items-center mb-2'>
                <Ionicons name="warning" size={24} color="#d97706" />
                <Text className='text-amber-800 font-bold text-lg ml-2'>Payment Required</Text>
              </View>
              <Text className='text-amber-700 mb-3 leading-5 font-semibold'>
                This event is currently in pending payment status. You must pay the activation fee to publish this event and make it visible.
                Please check your email inbox (including spam folder) for the payment link to complete this, or pay directly below.
              </Text>
              <TouchableOpacity 
                className={`py-3 rounded-lg flex-row items-center justify-center ${paymentLoading ? 'bg-amber-300' : 'bg-amber-600'}`}
                onPress={handlePayEvent}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="card" size={20} color="white" />
                    <Text className='text-white font-bold ml-2'>Pay Creation Fee</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Text className='text-2xl font-bold text-black mb-2'>{event.title}</Text>
          
          <View className='flex-row items-center mb-2'>
            <Ionicons name="calendar-outline" size={18} color={COLORS.secondary} />
            <Text className='text-gray-600 ml-2'>
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>

          <View className='flex-row items-center mb-4'>
            <Ionicons name="location-outline" size={18} color={COLORS.secondary} />
            <Text className='text-gray-600 ml-2'>{event.location.venue}, {event.location.city}</Text>
          </View>

          {/* Offline Mode & Sync Banner */}
          <View className='bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4 shadow-sm'>
            <View className='flex-row justify-between items-center'>
              <View className='flex-row items-center'>
                <Ionicons 
                  name={isOfflineMode ? "cloud-offline" : "cloud-done"} 
                  size={24} 
                  color={isOfflineMode ? COLORS.secondary : "#10B981"} 
                />
                <View className='ml-3'>
                  <Text className='font-bold text-black text-base'>Offline Verification</Text>
                  <Text className='text-gray-500 text-xs'>
                    {isOfflineMode ? 'Verifying locally using cache' : 'Verifying with server in real-time'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isOfflineMode}
                onValueChange={handleToggleOfflineMode}
                trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
                thumbColor={isOfflineMode ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>

            {offlineQueue.length > 0 && (
              <View className='mt-3 pt-3 border-t border-gray-200/80 flex-row justify-between items-center'>
                <View className='flex-row items-center'>
                  <Ionicons name="sync" size={20} color="#F59E0B" />
                  <Text className='text-orange-700 font-semibold text-sm ml-2'>
                    {offlineQueue.length} check-in{offlineQueue.length > 1 ? 's' : ''} pending sync
                  </Text>
                </View>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-lg flex-row items-center ${syncingOffline ? 'bg-orange-200' : 'bg-orange-500'}`}
                  onPress={handleSyncOfflineCheckins}
                  disabled={syncingOffline}
                >
                  {syncingOffline ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={16} color="white" />
                      <Text className='text-white font-bold text-xs ml-1.5'>Sync Now</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Stats Cards */}
          <View className='flex-row gap-3 mb-6'>
            <View className='flex-1 bg-blue-50 p-3 rounded-xl'>
              <Text className='text-blue-700 text-2xl font-bold'>{soldTickets}</Text>
              <Text className='text-gray-600 text-xs'>Tickets Sold</Text>
            </View>
            <View className='flex-1 bg-green-50 p-3 rounded-xl'>
              <Text className='text-green-700 text-2xl font-bold'>{checkedIn}</Text>
              <Text className='text-gray-600 text-xs'>Checked In</Text>
            </View>
            <View className='flex-1 bg-purple-50 p-3 rounded-xl'>
              <Text className='text-purple-700 text-2xl font-bold'>${totalRevenue}</Text>
              <Text className='text-gray-600 text-xs'>Revenue</Text>
            </View>
          </View>

          {/* Tab Navigation */}
          <View className='flex-row mb-4 border-b border-gray-200'>
            <TouchableOpacity 
              className={`flex-1 py-3 ${activeTab === 'overview' ? 'border-b-2 border-black' : ''}`}
              onPress={() => setActiveTab('overview')}
            >
              <Text className={`text-center font-semibold ${activeTab === 'overview' ? 'text-black' : 'text-gray-500'}`}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-1 py-3 ${activeTab === 'participants' ? 'border-b-2 border-black' : ''}`}
              onPress={() => setActiveTab('participants')}
            >
              <Text className={`text-center font-semibold ${activeTab === 'participants' ? 'text-black' : 'text-gray-500'}`}>
                Participants ({soldTickets})
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'overview' ? (
            <>
              {/* Event Description */}
              <View className='mb-6'>
                <Text className='text-lg font-bold text-black mb-2'>Description</Text>
                <Text className='text-gray-600 leading-6'>{event.description}</Text>
              </View>

              {/* Categories */}
              <View className='mb-6'>
                <Text className='text-lg font-bold text-black mb-2'>Categories</Text>
                <View className='flex-row flex-wrap gap-2'>
                  {event.category.map((cat, index) => (
                    <View key={index} className='bg-gray-100 px-3 py-1 rounded-full'>
                      <Text className='text-gray-600 text-sm'>{cat}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Capacity Info */}
              <View className='bg-gray-50 rounded-xl p-4 mb-6'>
                <Text className='text-lg font-bold text-black mb-2'>Capacity & Availability</Text>
                <View className='flex-row justify-between mb-2'>
                  <Text className='text-gray-600'>Total Capacity</Text>
                  <Text className='text-black font-semibold'>{event.capacity}</Text>
                </View>
                <View className='flex-row justify-between mb-2'>
                  <Text className='text-gray-600'>Tickets Sold</Text>
                  <Text className='text-black font-semibold'>{soldTickets}</Text>
                </View>
                <View className='flex-row justify-between'>
                  <Text className='text-gray-600'>Checked In</Text>
                  <Text className='text-black font-semibold'>{checkedIn}</Text>
                </View>
                <View className='flex-row justify-between mt-2'>
                  <Text className='text-gray-600'>Remaining to Check In</Text>
                  <Text className={`font-semibold ${soldTickets - checkedIn === 0 ? 'text-green-500' : 'text-orange-500'}`}>
                    {soldTickets - checkedIn}
                  </Text>
                </View>
                <View className='mt-3 h-2 bg-gray-200 rounded-full overflow-hidden'>
                  <View 
                    className='h-full bg-black rounded-full'
                    style={{ width: `${(checkedIn / soldTickets) * 100}%` }}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View className='gap-3 mb-6'>
                {/* Scan QR Code Button */}
                <TouchableOpacity 
                  className='bg-black py-4 rounded-xl flex-row items-center justify-center'
                  onPress={openScanner}
                >
                  <Ionicons name="qr-code" size={24} color="white" />
                  <Text className='text-white font-bold text-lg ml-2'>Scan QR Code</Text>
                </TouchableOpacity>

                {/* Manual Entry Button */}
                <TouchableOpacity 
                  className='bg-gray-700 py-4 rounded-xl flex-row items-center justify-center'
                  onPress={() => setShowVerifyModal(true)}
                >
                  <Ionicons name="create-outline" size={24} color="white" />
                  <Text className='text-white font-bold text-lg ml-2'>Enter Code Manually</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  className='bg-orange-500 py-4 rounded-xl flex-row items-center justify-center'
                  onPress={() => router.push(`/event/${id}`)}
                >
                  <Ionicons name="eye" size={24} color="white" />
                  <Text className='text-white font-bold text-lg ml-2'>View Event Page</Text>
                </TouchableOpacity>

                {event.status === 'active' && (
                  <TouchableOpacity 
                    className='bg-red-500 py-4 rounded-xl flex-row items-center justify-center'
                    onPress={handleCancelEvent}
                  >
                    <Ionicons name="close-circle" size={24} color="white" />
                    <Text className='text-white font-bold text-lg ml-2'>Cancel Event</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            // Participants List
            <View className='mb-6'>
              {participants.length === 0 ? (
                <View className='bg-gray-50 rounded-xl p-8 items-center'>
                  <Ionicons name="people-outline" size={50} color={COLORS.secondary} />
                  <Text className='text-gray-500 text-center mt-3'>No tickets sold yet</Text>
                </View>
              ) : (
                participants.map((participant, index) => (
                  <View key={participant.ticketId} className='bg-gray-50 rounded-xl p-4 mb-3'>
                    <View className='flex-row justify-between items-start mb-2'>
                      <View>
                        <Text className='text-black font-bold'>
                          {participant.user?.firstName} {participant.user?.lastName}
                        </Text>
                        <Text className='text-gray-500 text-sm'>{participant.user?.email}</Text>
                      </View>
                      <View className={`px-2 py-1 rounded-full ${participant.status === 'used' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        <Text className={`text-xs ${participant.status === 'used' ? 'text-green-700' : 'text-yellow-700'}`}>
                          {participant.status === 'used' ? 'Checked In' : 'Active'}
                        </Text>
                      </View>
                    </View>
                    <View className='flex-row justify-between items-center mt-2 pt-2 border-t border-gray-200'>
                      <View>
                        <Text className='text-gray-500 text-xs'>Ticket Code</Text>
                        <Text className='text-black font-mono text-sm font-bold'>{participant.ticketCode}</Text>
                      </View>
                      {participant.checkInTime && (
                        <Text className='text-gray-500 text-xs'>
                          {new Date(participant.checkInTime).toLocaleTimeString()}
                        </Text>
                      )}
                    </View>
                    {participant.status !== 'used' && (
                      <TouchableOpacity 
                        className='mt-3 bg-black py-2 rounded-lg'
                        onPress={() => handleVerifyTicket(participant.ticketCode)}
                      >
                        <Text className='text-white text-center font-semibold'>Mark as Checked In</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Manual Verify Modal */}
      <Modal
        visible={showVerifyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowVerifyModal(false)
          setTicketCode('')
        }}
      >
        <TouchableOpacity 
          className='flex-1 bg-black/50 justify-center items-center'
          activeOpacity={1}
          onPress={() => {
            setShowVerifyModal(false)
            setTicketCode('')
          }}
        >
          <TouchableOpacity 
            className='bg-white rounded-2xl mx-6 p-6 w-[350px]'
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text className='text-xl font-bold text-black mb-4 text-center'>Verify Ticket</Text>
            
            <TextInput
              className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-center font-mono text-lg'
              placeholder="Enter Ticket Code (e.g., TKT-XXXXXXXX)"
              value={ticketCode}
              onChangeText={setTicketCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <Text className='text-gray-500 text-xs text-center mb-4'>
              Example: TKT-A1B2C3D4
            </Text>

            <TouchableOpacity 
              className={`py-3 rounded-xl mb-3 ${verifying ? 'bg-gray-400' : 'bg-black'}`}
              onPress={() => handleVerifyTicket(ticketCode)}
              disabled={verifying}
            >
              <Text className='text-white text-center font-bold'>
                {verifying ? 'Verifying...' : 'Verify Ticket'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className='py-2'
              onPress={() => {
                setShowVerifyModal(false)
                setTicketCode('')
              }}
            >
              <Text className='text-center text-gray-500'>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* QR Code Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => {
          setShowScanner(false)
          setScanned(false)
        }}
      >
        <SafeAreaView className='flex-1 bg-black'>
          <View className='flex-row justify-between items-center p-4 bg-black'>
            <Text className='text-white text-lg font-bold'>Scan QR Code</Text>
            <TouchableOpacity onPress={() => {
              setShowScanner(false)
              setScanned(false)
            }}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
          
          {!permission?.granted ? (
            <View className='flex-1 justify-center items-center p-4'>
              <Text className='text-white text-center mb-4'>Camera permission is required to scan QR codes</Text>
              <TouchableOpacity 
                className='bg-white px-6 py-3 rounded-xl'
                onPress={requestPermission}
              >
                <Text className='text-black font-bold'>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CameraView
              style={{ flex: 1 }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'codabar', 'code39', 'code93', 'code128', 'ean8', 'ean13', 'itf14', 'upc_a', 'upc_e'],
              }}
            >
              <View className='flex-1 justify-center items-center'>
                <View className='w-64 h-64 border-2 border-white rounded-lg bg-transparent'>
                  <View className='absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white' />
                  <View className='absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white' />
                  <View className='absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white' />
                  <View className='absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white' />
                </View>
                <Text className='text-white text-center mt-4 bg-black/70 px-4 py-2 rounded-full'>
                  Position the QR code inside the frame
                </Text>
              </View>
            </CameraView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}