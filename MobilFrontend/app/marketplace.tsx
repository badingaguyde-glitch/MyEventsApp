import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import api from '@/assets/constants/api'
import { COLORS } from '@/assets/constants'

const SERVICE_LABELS: Record<string, string> = {
  dj: 'DJ / Ambianceur',
  decorator: 'Décorateur',
  photographer: 'Photographe',
  videographer: 'Vidéaste',
  caterer: 'Traiteur',
  animator: 'Animateur',
  security: 'Sécurité',
  chairs_rental: 'Loc. Chaises',
  tents_rental: 'Loc. Tentes',
  venue: 'Salle Réception',
  music_group: 'Groupe Musical'
}

export default function MobileMarketplace() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const [selectedType, setSelectedType] = useState('')

  useEffect(() => {
    fetchProviders()
  }, [selectedType])

  const fetchProviders = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (selectedType) params.type = selectedType
      if (searchCity) params.city = searchCity
      
      const res = await api.get('/providers', { params })
      setProviders(res.data)
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text className="text-lg font-black text-black">Marketplace</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filters & Search */}
      <View className="p-4 border-b border-gray-100 gap-3">
        {/* City Input */}
        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <Ionicons name="location-outline" size={20} color={COLORS.secondary} className="mr-2" />
          <TextInput
            placeholder="Rechercher par ville..."
            className="flex-1 text-sm text-black"
            value={searchCity}
            onChangeText={setSearchCity}
            onSubmitEditing={fetchProviders}
          />
          {searchCity ? (
            <TouchableOpacity onPress={() => { setSearchCity(''); fetchProviders(); }}>
              <Ionicons name="close-circle" size={18} color={COLORS.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Scrollable Type Filters */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ key: '', label: 'Tous' }, ...Object.entries(SERVICE_LABELS).map(([k, v]) => ({ key: k, label: v }))]}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedType(item.key)}
              className={`mr-2 px-4 py-2 rounded-full border ${selectedType === item.key ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-xs font-bold ${selectedType === item.key ? 'text-white' : 'text-gray-600'}`}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Providers List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : providers.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="search-outline" size={48} color={COLORS.secondary} />
          <Text className="text-sm text-gray-500 mt-2">Aucun prestataire trouvé</Text>
        </View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              onPress={() => router.push(`/provider/${item._id}`)}
              className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row gap-4">
                {/* Thumbnail */}
                <View className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden justify-center items-center">
                  {item.photos && item.photos.length > 0 ? (
                    <Image source={{ uri: item.photos[0] }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <Text className="text-xl font-bold text-gray-400">{item.businessName[0]}</Text>
                  )}
                </View>

                {/* Details */}
                <View className="flex-1 justify-between">
                  <View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-md font-bold text-black flex-1 mr-1" numberOfLines={1}>{item.businessName}</Text>
                      {item.visibilityTier === 'premium' && (
                        <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                          <Text className="text-[9px] font-bold text-amber-700">PREMIUM</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-gray-500 mt-0.5">{SERVICE_LABELS[item.serviceType] || item.serviceType}</Text>
                    <View className="flex-row items-center gap-1 mt-1">
                      <Ionicons name="star" size={14} color="#FBBF24" />
                      <Text className="text-xs font-bold text-black">{item.ratingAverage || 'N/A'}</Text>
                      <Text className="text-xs text-gray-400">({item.reviews.length} avis)</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-50">
                    <View className="flex-row items-center">
                      <Ionicons name="location" size={12} color={COLORS.secondary} className="mr-1" />
                      <Text className="text-xs text-gray-500">{item.location.city}</Text>
                    </View>
                    <Text className="text-xs font-bold text-black">{item.rates.price}€ / {item.rates.unit === 'day' ? 'jour' : item.rates.unit === 'hour' ? 'heure' : 'ev'}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}
