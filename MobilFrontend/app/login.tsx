import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/context/AuthContext'
import { router } from 'expo-router'
import { COLORS } from '@/assets/constants'
import Ionicons from '@expo/vector-icons/Ionicons'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    lastName: '',
    interests: '',
  })

  const { login, register } = useAuth()

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    if (!isLogin && (!formData.name || !formData.lastName)) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await register({
          name: formData.name,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          interests: formData.interests.split(',').map(i => i.trim()).filter(i => i),
        })
      }
      router.replace('/(tabs)')
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Authentication failed')
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
          {/* Logo */}
          <View className='items-center mb-8'>
            <View className='w-20 h-20 bg-primary rounded-full justify-center items-center'>
              <Text className='text-white text-2xl font-bold'>BME</Text>
            </View>
            <Text className='text-2xl font-bold text-black mt-4'>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text className='text-gray-500 text-center mt-2'>
              {isLogin 
                ? 'Login to discover amazing events near you' 
                : 'Sign up to start your event journey'}
            </Text>
          </View>

          {/* Form */}
          {!isLogin && (
            <>
              <View className='mb-4'>
                <Text className='text-gray-700 mb-2 font-semibold'>First Name</Text>
                <TextInput
                  className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base'
                  placeholder="John"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View className='mb-4'>
                <Text className='text-gray-700 mb-2 font-semibold'>Last Name</Text>
                <TextInput
                  className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base'
                  placeholder="Doe"
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                />
              </View>
            </>
          )}

          <View className='mb-4'>
            <Text className='text-gray-700 mb-2 font-semibold'>Email</Text>
            <TextInput
              className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base'
              placeholder="you@example.com"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className='mb-4'>
            <Text className='text-gray-700 mb-2 font-semibold'>Password</Text>
            <View className='flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4'>
              <TextInput
                className='flex-1 py-3 text-base'
                placeholder="••••••••"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {!isLogin && (
            <View className='mb-6'>
              <Text className='text-gray-700 mb-2 font-semibold'>Interests (optional)</Text>
              <TextInput
                className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base'
                placeholder="Music, Sports, Tech, etc."
                value={formData.interests}
                onChangeText={(text) => setFormData({ ...formData, interests: text })}
              />
              <Text className='text-gray-400 text-xs mt-1'>Separate interests with commas</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity 
            className={`py-4 rounded-xl ${loading ? 'bg-gray-400' : 'bg-primary'}`}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text className='text-white text-center font-bold text-lg'>
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
            </Text>
          </TouchableOpacity>

          {/* Toggle Login/Signup */}
          <TouchableOpacity 
            className='mt-6'
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text className='text-center text-gray-600'>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Text className='text-primary font-bold'>{isLogin ? 'Sign Up' : 'Login'}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}