/**
 * usePushNotifications.ts
 *
 * Custom hook that:
 * 1. Requests push notification permissions from the OS
 * 2. Retrieves the Expo Push Token for this device
 * 3. Saves the token to the backend (PUT /user/push-token)
 * 4. Listens for incoming notifications (foreground) and notification taps (background/killed)
 * 5. Navigates to the relevant event when the user taps a notification
 *
 * Usage: call this hook once inside the authenticated root layout.
 */
import { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import { router } from 'expo-router'
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import api from '@/assets/constants/api'

// Configure how notifications are displayed when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export function usePushNotifications(isAuthenticated: boolean = false) {
  const notificationListener = useRef<Notifications.EventSubscription>()
  const responseListener = useRef<Notifications.EventSubscription>()

  useEffect(() => {
    // Only register when the user is logged in — token needs valid auth headers
    if (!isAuthenticated) return

    registerForPushNotifications()

    // Foreground notification received — just show it (handled by setNotificationHandler above)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Push] Notification received in foreground:', notification.request.content.title)
    })

    // User tapped a notification (foreground OR background/killed app)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any
      if (data?.eventId) {
        // Navigate to the event detail screen
        router.push(`/event/${data.eventId}`)
      } else {
        // Fallback: open notifications list
        router.push('/notifications')
      }
    })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [isAuthenticated])
}

async function registerForPushNotifications() {
  // Push notifications require a physical device (not simulator/emulator for APNs)
  if (!Constants.isDevice) {
    console.warn('[Push] Must use a physical device for push notifications.')
    return
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.warn('[Push] Permission not granted for push notifications.')
    return
  }

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'MyEventsApp',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366f1',
      sound: 'default',
    })
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId
      ?? Constants.expoConfig?.extra?.projectId
      ?? undefined

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    )
    const token = tokenData.data
    console.log('[Push] Expo Push Token:', token)

    // Send the token to the backend
    await api.put('/user/push-token', { expoPushToken: token })
  } catch (e: any) {
    console.error('[Push] Failed to get or save push token:', e?.message)
  }
}
