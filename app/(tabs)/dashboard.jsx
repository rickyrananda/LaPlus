import { React, useState, useMemo, useRef } from 'react'
import { View, Text, ScrollView, FlatList, Dimensions, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ExclamationCircleIcon, BanknotesIcon, CalendarIcon, ArchiveBoxIcon, NewspaperIcon, ArrowDownLeftIcon, ArrowUpRightIcon, ArrowsUpDownIcon, ChartBarIcon, ChartPieIcon } from 'react-native-heroicons/solid'
import useAppwrite from '../../lib/useAppwrite'
import { getUserPemasukan, getUserPengeluaran } from '../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'
import dayjs from 'dayjs'
import { PieChart } from 'react-native-chart-kit'
import { BarChart } from "react-native-gifted-charts";
import { format, parse } from 'date-fns'
import { id } from 'date-fns/locale';
import { Picker } from '@react-native-picker/picker'


const Dashboard = () => {
  const [date, setDate] = useState(dayjs());
  const { user } = useGlobalContext();
  const scrollViewRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const { data: pemasukan, refetch: refetchPemasukan } = useAppwrite(() => getUserPemasukan(user.$id));
  const { data: pengeluaran, refetch: refetchPengeluaran } = useAppwrite(() => getUserPengeluaran(user.$id));
  //Reload atau refresh
  const onRefresh = async () => {
    setRefreshing(true);
    setSelectedMonth(currentMonth);
    await refetchPemasukan();
    await refetchPengeluaran();
    setRefreshing(false);
  };
  //Tanggal dan bulan sekarang
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, '0')}`;

  //Filter bulan
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  //Format angka
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
  };

  const formatName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replaceAll(/[,\/\s:]+/g, '');
  };

  //Format data pemasukan dan pengeluaran
  const formattedPemasukan = pemasukan.map(item => ({
    id: item.$id,
    customerName: item.namapelanggan,
    amount: parseFloat(item.nominal),
    date: item.tanggalmasuk,
    type: 'pemasukan',
    bgColor: 'bg-Hijau-2',
    color: 'Hijau',
    status: item.status,
    jasa: item.jasa?.keterangan || "",
    jasaNominal: item.jasaNominal,
    jasaqty: item.jasakuantitas,
  })).sort((a, b) => new Date(b.date) - new Date(a.date));

  const formattedPengeluaran = pengeluaran.map(item => {
    return {
      id: item.$id,
      customerName: item.keterangan,
      amount: parseFloat(item.nominal),
      date: item.Tanggal,
      jenis: item.jenis.nama,
      type: 'pengeluaran',
      bgColor: 'bg-Merah-2',
      color: 'Merah',
    }
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  //Filter data yang sesuai dengan bulan
  const pemasukanCount = pemasukan.filter(item => {
    if (!selectedMonth) {
      return true;
    }
    const itemMonth = format(new Date(item.tanggalmasuk), 'yyyy-MM');
    const selectedMonthFormatted = format(new Date(selectedMonth), 'yyyy-MM');
    return itemMonth === selectedMonthFormatted;
  }).length;

  const filteredPengeluaranByMonth = formattedPengeluaran.filter((item) => {
    if (!selectedMonth) {
      return true;
    }
    const itemMonth = format(new Date(item.date), 'yyyy-MM');
    const selectedMonthFormatted = format(new Date(selectedMonth), 'yyyy-MM');
    return itemMonth === selectedMonthFormatted;
  });

  // Penjumlahan (count) jenis pengeluaran
  const totalStock = filteredPengeluaranByMonth
    .filter((item) => item.jenis === 'Stock').length;
  const totalExpenses = filteredPengeluaranByMonth
    .filter((item) => item.jenis === 'Expenses').length;

  //Gabungan data pemasukan dan pengeluaran untuk riwayat transaksi
  const allTransactions = [...formattedPemasukan, ...formattedPengeluaran];
  const sortedTransactions = allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  const formattedData = [...formattedPemasukan, ...formattedPengeluaran]
    .map(item => {
      if (!item.amount || isNaN(item.amount)) {
        console.warn(`Invalid amount for item: ${JSON.stringify(item)}`);
        return null;
      }

      return {
        ...item,
        formattedDate: format(new Date(item.date), 'MMM yy'),
      };
    }).filter(item => item !== null)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  //select bar chart keuangan bulanan
  const [selectedBar, setSelectedBar] = useState(null);

  const handleBarPress = (item, index) => {
    if (selectedBar?.index === index) {
      setSelectedBar(null);
    } else {
      setSelectedBar({
        value: item.value,
        type: item.type,
        index
      });
    }

  };

  // Format label chart
  const formatYLabel = (label) => {
    const value = parseFloat(label);

    if (isNaN(value)) return label;

    if (value >= 1_000_000) {
      return `${Math.floor(value / 1_000_000)}jt`;
    } else if (value >= 1_000) {
      return `${Math.floor(value / 1_000)}rb`;
    }

    return value.toLocaleString('id-ID');
  };

  //Render for riwayat transaksi
  const renderItem = ({ item }) => (
    <View className='my-2 flex flex-row w-full '>
      <View className={`${item.bgColor} flex w-12 h-12 rounded border border-${item.color} mr-2 items-center justify-center`}>
        {item.type === 'pemasukan' ? <ArrowDownLeftIcon color='#47E1A0' height={20} /> : <ArrowUpRightIcon color='#E14747' height={20} />}
      </View>

      <View className="flex flex-1" >
        <Text className="text-base text-Hitam-2 font-iregular">
          {item.type === 'pemasukan' ? `#INV${formatName(item.date)}` : `${item.customerName}`}
        </Text>
        <View className="flex flex-row justify-between items-center space-x-1 border-b-[0.5px] border-Hitam-4/30 ">
          <Text className="text-xs font-iregular text-Hitam-4">{formatDate(item.date)}</Text>
          <Text className={`text-base text-Hitam-2 font-imedium`}>{formatRupiah(item.amount)}</Text>
        </View>
      </View>

      <Text className="text-sm text-gray-500"></Text>
    </View>
  );
  //Mengurutkan filter bulan
  const monthsWithTransactions = Array.from(
    new Set(
      sortedTransactions.map((transaction) => {
        const date = new Date(transaction.date);
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      })
    )
  ).sort();
  //format bulan untuk ditampilkan di dropdown filter
  const formattedMonths = monthsWithTransactions.map((month) => {
    const [year, monthIndex] = month.split("-");
    const formattedMonth = monthIndex.padStart(2, "0");
    const date = new Date(year, monthIndex - 1);
    return {
      value: `${year}-${formattedMonth}`,
      label: date.toLocaleDateString("id-ID", { year: "numeric", month: "long" }),
    };
  });

  const filteredTransactions = sortedTransactions.filter((transaction) => {
    if (!selectedMonth) {
      return true;
    }
    return transaction.date.startsWith(selectedMonth);
  });

  const [totalPemasukan, totalPending] = useMemo(() => {
    if (pemasukan) {
      const filteredPemasukan = pemasukan.filter((item) => {
        if (!selectedMonth) return true;
        return (
          new Date(item.tanggalmasuk).getFullYear() === new Date(selectedMonth).getFullYear() &&
          new Date(item.tanggalmasuk).getMonth() === new Date(selectedMonth).getMonth()
        )
      });

      const totals = filteredPemasukan.reduce(
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
  }, [pemasukan, selectedMonth]);

  const totalPengeluaran = useMemo(() => {
    if (pengeluaran) {
      const filteredPengeluaran = pengeluaran.filter((item) => {
        if (!selectedMonth) return true;
        return (
          new Date(item.Tanggal).getFullYear() === new Date(selectedMonth).getFullYear() &&
          new Date(item.Tanggal).getMonth() === new Date(selectedMonth).getMonth()
        )
      });
      const totalValue = filteredPengeluaran.reduce((acc, item) => {
        return acc + Number.parseInt(item.nominal);
      }, 0)
      return totalValue;
    }
  }, [pengeluaran, selectedMonth])


  const stokTotal = formattedPengeluaran
    .filter(
      (item) => {
        if (!selectedMonth) return (item.jenis === 'Stock')
        return (
          item.jenis === 'Stock' &&
          new Date(item.date).getFullYear() === new Date(selectedMonth).getFullYear() &&
          new Date(item.date).getMonth() === new Date(selectedMonth).getMonth()
        )
      }
    )
    .reduce((acc, item) => acc + Number.parseInt(item.amount), 0);

  const expensesTotal = formattedPengeluaran
    .filter(
      (item) => {
        if (!selectedMonth) return (item.jenis === 'Expenses')
        return (
          item.jenis === 'Expenses' &&
          new Date(item.date).getFullYear() === new Date(selectedMonth).getFullYear() &&
          new Date(item.date).getMonth() === new Date(selectedMonth).getMonth()
        )
      }
    )
    .reduce((acc, item) => acc + Number.parseInt(item.amount), 0);
  //Pie chart data
  const dataChart = [
    {
      name: 'Stok : ',
      amount: stokTotal,
      color: '#6505f5',
    },
    {
      name: 'Exp : ',
      amount: expensesTotal,
      color: '#a3009b',
    },
  ];

  const filteredDataByMonth = formattedData.filter(item => {
    if (!selectedMonth) return true;

    const selectedMonthFormatted = format(new Date(selectedMonth), 'MMM yy');
    return item.formattedDate === selectedMonthFormatted;
  });

  const labels = [...new Set(formattedData.map(item => item.formattedDate))];

  const pemasukanData = labels.map(label => {
    const total = formattedData
      .filter(item => item.formattedDate === label && item.type === 'pemasukan' && item.status)
      .reduce((sum, item) => sum + parseFloat(item.amount), 0);
    return total;
  });


  const pengeluaranData = labels.map(label => {
    const total = formattedData
      .filter(item => item.formattedDate === label && item.type === 'pengeluaran')
      .reduce((sum, item) => sum + parseFloat(item.amount), 0);
    return total;
  });
  // Bulan
  const barData = labels.map((label, index) => [
    {
      value: pemasukanData[index],
      label: label,
      labelWidth: 50,
      labelTextStyle: { color: 'black' },
      spacing: 2,
      frontColor: '#47E1A0',
      type: "Pemasukan",
    },
    {
      value: pengeluaranData[index],
      frontColor: '#E14747',
      type: "Pengeluaran"
    },
  ]);

  //Harian
  const generateAllDatesInMonth = (month, year) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) =>
      String(i + 1).padStart(2, '0')
    );
  };

  const [year, month] = selectedMonth.split('-').map(Number);

  const allDatesInMonth = generateAllDatesInMonth(month, year);

  const barDataByDate = allDatesInMonth.map((date) => {
    const fullDateString = `${selectedMonth}-${date.padStart(2, '0')}`;
    const fullDate = new Date(fullDateString);

    const totalPemasukan = filteredDataByMonth
      .filter(
        (item) =>
          item.type === 'pemasukan' && item.status === true &&
          format(new Date(item.date), 'dd') === date
      )
      .reduce((sum, item) => sum + parseFloat(item.amount), 0);

    const totalPengeluaran = filteredDataByMonth
      .filter(
        (item) =>
          item.type === 'pengeluaran' &&
          format(new Date(item.date), 'dd') === date
      )
      .reduce((sum, item) => sum + parseFloat(item.amount), 0);

    return [
      {
        value: totalPemasukan,
        label: date,
        fullDate,
        dayName: format(fullDate, 'EEEE', { locale: id }),
        formattedDate: format(fullDate, 'dd MMMM yyyy', { locale: id }),
        labelWidth: 20,
        labelTextStyle: { color: 'black' },
        spacing: 1,
        frontColor: '#47E1A0',
        type: 'pemasukan',
      },
      {
        value: totalPengeluaran,
        frontColor: '#E14747',
        fullDate,
        dayName: format(fullDate, 'EEEE', { locale: id }),
        formattedDate: format(fullDate, 'dd MMMM yyyy', { locale: id }),
        type: 'pengeluaran',
      },
    ];
  });

  const flatbarTransaksi = barDataByDate.flat();

  //Bar harian
  const [selectedHari, setSelectedHari] = useState(null);

  const handleHariPress = (item, index) => {
    if (selectedHari?.index === index) {
      setSelectedHari(null);
    } else {
      setSelectedHari({
        value: item.value,
        day: item.dayName,
        date: item.formattedDate,
        index: index,
      });
    }
  };

  //Jasa chart
  const [selectedJasa, setSelectedJasa] = useState(null);
  const handleJasaPress = (item, index) => {
    if (selectedJasa?.index === index) {
      setSelectedJasa(null);
    } else {
      setSelectedJasa({
        index,
        value: item.value,
      });
    }
  };

  const dataLunas = formattedPemasukan.filter(item => {
    const itemDate = new Date(item.date);
    const itemMonth = itemDate.toISOString().slice(0, 7); // format: 'yyyy-MM'

    return item.status === true && itemMonth === selectedMonth;
  }
  );
  const jasaMap = {};

  dataLunas.forEach(item => {
    const namaJasa = item.jasa;
    if (!namaJasa) return;
    if (jasaMap[namaJasa]) {
      jasaMap[namaJasa] += 1;
    } else {
      jasaMap[namaJasa] = 1;
    }
  });

  const jasaChartData = Object.entries(jasaMap).map(([nama, qty]) => ({
    label: nama,
    value: Number(qty),
    frontColor: '#80AAFA',
  }));

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = (screenWidth * (barDataByDate.length / 31)) - 100;
  const flatBarData = barData.flatMap(monthData => monthData).flat();
  const maxValue = Math.max(...flatBarData.map(item => item.value));
  const maxValue2 = Math.max(...flatbarTransaksi.map(item => item.value));
  const maxValueJasa = Math.max(...jasaChartData.map(item => item.value));
  return (
    <SafeAreaView className="flex-1 bg-white h-full">
      <View className="bg-Primary w-full h-20 px-4">
        <View className="flex-row items-center">
          <CalendarIcon color='#fff' height={16} />
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(value) => {
              setSelectedMonth(value);
            }}
            style={{ height: 50, width: (screenWidth - 48), color: 'white' }}
            dropdownIconColor={'white'}
          >
            <Picker.Item label="Pilih bulan" value={null} />
            {formattedMonths.map((month) => (
              <Picker.Item key={month.value} label={month.label} value={month.value} />
            ))}
          </Picker>
        </View>

      </View>
      <View className="flex-1 w-full h-full px-6 py-6 bg-white rounded-t-xl mt-[-30px]">
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
          <View className='flex flex-row justify-between gap-4 mb-2'>

            <View className="flex-1 bg-Hijau-2/20 border-solid border-Hijau border-2 rounded-lg py-1 px-4 gap-1">
              <View className="flex flex-row items-center justify-between">
                <Text className="text-Hijau font-iregular text-sm">Pemasukan</Text>
                <ArrowDownLeftIcon color='#47E1A0' height={16} />
              </View>
              <Text className="text-Hijau text-sm font-ibold mb-2">{formatRupiah(totalPemasukan)}</Text>
            </View>
            <View className="flex-1 bg-Merah-2/20 border-solid border-Merah border-2 rounded-lg px-4 py-1 gap-1">
              <View className="flex flex-row items-center justify-between">
                <Text className="text-Merah font-iregular text-sm">Pengeluaran</Text>
                <ArrowUpRightIcon color='#E14747' height={16} />
              </View>
              <Text className="text-Merah text-sm font-ibold mb-2">{formatRupiah(totalPengeluaran)}</Text>
            </View>

          </View>
          <View className="w-full flex flex-row space-x-2 mb-4">
            <View className="flex-1 flex-row items-center bg-Secondary-2/20 border-Secondary p-2 rounded border">
              <ExclamationCircleIcon color='#F6DD01' height={16} />
              <Text className="text-sm font-bold text-gray-500">{formatRupiah(totalPending)}</Text>
            </View>
            <View className="flex flex-row items-center bg-slate-100 border-slate-600 p-2 rounded border">
              <NewspaperIcon color='#475569' height={16} />
              <Text className="text-xs font-isemibold text-Hitam-1">{pemasukanCount}</Text>
            </View>
            <View className="flex flex-row items-center bg-slate-100 border-slate-600 p-2 rounded border">
              <ArchiveBoxIcon color='#475569' height={16} />
              <Text className="text-xs font-isemibold text-Hitam-1">{totalStock}</Text>
            </View>
            <View className="flex flex-row items-center bg-slate-100 border-slate-600 p-2 rounded border">
              <BanknotesIcon color='#475569' height={16} />
              <Text className="text-xs font-isemibold text-Hitam-1">{totalExpenses}</Text>
            </View>
          </View>

          {/* Chart Harian */}
          <View className="flex">
            <View className="flex flex-row items-center">
              <Text className="text-Hitam-2 text-base font-isemibold">
                Chart Transaksi Harian
              </Text>
              <ChartBarIcon color="#333" height={16} strokeWidth={2} />
            </View>
            {selectedMonth ? (

              <View className="mt-2 mb-8 bg-slate-100 px-2 py-4 rounded">
                <BarChart
                  data={flatbarTransaksi}
                  width={chartWidth}
                  height={200}
                  barWidth={20}
                  spacing={4}
                  initialSpacing={12}
                  xAxisThickness={1}
                  yAxisThickness={1}
                  yAxisTextStyle={{ color: 'black' }}
                  yAxisColor={'blue'}
                  xAxisColor={'blue'}
                  noOfSections={3}
                  yAxisLabelWidth={32}
                  formatYLabel={formatYLabel}
                  maxValue={maxValue2}
                  onPress={handleHariPress}
                />
              </View>
            ) : (
              <View className="mt-2 mb-8 bg-slate-100 px-2 py-4 rounded">
                <Text className="text-center text-sm font-imedium text-Hitam-4">Pilih bulan untuk melihat chart harian</Text>
              </View>
            )}
            {selectedHari && (
              <View
                style={{
                  position: 'absolute',
                  left: 20 + selectedHari.index * 22,
                  top: 240,
                  alignItems: 'center',
                }}
                className="px-2 py-1 bg-white border border-Hitam-4 text-Hitam-2 font-isemibold rounded"
              >
                <Text className="text-xs text-Hitam-2 mt-1">{selectedHari.day}</Text>
                <Text className="text-xs text-Hitam-3">{selectedHari.date}</Text>
                <Text className="text-Hitam-2 font-isemibold">
                  {selectedHari.value.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  })}
                </Text>

              </View>
            )}

            <View className="flex flex-row items-center mb-2">
              <Text className="text-Hitam-2 text-base font-isemibold">
                Detail Pengeluaran
              </Text>
              <ChartPieIcon color="#333" height={16} />
            </View>
            {/* Chart Pengeluaran */}

            <PieChart
              data={dataChart}
              width={screenWidth}
              height={240}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="#f1f5f9"
              borderRadius="20"
              hasLegend={false}
              center={[70, 5]}
              absolute
            />
            <View className="flex flex-row justify-around w-full space-x-1">
              {dataChart.map((item, index) => (
                <View key={index}
                  className="flex-1 flex-row items-center justify-center border border-solid py-1 rounded"
                  style={{ borderColor: item.color }}
                >
                  <View>
                    {item.name === "Stok : " ? <ArchiveBoxIcon color='#6505f5' height={12} /> : <BanknotesIcon color='#a3009b' height={12} />}</View>
                  <Text className="text-xs font-isemibold">{item.name}</Text>
                  <Text className="text-xs font-isemibold">{formatRupiah(item.amount)}</Text>
                </View>
              ))}
            </View>
            <View className="flex flex-row items-center mt-8">
              <Text className="text-Hitam-2 text-base font-isemibold">
                Chart Penggunaan Jasa
              </Text>
              <ChartBarIcon color="#333" height={16} strokeWidth={2} />
            </View>
            <View className="mt-2 mb-8 bg-slate-100 px-2 py-4 rounded">
              <BarChart
                data={jasaChartData}
                barWidth={50}
                spacing={30}
                xAxisLabelTextStyle={{ color: 'black' }}
                formatYLabel={formatYLabel}
                noOfSections={4}
                yAxisLabelWidth={32}
                maxValue={maxValueJasa}
                onPress={handleJasaPress}
              />
              {selectedJasa && (
                <View
                  style={{
                    position: 'absolute',
                    left: 70 + selectedJasa.index * 80,
                    top: 220,
                  }}
                  className="items-center p-1 bg-white border border-Hitam-4 text-Hitam-2 font-isemibold rounded"
                >
                  <Text className="text-Hitam-2 font-isemibold">
                    Jumlah = {selectedJasa.value}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex flex-row items-center">
              <Text className="text-Hitam-2 text-base font-isemibold">
                Chart Keuangan
              </Text>
              <ChartBarIcon color="#333" height={16} strokeWidth={2} />
            </View>
            {/* Chart Keuangan */}
            <View className="mt-2 mb-8 bg-slate-100 px-2 py-4 rounded">
              <BarChart
                data={flatBarData}
                width={chartWidth}
                height={200}
                barWidth={20}
                spacing={24}
                hideRules
                xAxisThickness={1}
                yAxisThickness={1}
                yAxisTextStyle={{ color: 'black' }}
                yAxisColor={'blue'}
                xAxisColor={'blue'}
                noOfSections={3}
                maxValue={maxValue}
                formatYLabel={formatYLabel}
                yAxisLabelWidth={50}
                onPress={handleBarPress}
              />
              {selectedBar && (
                <View
                  style={{
                    position: 'absolute',
                    left: 70 + selectedBar.index * 30,
                    top: 220,
                  }}
                  className="items-center p-1 bg-white border border-Hitam-4 text-Hitam-2 font-isemibold rounded"
                >
                  <Text className="text-xs text-Hitam-2 mt-1">{selectedBar.type}</Text>
                  <Text className="text-Hitam-2 font-isemibold">
                    {selectedBar.value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                  </Text>
                </View>
              )}
            </View>
          </View>



          {/* Riwayat */}
          <View className="flex flex-row items-center">
            <Text className="text-Hitam-2 text-base font-isemibold">
              Riwayat Transaksi
            </Text>
            <ArrowsUpDownIcon color="#333" height={16} />
            {/* FlatList Riwayat */}
          </View>
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <View className="mt-2 bg-slate-50 w-full h-20 border-[0.5px] border-Hitam-4/10 rounded justify-center">

                <Text className="text-center text-sm font-imedium text-Hitam-4">Belum ada transaksi</Text>
              </View>
            }
          />
        </ScrollView>
      </View>


    </SafeAreaView>
  )
}

export default Dashboard