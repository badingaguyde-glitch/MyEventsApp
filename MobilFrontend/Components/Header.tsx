import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { COLORS } from '@/assets/constants'
import { useRouter } from 'expo-router'

export default function Header({showBack, showSearch, showMenu, showLogo}:
    {showBack?: boolean, showSearch?: boolean, showMenu?: boolean, showLogo?: boolean }) {
  
    const router = useRouter();
    
    return (
        <View className='flex-row items-center justify-between px-4 py-3 bg-white'>
            {/* Left side */}
            <View className='flex-row items-center flex-1'>
                {showBack && (
                    <TouchableOpacity onPress={() => router.back()} className='mr-3'>
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                )}

                {showMenu && (
                    <TouchableOpacity className='mr-3'>
                        <Ionicons name="menu-outline" size={28} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
                
                {showLogo ? (
                    <View className='flex-1'>
                        <Image 
                            source={require("@/assets/logo.png")}
                            style={{ width: "100%", height: 30 }} 
                            resizeMode='contain' 
                        />
                    </View>
                ) : (
                    <Text className='text-xl font-bold text-primary text-center flex-1 mr-8'>
                        BANTU MY EVENT
                    </Text>
                )}
            </View>
        </View>
    )
}