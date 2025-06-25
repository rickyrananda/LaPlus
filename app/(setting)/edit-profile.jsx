import { React, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { useGlobalContext } from '../../context/GlobalProvider'
import FormField from '../../components/FormField'
import PrimaryButton from '../../components/PrimaryButton'
import { router } from 'expo-router'
import {  ArrowLeftCircleIcon } from 'react-native-heroicons/solid'
import { editAkun } from '../../lib/appwrite'

const editProfile = () => {
  const { user, setUser} = useGlobalContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    laundry: user.laundry,
    nomor: user.nomor,
    alamat: user.alamat,
  })

  const submit = async () => {
    if(!form.username || !form.email || !form.nomor || !form.alamat || !form.laundry ) {
      Alert.alert('Error', 'Tolong isi semua data')
    }
    setIsSubmitting(true);

    try {
      await editAkun(
          form.email, 
          form.username, 
          form.alamat, 
          form.nomor,
          form.laundry
      );

      const updatedUser = {
        ...user,
        email: form.email,
        username: form.username,
        alamat: form.alamat,
        nomor: form.nomor,
        laundry: form.laundry
      };

      setUser(updatedUser);

    
      setForm(updatedUser);

      Alert.alert('Success', 'Data berhasil diperbaharui');
      router.replace('/profile')
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setIsSubmitting(false)
    }
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
        >Edit Profile</Text>
        <View></View>
      </View>

      <FormField
            title="Nama Pemilik"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e})}
            otherStyles="mt-6"
          />
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e})}
            otherStyles="mt-4"
            placeholder="example@gmail.com"
          />
          <FormField
            title="Nama Laundry"
            value={form.laundry}
            handleChangeText={(e) => setForm({ ...form, laundry: e})}
            otherStyles="mt-6"
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
            theOtherStyles="h-32 items-start"
            placeholder="masukan alamat laundry"
          />


      <PrimaryButton 
              title= 'Simpan'
              handlePress= {submit}
              containerStyles='w-full mt-10'
              isLoading={isSubmitting}
              textStyle='text-sm text-white font-isemibold'
            />
    </SafeAreaView>
  )
}

export default editProfile