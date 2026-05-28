import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '@/assets/constants/api'
import { User } from '@/assets/constants'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

interface RegisterData {
  name: string
  lastName: string
  email: string
  password: string
  interests: string[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStoredUser()
  }, [])

  const loadStoredUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const userData = await AsyncStorage.getItem('user')
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser({
          ...parsedUser,
          id: parsedUser._id || parsedUser.id, // Ensure id is set
        })
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await api.post('/user/login', { email, password })
    const { token, ...userData } = response.data
    
    await AsyncStorage.setItem('token', token)
    await AsyncStorage.setItem('user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser({
      ...userData,
      id: userData._id || userData.id,
    })
  }

  const register = async (userData: RegisterData) => {
    const response = await api.post('/user', userData)
    const { token, user: newUser } = response.data
    
    await AsyncStorage.setItem('token', token)
    await AsyncStorage.setItem('user', JSON.stringify(newUser))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser({
      ...newUser,
      id: newUser._id || newUser.id,
    })
  }

  const logout = async () => {
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    AsyncStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}