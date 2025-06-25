import { StatusBar } from 'expo-status-bar'
import { ScrollView, Text, View, Image } from 'react-native'
import { Redirect, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import 'react-native-url-polyfill/auto'
import { images } from '../constants'
import PrimaryButton from '../components/PrimaryButton'
import { useGlobalContext } from '../context/GlobalProvider'

export default function App() {
  const {isLoading, isLogged} = useGlobalContext();
  if(!isLoading && isLogged) return <Redirect href="/home" />

  return (
    <SafeAreaView className="bg-white h-full">
      <StatusBar hidden= { true }/>
      <ScrollView contentContainerStyle={{ height: '100%'}}>
        <Image 
          source={images.blob1}
          resizeMode='contain'
          className='absolute top-[-50]'
        />
        <Image 
          source={images.blob2}
          resizeMode='contain'
          className='absolute bottom-[-10] w-[300]'
        />
        <View className="w-full flex justify-center items-center h-full px-8">
          <View className="w-full flex-row flex-none h-1/2 justify-center items-center gap-2">
            <Image 
              source={images.logo}
              resizeMode='contain'
              className="w-[50px] h-[50px]"
            />
            <Image 
              source={images.logoText}
              resizeMode='contain'
              className="w-[140px] h-[22px]"
            />
          </View>
          <Text className=" text-Primary w-[300] font-isemibold text-md text-center">
            Satu aplikasi untuk semua kebutuhan
            Usaha Laundry anda
          </Text>
          <View className='w-full'>
            <PrimaryButton 
              title= 'Login'
              handlePress= {() => router.push('/sign-in')}
              containerStyles='w-full mt-10'
              textStyle='text-sm text-white font-isemibold'
            />
            <PrimaryButton 
              title= 'Register'
              handlePress= {() => router.push('/sign-up')}
              containerStyles='w-full mt-4 bg-white border-solid border-2 border-Primary'
              textStyle='text-sm text-Primary font-isemibold'
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

