import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { COLORS } from '@/assets/constants'
import Ionicons from '@expo/vector-icons/Ionicons'
import api from '@/assets/constants/api'

export default function ResetPassword() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the verification code')
      return
    }

    setLoading(true)
    try {
      await api.post('/user/verify-reset-code', { email, code })
      Alert.alert('Success', 'Code verified! Enter your new password.', [
        {
          text: 'OK',
          onPress: () => router.push({
            pathname: '/new-password',
            params: { email, code }
          } as any)
        }
      ])
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid or expired code')
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
            <Text className='text-2xl font-bold text-black mt-4'>Réinitialisation</Text>
            <Text className='text-gray-500 text-center mt-2'>
              Saisissez le code à 6 chiffres envoyé à {email}
            </Text>
          </View>

          <View className='mb-6'>
            <Text className='text-gray-700 mb-2 font-semibold'>Code de réinitialisation</Text>
            <View className='flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4'>
              <Ionicons name="key-outline" size={20} color={COLORS.secondary} className='mr-2' />
              <TextInput
                className='flex-1 py-3 text-base text-center font-mono tracking-widest text-lg'
                placeholder="000000"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </View>

          <TouchableOpacity 
            className={`py-4 rounded-xl ${loading ? 'bg-gray-400' : 'bg-black'}`}
            onPress={handleVerifyCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className='text-white text-center font-bold text-lg'>
                Vérifier le code
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
