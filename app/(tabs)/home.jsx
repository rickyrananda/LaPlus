import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl, ScrollView } from 'react-native'
import { React,  useMemo, useState, useRef } from 'react'
import { Link, router, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGlobalContext } from '../../context/GlobalProvider'
import useAppwrite from '../../lib/useAppwrite'
import { getUserPemasukan, getUserPengeluaran } from '../../lib/appwrite'
import { NewspaperIcon,UserIcon, BuildingStorefrontIcon, ArrowLongRightIcon, ArrowsUpDownIcon, ShoppingBagIcon, ArrowDownLeftIcon, ArrowUpRightIcon } from 'react-native-heroicons/solid'
import { icons } from '../../constants'

const Home = () => {
  const router = useRouter()
  const { user } = useGlobalContext();
  const { data: pemasukan, refetch: refetchPemasukan } = useAppwrite(() => getUserPemasukan(user.$id));
  const { data: pengeluaran, refetch: refetchPengeluaran } = useAppwrite(() => getUserPengeluaran(user.$id));
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef(null);
 
  const onRefresh = async () => {
    setRefreshing(true);
    await refetchPemasukan();
    await refetchPengeluaran();
    setRefreshing(false);
  };

  const [totalPemasukan, totalPending] = useMemo(() => {
    if (pemasukan) {
      const totals = pemasukan.reduce(
        (acc, item) => {
          if (item.status) {
            acc.totalPemasukan += Number.parseInt(item.nominal);
          } else {
            acc.totalPending += Number.parseInt(item.nominal);
          }
          return acc;
        },
        { totalPemasukan: 0, totalPending: 0 }
      );
      return [totals.totalPemasukan, totals.totalPending];
    }
    return [0, 0];
  }, [pemasukan]);

  const totalPengeluaran = useMemo(() => {
    if(pengeluaran) {
      const totalValue = pengeluaran.reduce((acc, item) => {
        return acc + Number.parseInt(item.nominal);
    }, 0)
      return totalValue;
    }
  }, [pengeluaran])
 
  const handleDashboard= async () => {
    router.replace('/dashboard')
  }

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

  

  //Transaksi
  const formattedPemasukan = pemasukan
    .filter(item => item.status)
    .map(item => ({
    id: item.$id,
    customerName: item.namapelanggan, 
    amount: item.nominal,
    date: item.tanggalmasuk, 
    type: 'pemasukan',
    bgColor: 'bg-Hijau-2',
    color: 'Hijau',
    invoiceNumber: `#INV${formatName(item.tanggalmasuk)}`,
  })).sort((a, b) => new Date(b.date) - new Date(a.date));

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

  const allTransactions = [...formattedPemasukan, ...formattedPengeluaran];

  const sortedTransactions = allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  const formattedInvoice = pemasukan.map(item => ({
    id: item.$id,
    customerName: item.namapelanggan, 
    amount: item.nominal,
    date: item.tanggalmasuk,
    status: item.status,
    invoiceNumber: `#INV${formatName(item.tanggalmasuk)}`,
  })).sort((a, b) => new Date(b.date) - new Date(a.date));

  //Render for riwayat transaksi
  const renderItem = ({ item }) => (
    <View className='my-2 flex flex-row w-full '>
      <View className={`${item.bgColor} flex w-12 h-12 rounded border border-${item.color} mr-2 items-center justify-center`}>
      {item.type === 'pemasukan' ? <ArrowDownLeftIcon color='#47E1A0' height={20} /> : <ArrowUpRightIcon color='#E14747' height={20} />}
      </View>

      <View className="flex flex-1" >
        <Text className="text-sm text-Hitam-2 font-iemdium">
          {item.type === 'pemasukan' ? `${item.invoiceNumber}` : `${item.customerName}`}
        </Text>
        <View className="flex flex-row justify-between items-center space-x-1 border-b-[0.5px] border-Hitam-4/30 ">
          <Text className="text-xs font-iregular text-Hitam-4">{formatDate(item.date)}</Text>
          <Text className={`text-sm text-Hitam-2 font-imedium`}>{formatRupiah(item.amount)}</Text>
        </View>
      </View>

      <Text className="text-sm text-gray-500"></Text>
    </View>
  );

  //Render for invoice only
  const invoiceOnly = ({ item }) => (
    <View className="my-2 flex flex-row">
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
    </View>
  );

  return (
    
    <SafeAreaView className="bg-white flex-1 h-full">
      
      <View className="bg-Primary p-6 h-[240] rounded-b-xl">
        <View className="flex flex-row justify-between mb-4">
          <View>
            <Text className="text-white">Selamat Datang,</Text>
            <View className="flex flex-row items-center justify-start gap-2">
              <Text className="font-medium text-white text-lg">
                {user?.username}
                
              </Text>
              <Image
                source={icons.handwave}
                className='w-5 h-5'
                resizeMode='contain'
                />
            </View>
          </View>
          <TouchableOpacity 
          className="bg-white w-10 h-10 rounded-md justify-center items-center"
          onPress={()=> router.push('/profile')}>
            <UserIcon color="#0154F6" />
          </TouchableOpacity>
        </View>
        <View>
          <View className="flex flex-row items-center gap-2">
            <BuildingStorefrontIcon color="#FFF" />
            <Text className="font-imedium text-base text-white">{user?.laundry}</Text>
          </View>

          <TouchableOpacity
            onPress={handleDashboard}
          >
            <View className="bg-white rounded-md px-4 py-3 mt-2 flex">
              <View 
                className="flex flex-row justify-between items-center mb-3">
                <Text className="text-Primary-2 text-sm font-imedium">Pemasukan</Text>
                <Text  className="text-Hijau text-base font-isemibold">{formatRupiah(totalPemasukan)} </Text>
              </View>

              <View  className="flex flex-row justify-between items-center">
                <Text className="text-Primary-2 text-sm font-imedium">Pengeluaran</Text>
                <Text className="text-Merah text-base font-isemibold">{formatRupiah(totalPengeluaran)}</Text>
              </View>
  
            </View>
            <View className="flex flex-row items-center justify-center mt-2">
              <Text className="font-imedium text-sm text-white mr-4">
                Lihat Rincian
              </Text>
              <ArrowLongRightIcon color="#FFF" height={20} />
            </View>
          </TouchableOpacity>


        </View>
      </View>
      

      <View className="flex-1 px-6 pt-4 mb-4 w-full h-full">
        <ScrollView
          ref={scrollViewRef}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          showsVerticalScrollIndicator={false} 
          showsHorizontalScrollIndicator={false}
        >
          
        {/* Riwayat Transaksi */}
        <View className="flex flex-row items-center">
          <Text className="text-Hitam-2 text-base font-isemibold">
            Riwayat Transaksi 
          </Text>
          <ArrowsUpDownIcon color="#333" height={16} strokeWidth={2}/>
        </View>
        <FlatList
          data={sortedTransactions.slice(0, 5)}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="mt-2 bg-slate-50 w-full h-20 border-[0.5px] border-Hitam-4/10 rounded justify-center">

              <Text className="text-center text-sm font-imedium text-Hitam-4">Belum ada transaksi</Text>
            </View>
          }
          scrollEnabled={false}
        />
        <View className="flex flex-row items-center mt-4">
          <Text className="text-Hitam-2 text-base font-isemibold">
            Invoice Terbaru
          </Text>
          <ShoppingBagIcon color="#333" height={16}/>
        </View>
        {/* Invoice Terbaru */}
        <FlatList
          data={formattedInvoice.slice(0, 5)}
          renderItem={invoiceOnly}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="mt-2 bg-slate-50 w-full h-20 border-[0.5px] border-Hitam-4/10 rounded justify-center">

              <Text className="text-center text-sm font-imedium text-Hitam-4">Belum ada invoice</Text>
            </View>
          } 
          scrollEnabled={false}   
        />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default Home