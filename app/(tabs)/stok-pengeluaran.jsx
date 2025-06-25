import { React, useState, useMemo, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Button, Modal, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import PrimaryButton from '../../components/PrimaryButton'
import FormField from '../../components/FormField'
import { router } from 'expo-router'
import { ShoppingBagIcon, ArchiveBoxIcon, BanknotesIcon, PencilSquareIcon, TrashIcon } from 'react-native-heroicons/solid'
import useAppwrite from '../../lib/useAppwrite'
import { getUserPengeluaran, getJenisDetails, updatePengeluaran, deletePengeluaran } from '../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar'
import { Picker } from '@react-native-picker/picker';

const StokPengeluaran = () => {
  const { user } = useGlobalContext();
  const { data: pengeluaran, refetch: refetchPengeluaran } = useAppwrite(() => getUserPengeluaran(user.$id));
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [date, setDate] = useState(new Date(editItem?.date || Date.now()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { data: jenis } = useAppwrite(() => getJenisDetails());
  const [selectedJenis, setSelectedJenis] = useState('');
  const [form, setForm] = useState({
    date: editItem?.date,
    keterangan: editItem?.customerName,
    jenis: editItem?.jenis,
    nominal: editItem?.amount,
  })
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setForm({ ...form, date: currentDate });
    setShowDatePicker(false);
  };

  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchPengeluaran();
    setRefreshing(false);
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setDate(item.date)
    setSelectedJenis(item.jenis.$id);
  };

  useEffect(() => {
    if (editItem) {

      setForm({
        date: new Date(editItem.date),
        keterangan: editItem.customerName || '',
        jenis: editItem.jenis || '',
        nominal: editItem.amount || '',
      });
      setDate(new Date(editItem.date));
    }
  }, [editItem]);

  const submit = async () => {

    if (!form.date || !form.keterangan || !form.nominal || !selectedJenis) {
      Alert.alert('Error', 'Tolong isi semua data')
      return;
    }
    setIsSubmitting(true);

    try {
      await updatePengeluaran(
        editItem.id,
        form.date,
        form.keterangan,
        form.nominal,
        selectedJenis
      );
      Alert.alert('Success', 'Pengeluaran berhasil diperbaharui');
      setEditItem(null);
      await refetchPengeluaran();
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (itemId) => {
    Alert.alert("Hapus", "Apakah anda yakin ingin menghapus ini?", [
      { text: "Kembali", style: "cancel" },
      {
        text: "Delete", onPress: async () => {
          try {
            await deletePengeluaran(itemId);
            Alert.alert("Success", "Pengeluaran berhasil dihapus.");
            await refetchPengeluaran();
          } catch (error) {
            Alert.alert("Error", error.message);
          }
        }
      },
    ]);
  };

  const formattedPengeluaran = pengeluaran.map(item => {
    return {
      id: item.$id,
      customerName: item.keterangan,
      amount: item.nominal,
      date: item.Tanggal,
      jenis: item.jenis,
      type: 'pengeluaran',
      bgColor: 'bg-Merah-2',
      color: 'Merah',
    }
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
  const truncateText = (text, maxLength) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  const pengeluaranOnly = ({ item }) => {
    const jenisName = item.jenis.nama;

    return (
      <View className="my-2 flex flex-row w-full">
        <View className="w-12 h-12 rounded mr-2 items-center justify-center">
          {jenisName === 'Stock' ? <ArchiveBoxIcon color='#333' height={20} /> : <BanknotesIcon color='#333' height={20} />}
        </View>
        <View className="flex flex-1 flex-row justify-between items-center">
          <View className="flex-1 mr-2">
            <Text className="text-xs text-Hitam-2 font-isemibold">{truncateText(item.customerName, 15)}</Text>

            <Text className="text-xs font-iregular text-Hitam-4">{formatDate(item.date)}</Text>

          </View>
          <View className="flex flex-row justify-between items-center gap-2">
            <Text className={`text-sm text-Hitam-2 font-isemibold`}>{formatRupiah(item.amount)}</Text>
            <TouchableOpacity
              className="bg-slate-200 h-6 rounded text-center p-[2px]"
              onPress={() => handleEdit(item)}
            >
              <PencilSquareIcon color="#333" height={16} />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-slate-200 h-6 rounded text-center p-[2px]"
              onPress={() => handleDelete(item.id)}
            >
              <TrashIcon color="#E14747" height={16} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

    )
  }



  const [filters, setFilters] = useState([
    { label: 'Semua' },
    { label: 'Stock' },
    { label: 'Expenses' }, ,
  ]);
  const [selected, setSelected] = useState(filters[0]);

  const callback = (data) => {
    if (selected === data) return setSelected(filters[0]);
    setSelected(data);
  };

  const FilterButton = ({ callback, selected, data }) => {
    return (
      <TouchableOpacity
        className={`w-1/3 px-5 py-2 items-center ${selected ? 'bg-Secondary-2' : 'bg-Secondary'} `}
        onPress={() => {
          if (callback) {
            callback(data);
          }
        }}>
        <Text
          className="font-isemibold text-sm text-Hitam"
        >
          {data.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const filteredPengeluaran = useMemo(() => {
    if (selected.label === 'Semua') {
      return formattedPengeluaran;
    }
    return formattedPengeluaran.filter(item => item.jenis.nama === selected.label);
  }, [formattedPengeluaran, selected]);

  return (
    <SafeAreaView className="bg-white h-full">
      <StatusBar hidden={true} />
      <View className="px-6 py-8">
        <View className="flex flex-row justify-between bg-Secondary p-2 rounded gap-1 ">
          {filters.map((filter) => (
            <FilterButton
              key={filter.label}
              selected={filter === selected}
              data={filter}
              callback={callback}
            />
          ))}
        </View>
        <PrimaryButton
          title='+ Tambah Stock/Pengeluaran'
          handlePress={() => router.push('/createStockPengeluaran')}
          containerStyles='w-full rounded-lg mt-6 bg-white border border-2 border-Primary-2'
          textStyle='text-sm text-Primary-2 font-isemibold'
        />
        <FlatList
          data={filteredPengeluaran}
          renderItem={pengeluaranOnly}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListHeaderComponent={
            <View className="flex flex-row items-center mt-4">
              <Text className="text-Hitam-2 text-base font-isemibold">
                Pengeluaran Terbaru
              </Text>
              <ShoppingBagIcon color="#333" height={16} />
            </View>
          }
          ListEmptyComponent={
            <View className="mt-2 bg-slate-50 w-full h-20 border-[0.5px] border-Hitam-4/10 rounded justify-center">

              <Text className="text-center text-sm font-imedium text-Hitam-4">Belum ada invoice</Text>
            </View>
          }
          scrollEnabled={false}
        />
      </View>
      {editItem && (

        <Modal
          visible={!!editItem}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setEditItem(null)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-6 w-[80%] h-[70%] rounded">
              <Text className="text-lg text-Hitam-2 font-ibold text-center mb-2">Edit</Text>
              <View>
                <Text className="text-sm text-Hitam-2 font-isemibold">Tanggal</Text>
                <TouchableOpacity onPress={showDatePickerHandler} className="border-[1px] flex-row border-Hitam-4 w-full h-10 px-4 bg-white rounded focus:border-Primary focus:border-2 items-center">
                  <Text className="text-black text-lg">
                    {formatDate(form.date)}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={form.date}
                    mode="date"
                    is24Hour="true"
                    display="default"
                    onChange={onChangeDate}
                  />
                )}

                <FormField
                  title="Keterangan"
                  value={form.keterangan}
                  handleChangeText={(e) => setForm({ ...form, keterangan: e })}
                  otherStyles="mt-2 z-10"
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
                  otherStyles="mt-2"
                />
              </View>
              <View>
                <PrimaryButton
                  title='Simpan'
                  handlePress={submit}
                  containerStyles='w-full rounded mt-8'
                  isLoading={isSubmitting}
                  textStyle='text-sm text-white font-isemibold'
                />
                <PrimaryButton
                  title='Kembali'
                  handlePress={() => setEditItem(null)}
                  containerStyles='w-full rounded mt-4 bg-white border-solid border-2 border-Primary'
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

export default StokPengeluaran