import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, RefreshControl } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import Header from '@/Components/Header'
import api from '@/assets/constants/api'
import { COLORS } from '@/assets/constants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAuth } from '@/context/AuthContext'
import { CameraView, useCameraPermissions } from 'expo-camera'

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

  const fetchEventDetails = async () => {
    try {
      const eventRes = await api.get(`/events/${id}`)
      setEvent(eventRes.data)
      
      const participantsRes = await api.get(`/events/${id}/participants`)
      setParticipants(participantsRes.data.participants || [])
    } catch (error: any) {
      console.error('Error fetching event details:', error)
      if (error.response?.status === 403) {
        Alert.alert('Access Denied', 'You are not authorized to manage this event')
        router.back()
      } else {
        Alert.alert('Error', 'Failed to load event details')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchEventDetails()
  }

  const handleVerifyTicket = async (code: string) => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter a ticket code')
      return false
    }

    setVerifying(true)
    try {
      const response = await api.post('/tickets/verify', {
        eventId: id,
        ticketCode: code.trim().toUpperCase()
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
            <View className={`px-3 py-1 rounded-full ${event.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
              <Text className='text-white text-xs font-bold uppercase'>{event.status}</Text>
            </View>
          </View>
        </View>

        <View className='p-4'>
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