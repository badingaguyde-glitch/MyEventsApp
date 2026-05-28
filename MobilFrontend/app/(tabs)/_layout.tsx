import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS} from '@/assets/constants'; 

export default function TabLayout() {
  return (
   <Tabs
   screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: COLORS.inactive,
    tabBarStyle:{
      
        borderTopWidth:1,
        borderTopColor: '#F0F0F0',
        paddingTop:8


    }
    

   }}
   
   
   
   >
    <Tabs.Screen name="Home" options={{ 
        tabBarIcon: ({color, focused}) =>  <Ionicons name={focused?"home":"home-outline"} size={26} color={color}/>
     }} />

    <Tabs.Screen name="events" options={{ 
        tabBarIcon: ({color, focused}) =>  <Ionicons name={focused?"calendar":"calendar-outline"} size={26} color={color}/>
     }} />

     <Tabs.Screen name="search" options={{ 
        tabBarIcon: ({color, focused}) =>  <Ionicons name={focused?"search":"search-outline"} size={26} color={color}/>
     }} />

     <Tabs.Screen name="mytickets" options={{ 
        tabBarIcon: ({color, focused}) =>  <Ionicons name={focused?"ticket":"ticket-outline"} size={26} color={color}/>
     }} />

     <Tabs.Screen name="profile" options={{ 
        tabBarIcon: ({color, focused}) =>  <Ionicons name={focused?"person":"person-outline"} size={26} color={color}/>
     }} />


   </Tabs>
  )
}