import { React, useState, useEffect } from 'react'
import FormField from '../../components/FormField'
import PrimaryButton from '../../components/PrimaryButton'
import useAppwrite from '../../lib/useAppwrite'
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGlobalContext } from '../../context/GlobalProvider'
import { NewspaperIcon,ArrowsUpDownIcon, MagnifyingGlassIcon } from 'react-native-heroicons/solid'
import { getUserPemasukan } from '../../lib/appwrite'
import { router, useRouter } from 'expo-router'
import { setDetailItem } from '../tempStorage';
import { Picker } from '@react-native-picker/picker'

const Invoice = () => {
  const router = useRouter()
  const { user } = useGlobalContext();
  const { data: pemasukan, refetch: refetchPemasukan } = useAppwrite(() => getUserPemasukan(user.$id));
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filteredData, setFilteredData] = useState(null); 
  const [statusFilter, setStatusFilter] = useState('Semua');

  useEffect(() => {
    const formattedInvoice = pemasukan.map(item => ({
      id: item.$id,
      customerName: item.namapelanggan,   
      amount: item.nominal,
      date: item.tanggalmasuk,
      nomorhp: item.nomorhp, 
      alamat: item.alamatpelanggan,
      type: 'pemasukan',
      bgColor: 'bg-Hijau-2',
      color: 'Hijau',
      invoiceNumber: `#INV${formatName(item.tanggalmasuk)}`,
      status: item.status,
      jasa: item.jasa?.keterangan || "",
      jasaNominal: item.jasaNominal,
      jasaqty: item.jasakuantitas,
      pakaian: item.pakaian, 
      pakaianqty: item.pakaianQty,
      pakaianNominal : item.pakaianNominal,
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
    const filtered = formattedInvoice.filter(item => {
      const matchesSearchTerm = searchTerm
        ? item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nomorhp.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
  
        const matchesStatus = statusFilter === 'Semua' || !statusFilter
        ? true
        : (statusFilter === 'Lunas' && item.status) ||
          (statusFilter === 'Belum Bayar' && !item.status);
  
      return matchesSearchTerm && matchesStatus;
    });
    setFilteredData(filtered);
  }, [searchTerm, pemasukan, statusFilter]);

  

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchPemasukan();
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
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long'});
  };

  const formatName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: 'numeric',  hour: '2-digit', minute: '2-digit',  hour12: false}).replaceAll(/[,\/\s:]+/g, '');
  };

  const handleDetail = (item) => {
    setDetailItem(item);
    router.push("/detailInvoice");
  }

  const totalInvoice = (filteredData && filteredData.length) || 0;

  //Render for invoice only
  const invoiceOnly = ({ item }) => ( 
    <TouchableOpacity 
      className="my-2 flex flex-row"
      onPress={ ()=> (
        handleDetail(item)
      ) }
    >
      <View className="bg-slate-200 w-12 h-12 rounded mr-2 items-center justify-center">
        <NewspaperIcon color='#555' height={20} />
      </View>
      <View className="flex flex-row flex-1 flex-wrap justify-between items-center">
        <View className="flex justify-start">
          <View className="flex flex-row items-center"> 
          <Text className="text-sm text-Hitam-2 font-iregular">{item.invoiceNumber}</Text>
          </View>
          <Text className="text-xs font-iregular text-Hitam-4">Pelanggan: {item.customerName}</Text>
          <Text className="text-xs font-iregular text-Hitam-4">{formatDate(item.date)}</Text>
        </View>
        <View className="flex-wrap items-end">
          <Text className={`min-w-[75px] bg-white rounded px-2 py-0.5 text-[8px] text-center font-isemibold border ${item.status === true ? 'text-Hijau border-Hijau' :'text-Secondary border-Secondary'}`}>
            {item.status ? 'LUNAS' : 'BELUM BAYAR'}
          </Text>
          <Text className='text-sm text-Hitam-2 font-imedium'>{formatRupiah(item.amount)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="bg-white h-full p-8">
      <View className="relative bg-Merah mb-10">
        <FormField
          value={searchTerm}
          placeholder="Masukan nama/nomor pelanggan"
          handleChangeText={setSearchTerm}
          otherStyles='flex-1 top-0'
        />
        <View className="absolute right-3 top-2.5">
          <MagnifyingGlassIcon color="#333" height={24} />
        </View>
      </View>
      <View className="flex-row items-center mt-2 justify-between">
      <Text className="text-Hitam-2 text-base font-iregular">Status</Text>
      <Picker
          selectedValue={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
          style={{ height: 50, width: 200}}
          dropdownIconColor={'black'}
        >
          <Picker.Item label="Semua" value="Semua" />
          <Picker.Item label="Lunas" value="Lunas" />
          <Picker.Item label="Belum Bayar" value="Belum Bayar" />
      </Picker>
      </View>
      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-row items-center">
          <Text className="text-Hitam-2 text-base font-isemibold">
            Daftar Invoice/Nota
          </Text>
          <ArrowsUpDownIcon color="#333" height={16}/>
        </View>
        <Text>Total : {totalInvoice}</Text>
      </View>
        <FlatList
          data={filteredData}
          renderItem={invoiceOnly}
          keyExtractor={(item) => item.id}
          refreshControl={ 
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <View className="mt-2 bg-slate-50 w-full h-20 border-[0.5px] border-Hitam-4/10 rounded justify-center">

              <Text className="text-center text-sm font-imedium text-Hitam-4">Tidak ada invoice</Text>
            </View>
          }
          scrollEnabled={true}
        />
        <PrimaryButton 
          title= '+ Buat Invoice'
          handlePress= {() => router.push('/createInvoice')}
          containerStyles='w-full mb-4 bg-white border-solid border-2 border-Primary'
          textStyle='text-sm text-Primary font-isemibold'
        />
    </SafeAreaView>
  )
}

export default Invoice