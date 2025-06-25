import { View, Text, ScrollView, Image, Alert, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'
import { useState } from 'react'
import * as DocumentPicker from "expo-document-picker";
import { useGlobalContext } from '../../context/GlobalProvider'

import FormField from '../../components/FormField'
import PrimaryButton from '../../components/PrimaryButton'

import { images } from '../../constants'
import { icons } from '../../constants'

import { daftarAkun } from '../../lib/appwrite'

const SignUp = () => {
  
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    laundry: '',
    nomor: '',
    alamat: '',
    logo: null,

  })

  const openPicker = async (selectType) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/png', 'image/jpeg', 'image/jpg'],
    });

    if (!result.canceled) {
      if (selectType === "image") {
        setForm({
          ...form,
          logo: result.assets[0],
        });
      }

    } else {
      setTimeout(() => {
        Alert.alert("Document picked", JSON.stringify(result, null, 2));
      }, 100);
    }
  };

 

  const submit = async () => {
      if(!form.username || !form.email || !form.password || !form.nomor || !form.alamat || form.logo || !form.laundry ) {
        Alert.alert('Error', 'Tolong isi semua data')
      }
      setIsSubmitting(true);


      try {
        const result = await daftarAkun(
          form.email, 
          form.password, 
          form.username, 
          form.alamat, 
          form.nomor, 
          form.logo, 
          form.laundry
        )

        setUser(result);

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
            Daftarkan akun anda
          </Text>

          <FormField
            title="Nama Pemilik"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e})}
            otherStyles="mt-6"
            placeholder="Nama"
          />
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e})}
            otherStyles="mt-4"
            placeholder="example@gmail.com"
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e})}
            otherStyles="mt-4"
            placeholder="password"
          />
          <FormField
            title="Nama Laundry"
            value={form.laundry}
            handleChangeText={(e) => setForm({ ...form, laundry: e})}
            otherStyles="mt-6"
            placeholder="Nama laundry"
          />
          <FormField
            title="No. Telp"
            value={form.nomor}
            handleChangeText={(e) => setForm({ ...form, nomor: e})}
            otherStyles="mt-4"
            placeholder="No telp"
          />
          <FormField
            title="Alamat"
            value={form.alamat}
            handleChangeText={(e) => setForm({ ...form, alamat: e})}
            otherStyles="mt-4"
            theOtherStyles="h-14"
            placeholder="masukan alamat laundry"
          />

          <PrimaryButton 
            title='Daftar'
            handlePress={submit}
            containerStyles='w-full rounded mt-6'
            isLoading={isSubmitting}
            textStyle='text-sm text-white font-isemibold'
          />

          <View className="w-full items-center justify-between">
            <Text className="mt-4 mb-20 font-iregular text-sm text-Hitam-2">
              Sudah memiliki akun? <Link href="/sign-in" className="font-imedium text-Primary underline" >Log in</Link>
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

export default SignUp