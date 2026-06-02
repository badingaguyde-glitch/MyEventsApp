import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/Components/Header';
import api from '@/assets/constants/api';
import { Event, COLORS, resolveEventImage } from '@/assets/constants';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Events() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
     const params = useLocalSearchParams(); 

    const fetchEvents = useCallback(async () => {
        try {
            const params: any = {};
            if (selectedCategory !== 'all') params.category = selectedCategory;
            if (searchQuery) params.search = searchQuery;
            
            const response = await api.get('/events', { params });
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedCategory, searchQuery]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    useEffect(() => {
        const categoryFromParams = params.category as string
        if (categoryFromParams && categoryFromParams !== 'all') {
            setSelectedCategory(categoryFromParams)
        }
    }, [params.category])

    const onRefresh = () => {
        setRefreshing(true);
        fetchEvents();
    };

    const renderEventCard = ({ item }: { item: Event }) => (
        <TouchableOpacity
            className="bg-white rounded-xl mb-4 shadow-sm overflow-hidden"
            onPress={() => router.push({ pathname: '/event/[id]', params: { id: item._id } } as any)}
        >
            <Image
                source={{ uri: resolveEventImage(item.image) }}
                className="w-full h-48"
                style={{ resizeMode: 'cover' }}
            />
            <View className="p-4">
                <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-lg font-bold text-black flex-1 mr-2" numberOfLines={1}>
                        {item.title}
                    </Text>
                    <View className="bg-primary/10 px-2 py-1 rounded-full">
                        <Text className="text-primary font-bold text-xm">
                            ${item.price === 0 ? 'Free' : item.price}
                        </Text>
                    </View>
                </View>
                
                <View className="flex-row items-center mb-2">
                    <Ionicons name="calendar-outline" size={16} color={COLORS.secondary} />
                    <Text className="text-secondary text-sm ml-1">
                        {new Date(item.date).toLocaleDateString()}
                    </Text>
                </View>
                
                <View className="flex-row items-center mb-2">
                    <Ionicons name="location-outline" size={16} color={COLORS.secondary} />
                    <Text className="text-secondary text-sm ml-1" numberOfLines={1}>
                        {item.location.venue}, {item.location.city}
                    </Text>
                </View>
                
                <View className="flex-row justify-between items-center mt-2">
                    <View className="flex-row items-center">
                        <Ionicons name="people-outline" size={16} color={COLORS.secondary} />
                        <Text className="text-secondary text-sm ml-1">
                            {item.availableSpots} spots left
                        </Text>
                    </View>
                    {item.isSoldOut && (
                        <View className="bg-red-500 px-2 py-1 rounded-full">
                            <Text className="text-white text-xs font-semibold">Sold Out</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const categories = ['all', 'Music', 'Sports', 'Arts', 'Tech', 'Education', 'Business'];

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <Header showBack showLogo />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Header showBack showLogo />
            
            <View className="px-4 pt-2 pb-2">
                <View className="flex-row items-center bg-white rounded-xl px-3 py-2 border border-gray-200">
                    <Ionicons name="search-outline" size={20} color={COLORS.secondary} />
                    <TextInput
                        className="flex-1 ml-2 text-base"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.secondary}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={COLORS.secondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View className="px-4 py-2">
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className={`mr-3 px-4 py-2 rounded-full ${
                                selectedCategory === item ? 'bg-black' : 'bg-white'
                            }`}
                            onPress={() => setSelectedCategory(item)}
                        >
                            <Text
                                className={`font-medium ${
                                    selectedCategory === item ? 'text-white' : 'text-secondary'
                                }`}
                            >
                                {item === 'all' ? 'All' : item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <FlatList
                data={events}
                renderItem={renderEventCard}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center py-12">
                        <Ionicons name="calendar-outline" size={64} color={COLORS.secondary} />
                        <Text className="text-secondary text-lg mt-4">No events found</Text>
                        <Text className="text-secondary text-sm mt-2">Try adjusting your filters</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}