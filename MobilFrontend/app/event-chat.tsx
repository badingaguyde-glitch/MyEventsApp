/**
 * event-chat.tsx
 *
 * Chat de groupe de l'événement avec partage de médias.
 *
 * LIMITES APPLIQUÉES CÔTÉ CLIENT :
 *   - Photos  : max 5 MB  → compression automatique (expo-image-manipulator)
 *               si toujours > 5 MB après compression max → zip automatique (jszip)
 *   - Vidéos  : max 120 secondes de durée → rejet avec message clair
 *               max 100 MB de taille → zip automatique (jszip)
 */
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Image, Linking
} from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'
import JSZip from 'jszip'
import api from '@/assets/constants/api'

// ─── Limites ────────────────────────────────────────────────────────────────
const MAX_PHOTO_BYTES  = 5   * 1024 * 1024   // 5 MB
const MAX_VIDEO_BYTES  = 100 * 1024 * 1024   // 100 MB
const MAX_VIDEO_SECS   = 120                  // 2 minutes

// ─── Utilitaires ─────────────────────────────────────────────────────────────

/** Compresse une image jusqu'à ce qu'elle passe sous MAX_PHOTO_BYTES.
 *  Si même au quality 0.3 + resize 800px elle dépasse, on la zippe. */
async function processImage(uri: string, fileSize: number): Promise<{ uri: string; type: string; name: string }> {
  let currentUri = uri
  let currentSize = fileSize

  // Étape 1 : tentatives de compression progressive
  const attempts = [
    { quality: 0.8, maxWidth: 1920 },
    { quality: 0.6, maxWidth: 1280 },
    { quality: 0.3, maxWidth: 800 },
  ]

  for (const attempt of attempts) {
    if (currentSize <= MAX_PHOTO_BYTES) break
    const result = await ImageManipulator.manipulateAsync(
      currentUri,
      [{ resize: { width: attempt.maxWidth } }],
      { compress: attempt.quality, format: ImageManipulator.SaveFormat.JPEG }
    )
    currentUri = result.uri
    const info = await FileSystem.getInfoAsync(currentUri, { size: true })
    currentSize = (info as any).size || currentSize
  }

  // Étape 2 : si toujours trop grand → zip
  if (currentSize > MAX_PHOTO_BYTES) {
    return await zipFileUri(currentUri, `photo_${Date.now()}.jpg`)
  }

  return { uri: currentUri, type: 'image/jpeg', name: `photo_${Date.now()}.jpg` }
}

/** Zippe un fichier local (uri) et retourne un objet prêt pour l'upload. */
async function zipFileUri(uri: string, fileName: string): Promise<{ uri: string; type: string; name: string }> {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
  const zip = new JSZip()
  zip.file(fileName, base64, { base64: true })
  const zipBase64 = await zip.generateAsync({ type: 'base64', compression: 'DEFLATE', compressionOptions: { level: 9 } })

  const zipUri = FileSystem.cacheDirectory + `chat_${Date.now()}.zip`
  await FileSystem.writeAsStringAsync(zipUri, zipBase64, { encoding: FileSystem.EncodingType.Base64 })
  return { uri: zipUri, type: 'application/zip', name: `chat_${Date.now()}.zip` }
}

/** Prépare une vidéo : vérifie durée et taille, zippe si nécessaire. */
async function processVideo(uri: string, duration: number, fileSize: number): Promise<{ uri: string; type: string; name: string }> {
  if (duration > MAX_VIDEO_SECS) {
    throw new Error(`La vidéo dépasse ${MAX_VIDEO_SECS} secondes. Veuillez la raccourcir avant de l'envoyer.`)
  }

  if (fileSize > MAX_VIDEO_BYTES) {
    return await zipFileUri(uri, `video_${Date.now()}.mp4`)
  }

  return { uri, type: 'video/mp4', name: `video_${Date.now()}.mp4` }
}

/** Upload le fichier préparé vers le backend. */
async function uploadToBackend(file: { uri: string; type: string; name: string }, eventId: string) {
  const formData = new FormData()
  formData.append('media', { uri: file.uri, type: file.type, name: file.name } as any)
  const res = await api.post(`/events/${eventId}/chat/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120_000,
  })
  return res.data // { mediaUrl, mediaType, fileName }
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function MobileEventChat() {
  const { eventId } = useLocalSearchParams()
  const [messages, setMessages]   = useState<any[]>([])
  const [text, setText]           = useState('')
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [myUserId, setMyUserId]   = useState('')
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    initChat()
    const interval = setInterval(loadMessages, 4000)
    return () => clearInterval(interval)
  }, [eventId])

  const initChat = async () => {
    try {
      const user = JSON.parse(await AsyncStorage.getItem('user') || '{}')
      setMyUserId(user.id || user._id)
      await loadMessages()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const res = await api.get(`/events/${eventId}/chat`)
      setMessages(res.data)
    } catch (e) { console.error(e) }
  }

  // ── Envoi texte ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!text.trim()) return
    try {
      const res = await api.post(`/events/${eventId}/chat`, { content: text })
      setMessages(prev => [...prev, res.data])
      setText('')
      flatListRef.current?.scrollToEnd({ animated: true })
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de poster le message')
    }
  }

  // ── Sélection et envoi de média ──────────────────────────────────────────
  const handlePickMedia = () => {
    Alert.alert('Partager un média', 'Choisissez une source', [
      { text: '📷 Prendre une photo',   onPress: () => pickMedia('camera', 'photo') },
      { text: '🎥 Enregistrer une vidéo', onPress: () => pickMedia('camera', 'video') },
      { text: '🖼️ Galerie — Photo',      onPress: () => pickMedia('library', 'photo') },
      { text: '🎬 Galerie — Vidéo',      onPress: () => pickMedia('library', 'video') },
      { text: 'Annuler', style: 'cancel' },
    ])
  }

  const pickMedia = async (source: 'camera' | 'library', mediaType: 'photo' | 'video') => {
    try {
      // Vérification / demande de permissions
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync()
        if (!perm.granted) {
          Alert.alert('Permission refusée', 'Autorisez l\'accès à la caméra dans les paramètres.')
          return
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!perm.granted) {
          Alert.alert('Permission refusée', 'Autorisez l\'accès à la galerie dans les paramètres.')
          return
        }
      }

      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: mediaType === 'photo'
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
        quality: 1,
        allowsEditing: false,
        videoMaxDuration: MAX_VIDEO_SECS,
      }

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions)

      if (result.canceled || !result.assets?.[0]) return

      const asset = result.assets[0]
      setUploading(true)

      let fileInfo: { uri: string; type: string; name: string }

      if (mediaType === 'photo') {
        const info = await FileSystem.getInfoAsync(asset.uri, { size: true })
        const size = (info as any).size || 0
        fileInfo = await processImage(asset.uri, size)
      } else {
        const info = await FileSystem.getInfoAsync(asset.uri, { size: true })
        const size = (info as any).size || 0
        const durationSecs = (asset.duration || 0) / 1000
        fileInfo = await processVideo(asset.uri, durationSecs, size)
      }

      // Upload vers le backend
      const uploadResult = await uploadToBackend(fileInfo, eventId as string)

      // Envoyer le message avec l'URL média
      const msgRes = await api.post(`/events/${eventId}/chat`, {
        mediaUrl:  uploadResult.mediaUrl,
        mediaType: uploadResult.mediaType,
        fileName:  uploadResult.fileName,
      })

      setMessages(prev => [...prev, msgRes.data])
      flatListRef.current?.scrollToEnd({ animated: true })
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Impossible d\'envoyer le média.')
    } finally {
      setUploading(false)
    }
  }

  // ── Rendu d'un message ───────────────────────────────────────────────────
  const renderMessage = ({ item }: any) => {
    const isMe = item.user?._id === myUserId

    return (
      <View className={`mb-3 flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        <Text className="text-[9px] text-gray-400 mb-0.5">
          {item.user?.name} ({item.user?.role})
        </Text>

        {/* Bulle texte */}
        {item.content ? (
          <View className={`p-3 rounded-2xl max-w-[280px] ${isMe ? 'bg-black rounded-tr-none' : 'bg-gray-100 rounded-tl-none'}`}>
            <Text className={`text-xs ${isMe ? 'text-white' : 'text-gray-800'}`}>{item.content}</Text>
          </View>
        ) : null}

        {/* Médias */}
        {item.mediaType === 'image' && (
          <TouchableOpacity onPress={() => Linking.openURL(item.mediaUrl)}>
            <Image
              source={{ uri: item.mediaUrl }}
              className="rounded-2xl mt-1"
              style={{ width: 220, height: 165, resizeMode: 'cover' }}
            />
          </TouchableOpacity>
        )}

        {item.mediaType === 'video' && (
          <TouchableOpacity
            onPress={() => Linking.openURL(item.mediaUrl)}
            className={`flex-row items-center gap-2 p-3 rounded-2xl mt-1 max-w-[280px] ${isMe ? 'bg-indigo-900' : 'bg-gray-200'}`}
          >
            <Ionicons name="play-circle" size={28} color={isMe ? '#a5b4fc' : '#6366f1'} />
            <View className="flex-1">
              <Text className={`text-xs font-bold ${isMe ? 'text-indigo-200' : 'text-indigo-700'}`} numberOfLines={1}>
                {item.fileName || 'Vidéo'}
              </Text>
              <Text className={`text-[10px] ${isMe ? 'text-indigo-300' : 'text-gray-500'}`}>
                Appuyer pour ouvrir
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {item.mediaType === 'file' && (
          <TouchableOpacity
            onPress={() => Linking.openURL(item.mediaUrl)}
            className={`flex-row items-center gap-2 p-3 rounded-2xl mt-1 max-w-[280px] ${isMe ? 'bg-gray-800' : 'bg-gray-200'}`}
          >
            <Ionicons name="archive" size={24} color={isMe ? '#d1d5db' : '#374151'} />
            <View className="flex-1">
              <Text className={`text-xs font-bold ${isMe ? 'text-gray-200' : 'text-gray-800'}`} numberOfLines={1}>
                {item.fileName || 'Fichier compressé'}
              </Text>
              <Text className={`text-[10px] ${isMe ? 'text-gray-400' : 'text-gray-500'}`}>
                Appuyer pour télécharger
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  if (loading) return <View className="flex-1 justify-center"><ActivityIndicator size="large" /></View>

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-black text-black">Chat Événement</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Bannière limites */}
        <View className="bg-indigo-50 px-4 py-1.5 border-b border-indigo-100">
          <Text className="text-[10px] text-indigo-500 text-center">
            📷 Photos ≤ 5 MB (auto-compressé) · 🎥 Vidéos ≤ 2 min · 100 MB (auto-zippé)
          </Text>
        </View>

        {/* Message List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={renderMessage}
        />

        {/* Upload indicator */}
        {uploading && (
          <View className="flex-row items-center justify-center gap-2 py-2 bg-indigo-50 border-t border-indigo-100">
            <ActivityIndicator size="small" color="#6366f1" />
            <Text className="text-xs text-indigo-500 font-medium">Traitement et envoi du média…</Text>
          </View>
        )}

        {/* Input bar */}
        <View className="flex-row items-center p-3 border-t border-gray-100 gap-2 bg-white">
          {/* Bouton média */}
          <TouchableOpacity
            onPress={handlePickMedia}
            disabled={uploading}
            className="p-2 bg-indigo-50 rounded-xl"
          >
            <Ionicons name="attach" size={20} color={uploading ? '#c7d2fe' : '#6366f1'} />
          </TouchableOpacity>

          <TextInput
            placeholder="Message…"
            className="flex-grow border border-gray-200 rounded-xl px-4 py-2 text-xs h-10"
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={uploading}
            className="bg-black p-2.5 rounded-xl justify-center items-center h-10 w-10"
          >
            <Ionicons name="send" size={14} color="white" />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
