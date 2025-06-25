import { View, Text, ScrollView, Image, Alert, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'
import * as DocumentPicker from "expo-document-picker";
import { useState } from 'react'

import FormField from '../../components/FormField'
import PrimaryButton from '../../components/PrimaryButton'

import { icons } from '../../constants'
import { useGlobalContext } from '../../context/GlobalProvider';
import { createLaundry } from '../../lib/appwrite';


const crLaundry = () => {
  const { user, setUser } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    nomor: "",
    logo: null,
  });


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

    if (
      (form.nama === "") |
      (form.alamat === "") |
      (form.nomor === "") |
      !form.logo
    ) {
      return Alert.alert("Please provide all fields")
    }

    setUploading(true);
    try {
      await createLaundry({
        ...form,
        userId: user.$id,
      });
      
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        nama: "",
        alamat: "",
        nomor: "",
        logo: null,
      });

      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className="w-full justify-center px-6 my-12">
          <Text className="font-isemibold text-xl text-Primary">
          Eitts tunggu dulu,
          </Text>
          <Text className="font-isemibold text-xl text-Primary">
          Coba isi form ini dulu!
          </Text>

          <FormField
            title="Nama usaha"
            value={form.nama}
            handleChangeText={(e) => setForm({ ...form, nama: e})}
            otherStyles="mt-6"
          />
          <FormField
            title="Alamat"
            value={form.alamat}
            handleChangeText={(e) => setForm({ ...form, alamat: e})}
            otherStyles="mt-4"
            theOtherStyles="h-14"
          />
          <FormField
            title="No. Telp"
            value={form.nomor}
            handleChangeText={(e) => setForm({ ...form, nomor: e})}
            otherStyles="mt-4"
          />
          <View className="mt-4">
            <Text className="text-sm text-Hitam-2 font-isemibold mb-[2px]">Logo</Text>
            <View className="border-[1px] border-dashed py-4 border-Hitam-4 justify-center items-center space-y-2">
                <Text className="font-iregular text-md text-Hitam-4">Upload Logo anda (.jpg or .png)</Text>
                <TouchableOpacity
                  className="w-40 bg-white py-2 px-4  border-[1px] border-Hitam-4 rounded-md"
                  onPress={() => openPicker("image")}
                >
                  {form.logo ? (
                    <Image
                      source={{ uri: form.logo.uri }}
                      resizeMode="cover"
                      className="w-full h-40 rounded-2xl"
                    />
                  ): (
                    <View className="flex-row items-center space-x-2">
                      <Image
                        source={icons.unggah}
                        resizeMode='contain'
                        className="w-4 h-4"
                      />
                      <Text className="font-imedium text-sm text-Hitam-4">Upload gambar</Text>
                    </View>

                  )}
                </TouchableOpacity>
            </View>
          </View>


          

          <View className="mt-4 bg-Secondary-2 border-2 border-Secondary rounded-md px-3 py-2">
            <Text className="font-imedium text-xs text-Hitam">
            *Semua data yang anda isi, bisa anda ubah di pengaturan profile. 
            </Text>
          </View>
          <PrimaryButton 
            title='Submit'
            handlePress={submit}
            containerStyles='w-full rounded mt-6'
            textStyle='text-sm text-white font-isemibold'
          />

          
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default crLaundry