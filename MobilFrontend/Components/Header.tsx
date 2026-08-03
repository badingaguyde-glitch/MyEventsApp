import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { COLORS } from '@/assets/constants'
import { useRouter } from 'expo-router'
import api from '@/assets/constants/api'

export default function Header({ showBack, showSearch, showMenu, showLogo }:
    { showBack?: boolean, showSearch?: boolean, showMenu?: boolean, showLogo?: boolean }) {

    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/notifications/unread-count');
            setUnreadCount(res.data.count || 0);
        } catch (e) {
            // Silently ignore — user may not be logged in
        }
    };

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

            {/* Notification Bell */}
            <TouchableOpacity
                onPress={() => router.push('/notifications')}
                className='relative p-1'
            >
                <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
                {unreadCount > 0 && (
                    <View
                        className='absolute -top-0.5 -right-0.5 bg-rose-500 rounded-full items-center justify-center'
                        style={{ minWidth: 16, height: 16, paddingHorizontal: 3 }}
                    >
                        <Text className='text-white font-black' style={{ fontSize: 8, lineHeight: 11 }}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    )
}