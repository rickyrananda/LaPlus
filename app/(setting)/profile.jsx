import { View, Text, TouchableOpacity } from 'react-native'
import { useGlobalContext } from '../../context/GlobalProvider'
import { router } from 'expo-router'
import { signOut } from '../../lib/appwrite'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BuildingStorefrontIcon, ChevronRightIcon, ArrowLeftCircleIcon, ArrowRightStartOnRectangleIcon } from 'react-native-heroicons/solid'

const profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);

    router.replace("/");
    
  }

  return (
    <SafeAreaView className="bg-white h-full p-8">
      <StatusBar hidden= { true }/>
        <View className="flex flex-row items-center justify-between mb-12">
          <TouchableOpacity
            onPress={router.back}
          >
            <ArrowLeftCircleIcon color="#777" width={32} height={32} />  
          </TouchableOpacity>
          <Text
            className="text-2xl text-Hitam font-isemibold ml-[-40px]"
          >Profile</Text>
          <View></View>
        </View>
      

      <View className="flex justify-between h-[80%]">
        <TouchableOpacity
          className="flex flex-row justify-between px-4 py-3 bg-white min-h-[40px] rounded items-center border-solid border-[1px] border-Hitam-4"
          onPress={() => router.push('/edit-profile')}
        >
          <View className="flex flex-row items-center">
            <BuildingStorefrontIcon color='#222' />
            <Text
              className="text-base text-Hitam font-isemibold ml-2"
            >
              {user?.laundry}
            </Text>
          </View>
          <ChevronRightIcon color="#222" width={18} height={18} />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex flex-row px-4 py-3 bg-white min-h-[40px] rounded items-center border-solid border-[1px] border-Merah"
          onPress={logout}
        >
          <ArrowRightStartOnRectangleIcon color='#E14747' />
          <Text
            className="text-base text-Merah font-isemibold ml-2"
          >
            Logout
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  )
}

export default profile