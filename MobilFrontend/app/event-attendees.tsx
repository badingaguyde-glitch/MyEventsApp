import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import api from '@/assets/constants/api'

export default function MobileEventAttendees() {
  const { eventId } = useLocalSearchParams()
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAttendees() }, [eventId])

  const loadAttendees = async () => {
    try {
      const res = await api.get(`/events/${eventId}/attendees`)
      setAttendees(res.data)
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message || 'Impossible d\'afficher les participants')
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (userId: string) => {
    try {
      await api.post(`/users/${userId}/follow`)
      Alert.alert('Succès', 'Abonnement mis à jour !')
      loadAttendees()
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message || 'Impossible de suivre cet utilisateur')
    }
  }

  if (loading) return <View className="flex-1 justify-center"><ActivityIndicator size="large" /></View>

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="black" /></TouchableOpacity>
        <Text className="text-lg font-black text-black">Participants Rencontrés</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={attendees} 
        keyExtractor={(item: any) => item._id} 
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }: any) => (
          <View className="flex-row justify-between items-center py-3 border-b border-gray-50">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
                <Ionicons name="person" size={20} color="gray" />
              </View>
              <View>
                <Text className="text-sm font-bold text-black">{item.name} {item.lastName}</Text>
                <Text className="text-xs text-gray-500 capitalize">{item.role}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleFollow(item._id)} className="bg-black px-4 py-1.5 rounded-lg">
              <Text className="text-white text-xs font-bold">Suivre</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  )
}
