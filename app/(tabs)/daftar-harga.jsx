import {useState, useEffect} from 'react'
import { View, Text, TextInput,TouchableOpacity, Alert, Modal, ScrollView } from 'react-native'
import { useGlobalContext } from '../../context/GlobalProvider'
import useAppwrite from '../../lib/useAppwrite'
import { deleteHarga, deleteJasa, getHarga, getJasa, updateHarga, updateJasa } from '../../lib/appwrite'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SwatchIcon, CurrencyDollarIcon, ChevronUpIcon, ChevronDownIcon, TrashIcon} from 'react-native-heroicons/solid'
import PrimaryButton from '../../components/PrimaryButton'
import FormField from '../../components/FormField'
import { router } from 'expo-router'
import { set } from 'date-fns/fp'

const DaftarHarga = () => {
  const { user } = useGlobalContext();
  const { data: jasa, refetch: refetchJasa } = useAppwrite(() => getJasa(user.$id));
  const { data: harga, refetch: refetchHarga } = useAppwrite(() => getHarga(user.$id));
  const [openItemIndex, setOpenItemIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editHarga, setEditHarga] = useState(null);
  const [form, setForm] = useState({
    nominal: '',
  });
  const [form2, setForm2] = useState({
    keterangan: editHarga?.keterangan,
    nominal: editHarga?.nominal,
  });

  const handleEdit = (item) => {
    setEditHarga(item);
    setForm2({
      keterangan: item.keterangan,
      nominal: item.nominal,
    });
  };

  const handleSumbit = async () => {

    if(!form2.keterangan || !form2.nominal) {
      Alert.alert('Error', 'Tolong isi semua data')
      return; 
    }

    try {
      await updateHarga(
        editHarga.$id,
        form2.keterangan,
        form2.nominal,
      )
      Alert.alert('Success', 'Produk berhasil diperbaharui');
      setEditHarga(null);
      await refetchHarga();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const toggleAccordion = (index, item) => {
    if (openItemIndex === index) {
      setOpenItemIndex(null);
    } else {
      setEditItem(item);
      setOpenItemIndex(index); 
      setForm({
        nominal: item.nominal.toString()
      });
    }
  };

  const handleSave = async () => {
    const nominalString = form.nominal?.toString().trim();

    if(!nominalString || nominalString.length > 220) {
      Alert.alert('Error', 'Tolong isi semua data')
      return; 
    }
    setIsSubmitting(true);
    try {
      await updateJasa(
        editItem.$id,
        nominalString
      )
      Alert.alert('Success', 'Harga berhasil diperbaharui');
      await refetchJasa();
      setOpenItemIndex(null)
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = (itemId) => {
    Alert.alert("Hapus", "Apakah anda yakin ingin menghapus ini?", [
      { text: "Kembali", style: "cancel" },
      { text: "Delete", onPress: async () => {
          try {
            await deleteJasa(itemId); 
            Alert.alert("Success", "Jasa berhasil dihapus.");
            await refetchJasa();
          } catch (error) {
            Alert.alert("Error", error.message);
          }
      }},
    ]);
  };

  const handleDeleteHarga = (itemId) => {
    Alert.alert("Hapus", "Apakah anda yakin ingin menghapus ini?", [
      { text: "Kembali", style: "cancel" },
      { text: "Delete", onPress: async () => {
          try {
            await deleteHarga(itemId); 
            Alert.alert("Success", "Harga/Produk berhasil dihapus.");
            setEditHarga(null);
            await refetchHarga();
          } catch (error) {
            Alert.alert("Error", error.message);
          }
      }},
    ]);
  };

  return (
   <SafeAreaView className="bg-white p-8">
    <View className="mb-2">
      <View className="flex flex-row items-center">
        <Text className="text-Hitam-2 text-base font-isemibold">
          Servis
        </Text>
        <SwatchIcon color="#333" height={16} strokeWidth={2}/>
      </View>
      <View className="mt-4">
      {jasa.map((item, index) => (
        <View key={index} className="mb-2">
          <TouchableOpacity
            className="bg-Primary-2 p-2 rounded flex flex-row justify-start items-center"
            onPress={() => toggleAccordion(index, item)}
          >
            <View className="flex-1 ml-4">
              <Text className="text-white font-isemibold text-base">{item.keterangan}</Text>
            </View>
            {openItemIndex === index ? (
              <ChevronUpIcon color="#fff" height={16} />
            ) : (
              <View className="flex flex-row items-center">
                <View className="min-w-[100px] h-6 bg-white rounded mr-2">
                    <Text className="font-isemibold text-base text-Hitam-2 text-center">{item.nominal}</Text>
                </View>
                <ChevronDownIcon color="#fff" height={16} />
              </View>
            )}
          </TouchableOpacity>

          {openItemIndex === index && (
            <View className="bg-white p-4 border border-gray-200 rounded">
              <View className="flex flex-row w-full justify-between items-center">
                <FormField
                  title="Nominal"
                  display="hidden"
                  value={form.nominal}
                  handleChangeText={(e) => setForm({ ...form, nominal: e})}
                  otherStyles="w-24"
                />
                <Text className="text-lg font-isemibold">{item.keterangan === "Koin" ? "/ Koin" : "/ Kg"}</Text>
                <View className="flex flex-row">
                  <TouchableOpacity
                    onPress={handleSave}
                    className="bg-Primary-2 rounded px-4 py-2 h-10"
                  >
                    <Text className="text-white font-iregular">Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      handleDelete(item.$id);
                    }}
                    className="bg-Merah rounded px-4 py-2 h-10"
                  >
                    <TrashIcon color='#FFF' />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      ))}
      </View>
    </View>

    <View>
      <View className="flex flex-row items-center">
        <Text className="text-Hitam-2 text-base font-isemibold">
          List Produk
        </Text>
        <CurrencyDollarIcon color="#333" height={16} strokeWidth={2}/>
        <Text className="text-Hitam-2 text-xs font-iregular">
          (per Jenis)
        </Text>
      </View>
      <PrimaryButton 
        title='+ Produk'
        handlePress={()=> router.push('/createHarga')}
        containerStyles='w-full rounded-lg mt-4 bg-white border border-2 border-Primary-2'
        textStyle='text-sm text-Primary-2 font-isemibold'
      />
      <ScrollView className="h-full mt-4"> 
      <View className="flex flex-row flex-wrap">
          {harga.map((item, index) => (
            <View key={index} className="w-1/2 p-1">
              <TouchableOpacity  
                className="bg-Secondary-2 rounded px-4 py-2 justify-between"
                onPress={()=> handleEdit(item)}
              >
                <Text className="text-xs font-iregular">{item.keterangan}</Text>
                <Text className="text-base font-isemibold">{item.nominal}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View> 
      </ScrollView>
      

    </View>
    {editHarga && (
    <Modal
      visible={!!editHarga}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setEditHarga(null)} 
    >
     <View className="flex-1 justify-center items-center bg-black/50">
       <View className="bg-white p-6 w-[80%] h-[60%] rounded-md">
         <Text className="text-lg text-Hitam-2 font-ibold text-center mb-2">Edit</Text>
         <View>
           <FormField
             title="Keterangan"
             value={form2.keterangan}
             handleChangeText={(e) => setForm2({ ...form2, keterangan: e})}
             otherStyles="mt-2"
           />
           <FormField
             title="Nominal"
             value={form2.nominal}
             handleChangeText={(e) => setForm2({ ...form2, nominal: e})}
             otherStyles="mt-2"
           />
         </View>
         <View>
         <PrimaryButton 
           title='Simpan'
           handlePress={handleSumbit}
           containerStyles='w-full rounded mt-10'
           isLoading={isSubmitting}
           textStyle='text-sm text-white font-isemibold'
         />
         
         <PrimaryButton 
           title='Delete'
           handlePress={() => handleDeleteHarga(editHarga.$id)}
           containerStyles='w-full rounded mt-2 bg-Merah'
           isLoading={isSubmitting}
           textStyle='text-sm text-white font-isemibold'
         />

          <PrimaryButton 
           title='Kembali'
           handlePress={() => setEditHarga(null)}
           containerStyles='w-full rounded mt-2 bg-white border-solid border-2 border-Primary'
           isLoading={isSubmitting}
           textStyle='text-sm text-Primary font-isemibold'
         />
         </View>
         
       </View>
     </View>
   </Modal>
    )}
   </SafeAreaView>
  )
}

export default DaftarHarga