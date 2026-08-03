import { View, Text, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import api from '@/assets/constants/api'
import { COLORS } from '@/assets/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function MobileSocialFeed() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mediaUrl, setMediaUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [myUserId, setMyUserId] = useState('')

  useEffect(() => {
    initFeed()
  }, [])

  const initFeed = async () => {
    try {
      const storedUser = JSON.parse(await AsyncStorage.getItem('user') || '{}')
      setMyUserId(storedUser.id || storedUser._id)
      await loadFeed()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadFeed = async () => {
    try {
      const res = await api.get('/posts')
      setPosts(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreatePost = async () => {
    if (!mediaUrl) return
    try {
      await api.post('/posts', { mediaUrl, mediaType: 'image', caption })
      setMediaUrl('')
      setCaption('')
      Alert.alert('Succès', 'Votre publication est en ligne !')
      loadFeed()
    } catch (e) {
      console.error(e)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/posts/${postId}/like`)
      loadFeed()
    } catch (e) {
      console.error(e)
    }
  }

  const handleComment = async (postId: string) => {
    const text = commentText[postId]
    if (!text) return
    try {
      await api.post(`/posts/${postId}/comments`, { content: text })
      setCommentText({ ...commentText, [postId]: '' })
      loadFeed()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <View className="flex-1 justify-center"><ActivityIndicator size="large" /></View>

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-black">Fil Social</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item: any) => item._id}
        ListHeaderComponent={
          <View className="p-4 bg-gray-50 border-b border-gray-100 gap-2">
            <Text className="text-xs font-bold text-gray-400 uppercase">Partagez un souvenir</Text>
            <TextInput 
              placeholder="Lien de l'image (URL)..." 
              className="border border-gray-200 bg-white rounded-xl px-3 py-2 text-xs" 
              value={mediaUrl} 
              onChangeText={setMediaUrl} 
            />
            <TextInput 
              placeholder="Légende..." 
              className="border border-gray-200 bg-white rounded-xl px-3 py-2 text-xs h-12" 
              value={caption} 
              onChangeText={setCaption} 
            />
            <TouchableOpacity onPress={handleCreatePost} className="bg-black py-2.5 rounded-xl">
              <Text className="text-white text-center font-bold text-xs">PUBLIER</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }: any) => {
          const isLiked = item.likes.includes(myUserId)
          return (
            <View className="border-b border-gray-100 pb-4 mb-4">
              {/* Header */}
              <View className="flex-row items-center gap-2 p-3">
                <View className="w-8 h-8 rounded-full bg-slate-700 items-center justify-center">
                  <Text className="text-white font-bold text-xs">{item.user?.name ? item.user.name[0].toUpperCase() : 'U'}</Text>
                </View>
                <View>
                  <Text className="text-xs font-bold text-black">{item.user?.name} {item.user?.lastName}</Text>
                  {item.event && <Text className="text-[10px] text-gray-400">Événement: {item.event.title}</Text>}
                </View>
              </View>

              {/* Media */}
              <View className="h-64 bg-gray-200">
                <Image source={{ uri: item.mediaUrl }} className="w-full h-full" resizeMode="cover" />
              </View>

              {/* Actions */}
              <View className="p-3 gap-2">
                <View className="flex-row gap-4">
                  <TouchableOpacity onPress={() => handleLike(item._id)} className="flex-row items-center gap-1">
                    <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? "#FF4444" : "black"} />
                    <Text className="text-xs font-bold">{item.likes.length}</Text>
                  </TouchableOpacity>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="chatbubble-outline" size={20} color="black" />
                    <Text className="text-xs font-bold">{item.comments.length}</Text>
                  </View>
                </View>

                {item.caption && (
                  <Text className="text-xs text-gray-700">
                    <Text className="font-bold">{item.user?.name}</Text> {item.caption}
                  </Text>
                )}

                {/* Comments List */}
                {item.comments.length > 0 && (
                  <View className="bg-gray-50 p-2 rounded-xl mt-1 gap-1 max-h-32">
                    {item.comments.map((c: any, index: number) => (
                      <Text key={index} className="text-[10px] text-gray-600">
                        <Text className="font-bold">{c.user?.name}:</Text> {c.content}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Add Comment input */}
                <View className="flex-row gap-2 mt-2">
                  <TextInput 
                    placeholder="Écrire un commentaire..." 
                    className="flex-grow border border-gray-200 rounded-lg px-2.5 py-1 text-xs"
                    value={commentText[item._id] || ''}
                    onChangeText={(val) => setCommentText({ ...commentText, [item._id]: val })}
                  />
                  <TouchableOpacity onPress={() => handleComment(item._id)} className="bg-gray-800 px-3 py-1 rounded-lg justify-center">
                    <Ionicons name="send" size={10} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )
        }}
      />
    </SafeAreaView>
  )
}
