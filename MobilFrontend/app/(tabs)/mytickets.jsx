import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, Alert } from 'react-native'
import React, { useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/Components/Header'
import { router, useFocusEffect } from 'expo-router'
import api from '@/assets/constants/api'
import { Ticket, COLORS } from '@/assets/constants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAuth } from '@/context/AuthContext'
import QRCode from 'react-native-qrcode-svg'

export default function MyTickets() {
  const { user, loading: authLoading } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)

  const fetchTickets = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    try {
      // Using the correct endpoint from your routes: GET /api/tickets
      const response = await api.get('/tickets')
      console.log('Tickets response:', response.data)
      setTickets(response.data)
    } catch (error) {
      console.error('Error fetching tickets:', error.response?.data || error)
      // If there's an error, show empty array
      setTickets([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  const cancelTicket = async (ticketId) => {
    Alert.alert(
      'Cancel Ticket',
      'Are you sure you want to cancel this ticket?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/tickets/${ticketId}`)
              Alert.alert('Success', 'Ticket cancelled successfully')
              fetchTickets()
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel ticket')
            }
          }
        }
      ]
    )
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchTickets()
  }

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchTickets()
      } else {
        setLoading(false)
      }
    }, [user, fetchTickets])
  )

  const getStatusBadge = (status, eventStatus) => {
    if (eventStatus === 'past') {
      return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Past Event' }
    }

    switch (status) {
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' }
      case 'used':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Used' }
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', label: status }
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <SafeAreaView className='flex-1 bg-white justify-center items-center'>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    )
  }

  // User not logged in - Show login prompt
  if (!user) {
    return (
      <SafeAreaView className='flex-1 bg-white' edges={["top"]}>
        <Header showBack showLogo />
        <View className='flex-1 justify-center items-center px-6'>
          <View className='w-24 h-24 bg-primary/10 rounded-full justify-center items-center mb-6'>
            <Ionicons name="ticket-outline" size={50} color={COLORS.primary} />
          </View>
          <Text className='text-2xl font-bold text-black text-center mb-2'>No Tickets Yet</Text>
          <Text className='text-gray-500 text-center mb-8'>
            Please login to view your tickets
          </Text>
          <TouchableOpacity 
            className='bg-black w-full py-4 rounded-xl'
            onPress={() => router.push('/login')}
          >
            <Text className='text-white text-center font-bold text-lg'>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Loading tickets
  if (loading) {
    return (
      <SafeAreaView className='flex-1 bg-white justify-center items-center'>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    )
  }

  // User logged in but no tickets
  if (!loading && tickets.length === 0) {
    return (
      <SafeAreaView className='flex-1 bg-white' edges={["top"]}>
        <Header showBack showLogo />
        <View className='flex-1 justify-center items-center px-6'>
          <View className='w-24 h-24 bg-primary/10 rounded-full justify-center items-center mb-6'>
            <Ionicons name="ticket-outline" size={50} color={COLORS.primary} />
          </View>
          <Text className='text-2xl font-bold text-black text-center mb-2'>No Tickets Yet</Text>
          <Text className='text-gray-500 text-center mb-8'>
            {"You haven't purchased any tickets yet. Browse events and get your tickets now!"}
          </Text>
          <TouchableOpacity 
            className='bg-black w-full py-4 rounded-xl'
            onPress={() => router.push('/events')}
          >
            <Text className='text-white text-center font-bold text-lg'>Browse Events</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // User logged in with tickets - Show tickets list
  return (
    <SafeAreaView className='flex-1 bg-white' edges={["top"]}>
      <Header showBack showLogo />

      <FlatList
        data={tickets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const statusBadge = getStatusBadge(item.status, item.eventStatus)
          const eventDate = new Date(item.event.date)
          const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
          const formattedTime = eventDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })

          return (
            <TouchableOpacity 
              className='mx-4 mb-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'
              onPress={() => setSelectedTicket(item)}
            >
              <View className='p-4'>
                <View className='flex-row justify-between items-start'>
                  <View className='flex-1'>
                    <Text className='text-lg font-bold text-black'>{item.event.title}</Text>
                    <View className='flex-row items-center mt-2'>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.secondary} />
                      <Text className='text-gray-500 text-sm ml-1'>{formattedDate}</Text>
                      <Ionicons name="time-outline" size={14} color={COLORS.secondary} className='ml-3' />
                      <Text className='text-gray-500 text-sm ml-1'>{formattedTime}</Text>
                    </View>
                    <View className='flex-row items-center mt-1'>
                      <Ionicons name="location-outline" size={14} color={COLORS.secondary} />
                      <Text className='text-gray-500 text-sm ml-1'>{item.event.location.venue}</Text>
                    </View>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${statusBadge.bg}`}>
                    <Text className={`text-xs font-bold ${statusBadge.text}`}>{statusBadge.label}</Text>
                  </View>
                </View>

                <View className='flex-row justify-between items-center mt-4 pt-3 border-t border-gray-100'>
                  <View>
                    <Text className='text-gray-500 text-xs'>Ticket Code</Text>
                    <Text className='text-black font-mono text-sm font-bold'>{item.ticketCode}</Text>
                  </View>
                  <Text className='text-primary font-bold text-lg'>${item.price}</Text>
                </View>

                {item.status === 'active' && item.eventStatus !== 'past' && (
                  <TouchableOpacity 
                    className='mt-3 bg-red-50 py-2 rounded-lg'
                    onPress={() => cancelTicket(item._id)}
                  >
                    <Text className='text-red-600 text-center font-semibold'>Cancel Ticket</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className='px-4 pb-2'>
            <Text className='text-2xl font-bold text-black'>My Tickets</Text>
            <Text className='text-gray-500 text-sm mt-1'>You have {tickets.length} ticket(s)</Text>
          </View>
        }
      />

      {/* Ticket Details Modal with QR Code */}
      {selectedTicket && (
        <Modal
          visible={!!selectedTicket}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedTicket(null)}
        >
          <TouchableOpacity 
            className='flex-1 bg-black/50 justify-center items-center'
            activeOpacity={1}
            onPress={() => setSelectedTicket(null)}
          >
            <View className='bg-white rounded-2xl mx-6 p-6 w-[320px]'>
              <View className='items-center mb-4'>
                <QRCode 
                  value={selectedTicket.ticketCode} 
                  size={180}
                />
              </View>
              <Text className='text-center text-black font-bold text-lg mb-2'>
                {selectedTicket.event.title}
              </Text>
              <Text className='text-center text-gray-600 text-sm mb-1'>
                Ticket Code: {selectedTicket.ticketCode}
              </Text>
              <Text className='text-center text-gray-600 text-sm'>
                {new Date(selectedTicket.event.date).toLocaleDateString()}
              </Text>
              <Text className='text-center text-primary font-bold text-lg mt-2'>
                ${selectedTicket.price}
              </Text>
              <TouchableOpacity 
                className='mt-4 bg-black py-3 rounded-xl'
                onPress={() => setSelectedTicket(null)}
              >
                <Text className='text-white text-center font-bold'>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  )
}