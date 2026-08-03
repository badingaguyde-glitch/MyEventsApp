import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Linking } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import api from '@/assets/constants/api'
import { COLORS } from '@/assets/constants'
import { useAuth } from '@/context/AuthContext'

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

export default function MobileProviderProfile() {
  const { id } = useLocalSearchParams()
  const { user } = useAuth()
  
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'offline'>('offline')
  const [bookingLoading, setBookingLoading] = useState(false)

  // Review Form
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  useEffect(() => {
    fetchDetails()
  }, [id])

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/providers/${id}`)
      setProvider(res.data)
      if (res.data.paymentMethods && res.data.paymentMethods.length > 0) {
        setPaymentMethod(res.data.paymentMethods.includes('offline') ? 'offline' : 'stripe')
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!bookingDate) return Alert.alert('Erreur', 'Date requise')
    if (!user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour réserver')
      router.push('/login')
      return
    }

    setBookingLoading(true)
    try {
      const res = await api.post('/bookings', {
        providerId: id,
        bookingDate,
        totalPrice: provider.rates.price,
        notes: bookingNotes,
        paymentMethod
      })
      if (res.data.checkoutUrl) {
        await Linking.openURL(res.data.checkoutUrl)
      } else {
        Alert.alert('Succès', 'Demande envoyée !')
        router.push('/mytickets')
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message || 'Erreur lors de la réservation')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleAddReview = async () => {
    if (!comment) return
    if (!user) {
      Alert.alert('Erreur', 'Veuillez vous connecter')
      return
    }
    try {
      await api.post(`/providers/${id}/reviews`, { rating, comment })
      setComment('')
      Alert.alert('Succès', 'Votre avis a été ajouté !')
      fetchDetails()
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de poster l\'avis')
    }
  }

  if (loading) return <View className="flex-1 justify-center"><ActivityIndicator size="large" /></View>

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="black" /></TouchableOpacity>
        <Text className="text-lg font-black text-black">Profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 border-b border-gray-100">
          <Text className="text-2xl font-black text-black">{provider.businessName}</Text>
          <Text className="text-sm font-bold text-gray-500 mt-1">
            {SERVICE_LABELS[provider.serviceType] || provider.serviceType}
          </Text>
          <View className="flex-row items-center gap-1 mt-2">
            <Ionicons name="star" size={16} color="#FBBF24" />
            <Text className="text-sm font-bold text-black">{provider.ratingAverage || 'N/A'}</Text>
            <Text className="text-sm text-gray-400">({provider.reviews.length} avis)</Text>
            <Text className="mx-2 text-gray-300">|</Text>
            <Ionicons name="location-outline" size={16} color={COLORS.secondary} />
            <Text className="text-sm text-gray-500">{provider.location.city}</Text>
          </View>
        </View>

        <View className="p-4 border-b border-gray-100">
          <Text className="text-md font-bold text-black mb-2">À propos</Text>
          <Text className="text-sm text-gray-600 leading-relaxed">{provider.bio}</Text>
        </View>

        {/* Booking Form */}
        <View className="p-4 border-b border-gray-100 bg-gray-50">
          <Text className="text-md font-bold text-black mb-1">Tarif de base</Text>
          <Text className="text-2xl font-black text-black">
            {provider.rates.price}€
            <Text className="text-xs text-gray-400 font-normal"> / {provider.rates.unit === 'day' ? 'journée' : provider.rates.unit === 'hour' ? 'heure' : 'prestation'}</Text>
          </Text>

          <View className="mt-4 gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <Text className="text-sm font-bold text-black">Réserver ce prestataire</Text>
            <TextInput placeholder="Date (Ex: 2026-08-15)" className="border border-gray-200 rounded-xl px-3 py-2 text-sm" value={bookingDate} onChangeText={setBookingDate} />
            <TextInput placeholder="Demandes spéciales..." className="border border-gray-200 rounded-xl px-3 py-2 text-sm h-16" multiline value={bookingNotes} onChangeText={setBookingNotes} />
            
            {provider.paymentMethods && provider.paymentMethods.length > 0 && (
              <View className="gap-1">
                <Text className="text-xs font-bold text-gray-500 uppercase">Mode de paiement</Text>
                <View className="flex-row gap-3 mt-1">
                  {provider.paymentMethods.includes('offline') && (
                    <TouchableOpacity
                      onPress={() => setPaymentMethod('offline')}
                      className={`flex-1 py-2 rounded-lg border ${paymentMethod === 'offline' ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={`text-center text-xs font-bold ${paymentMethod === 'offline' ? 'text-white' : 'text-gray-600'}`}>Hors-ligne</Text>
                    </TouchableOpacity>
                  )}
                  {provider.paymentMethods.includes('stripe') && (
                    <TouchableOpacity
                      onPress={() => setPaymentMethod('stripe')}
                      className={`flex-1 py-2 rounded-lg border ${paymentMethod === 'stripe' ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={`text-center text-xs font-bold ${paymentMethod === 'stripe' ? 'text-white' : 'text-gray-600'}`}>Stripe</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            <TouchableOpacity onPress={handleBooking} disabled={bookingLoading} className="bg-black py-3 rounded-xl mt-2 items-center justify-center">
              {bookingLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-xs uppercase">Envoyer la demande</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Availability Block */}
        {provider.unavailableDates && provider.unavailableDates.length > 0 && (
          <View className="p-4 border-b border-gray-100">
            <Text className="text-sm font-bold text-black mb-2">Dates Réservées</Text>
            <View className="flex-row flex-wrap gap-2">
              {provider.unavailableDates.map((date: string, idx: number) => (
                <View key={idx} className="bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                  <Text className="text-xs text-red-600 font-bold">{new Date(date).toLocaleDateString()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reviews */}
        <View className="p-4 gap-4">
          <Text className="text-md font-bold text-black">Avis Clients</Text>
          {user && (
            <View className="bg-gray-50 p-4 rounded-2xl gap-2">
              <Text className="text-xs font-bold text-gray-500 uppercase">Laisser un avis</Text>
              <TextInput placeholder="Votre commentaire..." className="border border-gray-200 bg-white rounded-xl px-3 py-2 text-xs h-16" multiline value={comment} onChangeText={setComment} />
              <TouchableOpacity onPress={handleAddReview} className="bg-gray-800 py-2 rounded-xl items-center"><Text className="text-white font-bold text-xs">Soumettre</Text></TouchableOpacity>
            </View>
          )}

          <View className="gap-4">
            {provider.reviews.map((rev: any, idx: number) => (
              <View key={idx} className="border-b border-gray-100 pb-3 last:border-0">
                <Text className="text-xs font-bold text-black">{rev.user?.name} {rev.user?.lastName}</Text>
                <Text className="text-xs text-gray-600 mt-1 pl-2">{rev.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
