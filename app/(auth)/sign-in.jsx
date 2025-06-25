import { View, Text, ScrollView, Image, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'
import { useState } from 'react'

import FormField from '../../components/FormField'
import PrimaryButton from '../../components/PrimaryButton'

import { images } from '../../constants'
import { getCurrentUser, masukLogin } from '../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'



const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const [ form, setForm ] = useState({
    email: '',
    password: ''
  })

  const submit = async () => {
    if(!form.email || !form.password) {
      Alert.alert('Error', 'Tolong isi semua data')
    }

    setIsSubmitting(true);

    try {
      await masukLogin(form.email, form.password)
      const result = await getCurrentUser();
      setUser(result);
      setIsLogged(true);
      
      router.replace('/home')
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setIsSubmitting(false)
    }

}

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className="w-full justify-center px-6 my-24">
          <Text className="font-isemibold text-xl text-Primary">
            Login di Laundry<Text className='text-Secondary'>+</Text>
          </Text>

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e})}
            otherStyles="mt-6"
            placeholder="Masukan email anda"
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e})}
            otherStyles="mt-4"
            placeholder="Masukan password anda"
          />

          {/* <Text className='mt-2 font-imedium text-sm text-Primary'>
            Forgot Password?
          </Text> */}

          <PrimaryButton 
            title='Submit'
            handlePress={submit}
            containerStyles='w-full rounded mt-6'
            isLoading={isSubmitting}
            textStyle='text-sm text-white font-isemibold'
          />

          <View className="w-full items-center justify-between">
            <Text className="mt-4 mb-20 font-iregular text-sm text-Hitam-2">
              Belum memiliki akun? <Link href="/sign-up" className="font-imedium text-Primary underline" >Daftar sekarang</Link>
            </Text>

            <Image
              source={images.logoFull}
              className="h-12"
              resizeMode='contain'
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn