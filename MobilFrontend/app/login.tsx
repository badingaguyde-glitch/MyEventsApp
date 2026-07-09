import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/context/AuthContext'
import { router, useLocalSearchParams } from 'expo-router'
import { COLORS } from '@/assets/constants'
import Ionicons from '@expo/vector-icons/Ionicons'
import api from '@/assets/constants/api'

export default function Login() {
  const { mode } = useLocalSearchParams<{ mode?: string }>()
  const [isLogin, setIsLogin] = useState(mode !== 'signup')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Step 1: Email verification state
  const [step, setStep] = useState<'email' | 'verify' | 'register'>('email')
  const [verificationCode, setVerificationCode] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    lastName: '',
    interests: '',
  })

  const { login, register } = useAuth()

  // Step 1: Send verification code
  const sendVerificationCode = async () => {
    if (!formData.email) {
      Alert.alert('Error', 'Please enter your email')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/user/generate-code', {
        email: formData.email
      })
      
      Alert.alert('Success', 'Verification code sent to your email!')
      setStep('verify')
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify the code
  const verifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/user/verify-code', {
        email: formData.email,
        code: verificationCode
      })
      
      Alert.alert('Success', 'Email verified! Now complete your registration.')
      setEmailVerified(true)
      setStep('register')
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Complete registration
  const completeRegistration = async () => {
    if (!formData.name || !formData.lastName || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      await register({
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        interests: formData.interests.split(',').map(i => i.trim()).filter(i => i),
      })
      
      router.replace('/(tabs)/Home' as any)
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Login handler
  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await login(formData.email, formData.password)
      router.replace('/(tabs)/Home' as any)
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  // Reset registration flow
  const resetRegistration = () => {
    setStep('email')
    setVerificationCode('')
    setEmailVerified(false)
    setFormData({
      email: '',
      password: '',
      name: '',
      lastName: '',
      interests: '',
    })
  }

  // Render email step (Step 1)
  const renderEmailStep = () => (
    <>
      <View className='items-center mb-8'>
        <View className='w-20 h-20 bg-black rounded-full justify-center items-center'>
          <Text className='text-white text-2xl font-bold'>BME</Text>
        </View>
        <Text className='text-2xl font-bold text-black mt-4'>Create Account</Text>
        <Text className='text-gray-500 text-center mt-2'>
          Enter your email to get started
        </Text>
      </View>

      <View className='mb-6'>
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

      <TouchableOpacity 
        className={`py-4 rounded-xl ${loading ? 'bg-gray-400' : 'bg-black'}`}
        onPress={sendVerificationCode}
        disabled={loading}
      >
        <Text className='text-white text-center font-bold text-lg'>
          {loading ? 'Sending...' : 'Continue'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className='mt-6'
        onPress={() => setIsLogin(true)}
      >
        <Text className='text-center text-gray-600'>
          Already have an account? <Text className='text-black font-bold'>Login</Text>
        </Text>
      </TouchableOpacity>
    </>
  )

  // Render verification step (Step 2)
  const renderVerificationStep = () => (
    <>
      <View className='items-center mb-8'>
        <View className='w-20 h-20 bg-black rounded-full justify-center items-center'>
          <Text className='text-white text-2xl font-bold'>BME</Text>
        </View>
        <Text className='text-2xl font-bold text-black mt-4'>Verify Email</Text>
        <Text className='text-gray-500 text-center mt-2'>
          Enter the 6-digit code sent to {formData.email}
        </Text>
      </View>

      <View className='mb-6'>
        <Text className='text-gray-700 mb-2 font-semibold'>Verification Code</Text>
        <TextInput
          className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-center text-2xl tracking-wider'
          placeholder="000000"
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      <TouchableOpacity 
        className={`py-4 rounded-xl ${loading ? 'bg-gray-400' : 'bg-black'}`}
        onPress={verifyCode}
        disabled={loading}
      >
        <Text className='text-white text-center font-bold text-lg'>
          {loading ? 'Verifying...' : 'Verify Code'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className='mt-6'
        onPress={resetRegistration}
      >
        <Text className='text-center text-gray-600'>
          Wrong email? <Text className='text-black font-bold'>Go Back</Text>
        </Text>
      </TouchableOpacity>
    </>
  )

  // Render registration step (Step 3)
  const renderRegistrationStep = () => (
    <>
      <View className='items-center mb-6'>
        <View className='w-20 h-20 bg-black rounded-full justify-center items-center'>
          <Text className='text-white text-2xl font-bold'>BME</Text>
        </View>
        <Text className='text-2xl font-bold text-black mt-4'>Complete Profile</Text>
        <Text className='text-gray-500 text-center mt-2'>
          Tell us a bit about yourself
        </Text>
      </View>

      <View className='mb-4'>
        <Text className='text-gray-700 mb-2 font-semibold'>First Name *</Text>
        <TextInput
          className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base'
          placeholder="John"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
      </View>

      <View className='mb-4'>
        <Text className='text-gray-700 mb-2 font-semibold'>Last Name *</Text>
        <TextInput
          className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base'
          placeholder="Doe"
          value={formData.lastName}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
        />
      </View>

      <View className='mb-4'>
        <Text className='text-gray-700 mb-2 font-semibold'>Password *</Text>
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

      <TouchableOpacity 
        className={`py-4 rounded-xl ${loading ? 'bg-gray-400' : 'bg-black'}`}
        onPress={completeRegistration}
        disabled={loading}
      >
        <Text className='text-white text-center font-bold text-lg'>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
    </>
  )

  // Render login form
  const renderLoginForm = () => (
    <>
      <View className='items-center mb-8'>
        <View className='w-20 h-20 bg-black rounded-full justify-center items-center'>
          <Text className='text-white text-2xl font-bold'>BME</Text>
        </View>
        <Text className='text-2xl font-bold text-black mt-4'>Welcome Back</Text>
        <Text className='text-gray-500 text-center mt-2'>
          Login to discover amazing events near you
        </Text>
      </View>

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

      <View className='mb-6'>
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
        <TouchableOpacity 
          className='self-end mt-2'
          onPress={() => router.push('/forgot-password' as any)}
        >
          <Text className='text-gray-500 font-semibold text-sm'>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        className={`py-4 rounded-xl ${loading ? 'bg-gray-400' : 'bg-black'}`}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className='text-white text-center font-bold text-lg'>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className='mt-6'
        onPress={() => {
          setIsLogin(false)
          setStep('email')
          resetRegistration()
        }}
      >
        <Text className='text-center text-gray-600'>
          Don't have an account? <Text className='text-black font-bold'>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </>
  )

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
          {isLogin ? (
            renderLoginForm()
          ) : (
            <>
              {step === 'email' && renderEmailStep()}
              {step === 'verify' && renderVerificationStep()}
              {step === 'register' && renderRegistrationStep()}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}