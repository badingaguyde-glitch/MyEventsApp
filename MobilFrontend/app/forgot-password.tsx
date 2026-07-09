import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { COLORS } from '@/assets/constants'
import Ionicons from '@expo/vector-icons/Ionicons'
import api from '@/assets/constants/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email')
      return
    }

    setLoading(true)
    try {
      await api.post('/user/forgot-password', { email })
      Alert.alert('Success', 'Verification code sent to your email!', [
        {
          text: 'OK',
          onPress: () => router.push({
            pathname: '/reset-password',
            params: { email }
          } as any)
        }
      ])
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send recovery code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
      >
        <ScrollView 
          contentContainerClassName='flex-grow justify-center px-6 py-12'
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            className='absolute top-4 left-4 p-2 bg-gray-50 rounded-full'
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          <View className='items-center mb-8'>
            <View className='w-20 h-20 bg-black rounded-full justify-center items-center'>
              <Text className='text-white text-2xl font-bold'>BME</Text>
            </View>
            <Text className='text-2xl font-bold text-black mt-4'>Mot de passe oublié</Text>
            <Text className='text-gray-500 text-center mt-2'>
              Saisissez votre e-mail pour recevoir le code de récupération
            </Text>
          </View>

          <View className='mb-6'>
            <Text className='text-gray-700 mb-2 font-semibold'>Email</Text>
            <View className='flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4'>
              <Ionicons name="mail-outline" size={20} color={COLORS.secondary} className='mr-2' />
              <TextInput
                className='flex-1 py-3 text-base'
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity 
            className={`py-4 rounded-xl ${loading ? 'bg-gray-400' : 'bg-black'}`}
            onPress={handleSendCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className='text-white text-center font-bold text-lg'>
                Envoyer le code
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
