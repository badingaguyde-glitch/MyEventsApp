import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import api from '@/assets/constants/api'

interface Notification {
  _id: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
  type: string
  refModel?: string
  refId?: string
  sender?: { name: string; lastName: string }
}

const TYPE_ICON: Record<string, { name: string; color: string }> = {
  new_event: { name: 'calendar', color: '#6366f1' },
  booking_request: { name: 'briefcase', color: '#f59e0b' },
  booking_accepted: { name: 'checkmark-circle', color: '#10b981' },
  booking_rejected: { name: 'close-circle', color: '#ef4444' },
  new_follower: { name: 'person-add', color: '#8b5cf6' },
}

export default function MobileNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadNotifications() }, [])

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (e) {
      console.error(e)
    }
  }

  const handlePressNotification = async (notif: Notification) => {
    // Mark as read
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif._id}/read`)
        setNotifications(prev =>
          prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
        )
      } catch (e) { console.error(e) }
    }
    // Navigate to event if applicable
    if (notif.refModel === 'Event' && notif.refId) {
      router.push(`/events/${notif.refId}`)
    }
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'À l\'instant'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`
    return `${Math.floor(seconds / 86400)} j`
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) return <View className="flex-1 justify-center"><ActivityIndicator size="large" /></View>

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-black">Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text className="text-xs text-indigo-500 font-bold">Tout lire</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 8 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-24">
            <Ionicons name="notifications-off-outline" size={48} color="#d1d5db" />
            <Text className="text-sm text-gray-400 mt-3">Aucune notification</Text>
          </View>
        }
        renderItem={({ item }) => {
          const icon = TYPE_ICON[item.type] || { name: 'notifications', color: '#6b7280' }
          return (
            <TouchableOpacity
              onPress={() => handlePressNotification(item)}
              className={`flex-row items-start gap-3 p-4 rounded-2xl mb-1 ${!item.isRead ? 'bg-indigo-50' : 'bg-white'}`}
            >
              {/* Icon */}
              <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: `${icon.color}18` }}>
                <Ionicons name={icon.name as any} size={20} color={icon.color} />
              </View>

              {/* Content */}
              <View className="flex-1">
                <View className="flex-row items-start justify-between gap-2">
                  <Text className="text-xs font-bold text-black flex-1" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text className="text-[10px] text-gray-400 shrink-0">{timeAgo(item.createdAt)}</Text>
                </View>
                <Text className="text-xs text-gray-500 mt-0.5 leading-4" numberOfLines={2}>
                  {item.body}
                </Text>
              </View>

              {/* Unread dot */}
              {!item.isRead && (
                <View className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              )}
            </TouchableOpacity>
          )
        }}
      />
    </SafeAreaView>
  )
}
