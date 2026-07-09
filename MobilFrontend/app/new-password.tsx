import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { COLORS } from '@/assets/constants'
import Ionicons from '@expo/vector-icons/Ionicons'
import api from '@/assets/constants/api'

export default function NewPassword() {
  const { email, code } = useLocalSearchParams<{ email: string, code: string }>()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await api.post('/user/reset-password', { email, code, newPassword: password })
      Alert.alert('Success', 'Password updated successfully!', [
        {
          text: 'Login',
          onPress: () => router.replace('/login' as any)
        }
      ])
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reset password')
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
          <View className='items-center mb-8'>
            <View className='w-20 h-20 bg-black rounded-full justify-center items-center'>
              <Text className='text-white text-2xl font-bold'>BME</Text>
            </View>
            <Text className='text-2xl font-bold text-black mt-4'>Nouveau Mot de Passe</Text>
            <Text className='text-gray-500 text-center mt-2'>
              Choisissez votre nouveau mot de passe
            </Text>
          </View>

          <View className='mb-4'>
            <Text className='text-gray-700 mb-2 font-semibold'>Nouveau mot de passe</Text>
            <View className='flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4'>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.secondary} className='mr-2' />
              <TextInput
                className='flex-1 py-3 text-base'
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View className='mb-6'>
            <Text className='text-gray-700 mb-2 font-semibold'>Confirmer le mot de passe</Text>
            <View className='flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4'>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.secondary} className='mr-2' />
              <TextInput
                className='flex-1 py-3 text-base'
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          <TouchableOpacity 
            className={`py-4 rounded-xl ${loading ? 'bg-gray-400' : 'bg-black'}`}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className='text-white text-center font-bold text-lg'>
                Enregistrer
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
