import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import FormField from '../components/FormField'
import PrimaryButton from '../components/PrimaryButton'
import useAppwrite from '../lib/useAppwrite'
import { useGlobalContext } from '../context/GlobalProvider'
import {  ArrowLeftCircleIcon} from 'react-native-heroicons/solid'
import { createHarga } from '../lib/appwrite'

const CreateHarga = () => {
    const { user } = useGlobalContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        tanggal: '',
        keterangan: '',
        jenis: '',
        nominal: ''
        })

    const submit = async () => {
        if(!form.keterangan || !form.nominal) {
            Alert.alert('Error', 'Tolong isi semua data')
            return; 
        }
        setIsSubmitting(true)
        const userId = user.$id;
    
        try {
            await createHarga(
            form.keterangan,
            form.nominal,
            userId
            )
            Alert.alert('Success', 'Harga/Prdouk berhasil dibuat');
            router.replace('/daftar-harga')
        } catch (error) {
            Alert.alert('Error', error.message)
        } finally {
            setIsSubmitting(false)
        }
    }



    return (
    <SafeAreaView className="bg-white h-full p-8">
        <View className="flex flex-row items-center justify-between mb-12">
            <TouchableOpacity
                onPress={router.back}
            >
                <ArrowLeftCircleIcon color="#777" width={32} height={32} />  
            </TouchableOpacity>
            <Text
                className="text-2xl text-Hitam font-isemibold ml-[-40px]"
            >Harga/Produk</Text>
            <View></View>
        </View>

        <FormField
            title="Keterangan"
            value={form.keterangan}
            handleChangeText={(e) => setForm({ ...form, keterangan: e})}
            otherStyles="mt-4"
            placeholder="Masukan keterangan"
        />
        <FormField
            title="Nominal"
            value={form.nominal}
            handleChangeText={(e) => setForm({ ...form, nominal: e})}
            otherStyles="mt-4"
            placeholder="Masukan nominal"
        />
         <PrimaryButton 
            title='Tambah'
            handlePress={submit}
            containerStyles='w-full rounded mt-4'
            isLoading={isSubmitting}
            textStyle='text-sm text-white font-isemibold'
        />

    </SafeAreaView>
    );
}


export default CreateHarga;
