import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, FlatList, Linking } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '@/assets/constants/api'
import { COLORS } from '@/assets/constants'
import { router } from 'expo-router'

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

export default function MobileProviderDashboard() {
  const [tab, setTab] = useState<'jobs' | 'profile'>('jobs')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  // Profile Form States
  const [businessName, setBusinessName] = useState('')
  const [serviceType, setServiceType] = useState('dj')
  const [city, setCity] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('event')
  const [bio, setBio] = useState('')
  const [acceptOffline, setAcceptOffline] = useState(true)
  const [acceptStripe, setAcceptStripe] = useState(false)
  const [blockedDateInput, setBlockedDateInput] = useState('')
  const [blockedDates, setBlockedDates] = useState<string[]>([])

  useEffect(() => {
    loadJobs()
    loadProfile()
  }, [])

  const loadJobs = async () => {
    try {
      const res = await api.get('/bookings/my-jobs')
      setJobs(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async () => {
    try {
      const res = await api.get('/providers')
      const storedUser = JSON.parse(await AsyncStorage.getItem('user') || '{}')
      const profile = res.data.find((p: any) => p.user && p.user._id === (storedUser.id || storedUser._id))
      if (profile) {
        setBusinessName(profile.businessName)
        setServiceType(profile.serviceType)
        setCity(profile.location.city)
        setPrice(profile.rates.price.toString())
        setUnit(profile.rates.unit)
        setBio(profile.bio)
        setAcceptOffline(profile.paymentMethods.includes('offline'))
        setAcceptStripe(profile.paymentMethods.includes('stripe'))
        setBlockedDates(profile.unavailableDates ? profile.unavailableDates.map((d: any) => new Date(d).toISOString().split('T')[0]) : [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const paymentMethods = []
      if (acceptOffline) paymentMethods.push('offline')
      if (acceptStripe) paymentMethods.push('stripe')
      await api.post('/providers', {
        businessName,
        serviceType,
        bio,
        city,
        rates: { price: Number(price), unit },
        paymentMethods
      })
      Alert.alert('Succès', 'Profil enregistré !')
      loadProfile()
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder')
    }
  }

  const handleStatusUpdate = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      await api.put(`/bookings/${id}/status`, { status })
      Alert.alert('Succès', `La demande a été ${status === 'accepted' ? 'acceptée' : 'refusée'}`)
      loadJobs()
    } catch (e) {
      Alert.alert('Erreur', 'Erreur de mise à jour')
    }
  }

  const handleBlockDate = async () => {
    if (!blockedDateInput) return
    const updated = [...blockedDates, blockedDateInput]
    try {
      await api.put('/providers/availability', { unavailableDates: updated })
      setBlockedDates(updated)
      setBlockedDateInput('')
      Alert.alert('Succès', 'Date bloquée !')
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de bloquer la date')
    }
  }

  const handleUpgradePremium = async () => {
    try {
      const res = await api.post('/providers/premium-upgrade')
      if (res.data.url) {
        await Linking.openURL(res.data.url)
      }
    } catch (e) {
      Alert.alert('Erreur', 'Action impossible')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-black">Espace Prestataire</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => setTab('jobs')} 
          className={`flex-1 py-3 border-b-2 ${tab === 'jobs' ? 'border-black' : 'border-transparent'}`}
        >
          <Text className="text-center text-xs font-bold">DEMANDES</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setTab('profile')} 
          className={`flex-1 py-3 border-b-2 ${tab === 'profile' ? 'border-black' : 'border-transparent'}`}
        >
          <Text className="text-center text-xs font-bold">MON PROFIL</Text>
        </TouchableOpacity>
      </View>

      {tab === 'jobs' ? (
        <FlatList
          data={jobs}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }: any) => (
            <View className="bg-gray-50 p-4 border border-gray-100 rounded-2xl mb-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-gray-500">Date: {new Date(item.bookingDate).toLocaleDateString()}</Text>
                <View className="bg-indigo-100 px-2 py-0.5 rounded-full">
                  <Text className="text-[9px] font-bold text-indigo-700 uppercase">{item.status}</Text>
                </View>
              </View>
              <Text className="text-sm font-bold text-black mt-1">Prestation pour {item.organizer?.name} {item.organizer?.lastName}</Text>
              <Text className="text-xs text-gray-600 mt-1">Montant: {item.totalPrice}€</Text>
              {item.notes && <Text className="text-xs text-gray-500 italic mt-2">"{item.notes}"</Text>}
              
              {item.status === 'pending' && (
                <View className="flex-row gap-2 mt-3">
                  <TouchableOpacity onPress={() => handleStatusUpdate(item._id, 'accepted')} className="flex-1 bg-green-600 py-2 rounded-lg">
                    <Text className="text-white text-center text-xs font-bold">Accepter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleStatusUpdate(item._id, 'rejected')} className="flex-1 bg-red-600 py-2 rounded-lg">
                    <Text className="text-white text-center text-xs font-bold">Refuser</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      ) : (
        <ScrollView className="p-4 gap-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <TouchableOpacity onPress={handleUpgradePremium} className="bg-amber-500 py-3 rounded-xl items-center mb-2">
            <Text className="text-white font-bold text-xs">BOOSTER MA VISIBILITÉ (PREMIUM)</Text>
          </TouchableOpacity>
          
          <View className="gap-3">
            <TextInput placeholder="Nom commercial" className="border border-gray-200 rounded-xl px-3 py-2 text-sm" value={businessName} onChangeText={setBusinessName} />
            <TextInput placeholder="Ville principale" className="border border-gray-200 rounded-xl px-3 py-2 text-sm" value={city} onChangeText={setCity} />
            <TextInput placeholder="Tarif (€)" className="border border-gray-200 rounded-xl px-3 py-2 text-sm" keyboardType="numeric" value={price} onChangeText={setPrice} />
            <TextInput placeholder="Description / Bio" className="border border-gray-200 rounded-xl px-3 py-2 text-sm h-20" multiline value={bio} onChangeText={setBio} />
            
            <View className="gap-1 mt-1">
              <Text className="text-xs font-bold text-gray-500 uppercase">Modes de paiement</Text>
              <View className="flex-row gap-4 mt-1">
                <TouchableOpacity onPress={() => setAcceptOffline(!acceptOffline)} className="flex-row items-center gap-1.5">
                  <Ionicons name={acceptOffline ? "checkbox" : "square-outline"} size={20} color="black" />
                  <Text className="text-xs">Hors-ligne</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAcceptStripe(!acceptStripe)} className="flex-row items-center gap-1.5">
                  <Ionicons name={acceptStripe ? "checkbox" : "square-outline"} size={20} color="black" />
                  <Text className="text-xs">Stripe</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={handleUpdateProfile} className="bg-black py-3 rounded-xl mt-2">
              <Text className="text-white text-center font-bold text-xs">SAUVEGARDER LE PROFIL</Text>
            </TouchableOpacity>

            <View className="pt-4 border-t border-gray-100 gap-2 mt-4">
              <Text className="text-sm font-bold text-black">Bloquer des dates d'indisponibilité</Text>
              <View className="flex-row gap-2">
                <TextInput placeholder="AAAA-MM-JJ" className="border border-gray-200 rounded-xl px-3 py-2 text-xs flex-1" value={blockedDateInput} onChangeText={setBlockedDateInput} />
                <TouchableOpacity onPress={handleBlockDate} className="bg-gray-800 px-4 py-2 rounded-xl justify-center">
                  <Text className="text-white font-bold text-xs">Bloquer</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap gap-2 mt-1">
                {blockedDates.map((date, idx) => (
                  <View key={idx} className="bg-gray-100 px-3 py-1 rounded-full flex-row items-center gap-1">
                    <Text className="text-xs text-gray-600">{new Date(date).toLocaleDateString()}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
