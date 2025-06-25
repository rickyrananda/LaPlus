import { View, Text, TouchableOpacity, Alert, ToastAndroid } from 'react-native'
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeftCircleIcon } from 'react-native-heroicons/solid'
import FormField from '../components/FormField'
import PrimaryButton from '../components/PrimaryButton'
import useAppwrite from '../lib/useAppwrite'
import { createPengeluaran, getJenisDetails } from '../lib/appwrite'
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGlobalContext } from '../context/GlobalProvider'



const createStockPengeluaran = () => {
  const { user } = useGlobalContext();
  const { data: jenis } = useAppwrite(() => getJenisDetails());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedJenis, setSelectedJenis] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [form, setForm] = useState({
    tanggal: '',
    keterangan: '',
    jenis: '',
    nominal: ''
  })
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  const submit = async () => {
    if (!date || !form.keterangan || !form.nominal) {
      Alert.alert('Error', 'Tolong isi semua data')
      return;
    }
    if (!selectedJenis) {
      Alert.alert('Error', 'Tolong isi semua data')
      ToastAndroid.show('Jenis belum dipilih!', ToastAndroid.SHORT);
      return;
    }
    setIsSubmitting(true)
    const userId = user.$id;

    try {
      await createPengeluaran(
        date,
        form.keterangan,
        form.nominal,
        selectedJenis,
        userId
      )
      Alert.alert('Success', 'Pengeluaran berhasil dibuat');
      router.replace('/stok-pengeluaran')
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
        >Stock/Expenses</Text>
        <View></View>
      </View>

      {/* Isi */}
      <Text className="text-sm text-Hitam-2 font-isemibold">Tanggal</Text>
      <TouchableOpacity onPress={showDatePickerHandler} className="border-[1px] flex-row border-Hitam-4 w-full h-10 px-4 bg-white rounded focus:border-Primary focus:border-2 items-center">
        <Text className="text-black text-lg">
          {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
      <FormField
        title="Keterangan"
        value={form.keterangan}
        handleChangeText={(e) => setForm({ ...form, keterangan: e })}
        otherStyles="mt-2 z-10"
        placeholder="Masukan keterangan"
      />
      <View className="flex mt-2">
        <Text className="text-sm text-Hitam-2 font-isemibold">Jenis</Text>
        <View className="border-[1px] flex-row border-Hitam-4 w-full h-10  bg-white rounded focus:border-Primary focus:border-2 items-center">
          <Picker
            selectedValue={selectedJenis}
            onValueChange={(itemValue) => setSelectedJenis(itemValue)}
            style={{ height: 150, width: '100%' }}
          >
            {jenis?.map((item) => (
              <Picker.Item key={item.$id} label={item.nama} value={item.$id} />
            ))}
          </Picker>
        </View>
      </View>
      <FormField
        title="Nominal"
        value={form.nominal}
        handleChangeText={(e) => setForm({ ...form, nominal: e })}
        otherStyles="mt-4"
        placeholder="Masukan nominal"
      />
      <PrimaryButton
        title='Sumbit'
        handlePress={submit}
        containerStyles='w-full rounded mt-4'
        isLoading={isSubmitting}
        textStyle='text-sm text-white font-isemibold'
      />
    </SafeAreaView>
  )
}

export default createStockPengeluaran