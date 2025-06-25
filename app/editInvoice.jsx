import { View, Text, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import FormField from '../components/FormField'
import PrimaryButton from '../components/PrimaryButton'
import useAppwrite from '../lib/useAppwrite'
import { useGlobalContext } from '../context/GlobalProvider'
import {  ArrowLeftCircleIcon, XCircleIcon, PlusCircleIcon, MinusCircleIcon} from 'react-native-heroicons/solid'
import { createHarga, getJasa, getHarga, getUserPemasukan, updatePemasukan } from '../lib/appwrite'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { getDetailItem } from '../app/tempStorage';

const EditInvoice = () => {
    const item = getDetailItem();
    const { user } = useGlobalContext();
    const { data: jasa, refetch: refetchJasa } = useAppwrite(() => getJasa(user.$id));
    const { data: harga, refetch: refetchHarga } = useAppwrite(() => getHarga(user.$id));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [date, setDate] = useState(new Date(item?.date || Date.now()));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isChecked, setIsChecked] = useState(item.status === true);
    const [form, setForm] = useState({
        date: item.date,
        namapelangan: item.customerName,
        nomorhp: item.nomorhp,
        alamatpelanggan: item.alamat,
        jasakuantitas: item.jasaqty,
    })

    // useEffect(() => {
    //     if(harga && item.pakaian) {
            
    //         setSelectedPakaian(item.pakaian.map(pakaianItem => pakaianItem.$id))
    //         const newItemCounts = {};
    //         item.pakaian.forEach((pakaianItem, index) => {
    //             newItemCounts[pakaianItem.$id] = item.pakaianqty[index];
    //         });
    //         setItemCounts(newItemCounts);
    //     }
    //     if (jasa && item.jasa) {
            
    //         const foundJasa = jasa.find(j => j.keterangan === item.jasa);
    //         if (foundJasa) {
    //           setSelectedHarga(foundJasa.$id);
    //         }
    //       }
    // }, [jasa, item.jasa, item.pakaian, item.pakaianqty]);
    //const selectedItems = harga?.filter(pakaianItem => selectedPakaian.includes(pakaianItem.$id));
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'});
    };
    const dateValue = form.date instanceof Date ? form.date : new Date(form.date);
    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR' 
        }).format(amount);
      };
    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || date; 
        setForm({ ...form, date: currentDate });
        setDate(currentDate);
        setShowDatePicker(false);
    };

    const showDatePickerHandler = () => {
        setShowDatePicker(true);
    };

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
      };

    const handleModal = () => {
        setIsModalVisible(true);
      };
    
    const closeModal = () => {
        setIsModalVisible(false);
    };
    // const calculateTotal = () => {
    
      
    //     return selectedItems.reduce((total, item) => {
    //       const count = Number(itemCounts[item.$id]) || 0;
    //       const nominal = Number(item.nominal) || 0;
      
    //       return total + (count * nominal);
    //     }, 0);
    //   };

    //   const totalAmount = calculateTotal();
    
    // const getLabelForSelectedHarga = () => {
    //     const selectedJasa = jasa?.find(jasaItem => jasaItem.$id === selectedHarga);
    //     if (selectedJasa && selectedJasa.keterangan.includes("Koin")) {
    //         return "/Koin";
    //     }
    //     return "/Kg";
    // };
    //const jasaNominal = jasa?.find(item => item.$id === selectedHarga)?.nominal;
    //const totalnominal = (form.jasakuantitas * jasaNominal)+totalAmount || 0;

    // const handleCheckboxToggle = (id) => {
    //     setSelectedPakaian((prevSelected) => {
    //         if (prevSelected.includes(id)) {
    //           return prevSelected.filter((selectedId) => selectedId !== id);
    //         } else {
    //           return [...prevSelected, id];
    //         }
    //       });
    //     };

   
    // const incrementCount = (id) => {
    //     setItemCounts(prevCounts => ({
    //         ...prevCounts,
    //         [id]: (prevCounts[id] || 0) + 1,
    //     }));
    // };
        
    // const decrementCount = (id) => {
    //     setItemCounts(prevCounts => {
    //         const updatedCounts = {
    //             ...prevCounts,
    //             [id]: Math.max(0, (prevCounts[id] || 0) - 1),
    //         };
        
    //         // If the count is zero, remove the item from selectedPakaian
    //         if (updatedCounts[id] === 0) {
    //             setSelectedPakaian(prevSelected => prevSelected.filter(itemId => itemId !== id));
    //         }
        
    //         return updatedCounts;
    //         });
    //     };

    const jasaQty = Number.parseInt(item.jasaqty);
    const jasaN = Number.parseInt(item.jasaNominal);
    const totalJasaHarga = jasaQty * jasaN;


    const submit = async () => {
        setIsSubmitting(true)

        try {
            await updatePemasukan(
                item.id,
                date,
                form.namapelangan,
                form.nomorhp,
                form.alamatpelanggan,
                isChecked,
            )
            Alert.alert('Success', 'Pemasukan berhasil diupdate');
            router.replace('/invoice')
        } catch (error) {
            Alert.alert('Error', error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <SafeAreaView className="bg-white h-full px-8 py-4">
           <View className="flex flex-row items-center justify-between mb-8">
                <TouchableOpacity
                    onPress={router.back}
                >
                    <ArrowLeftCircleIcon color="#777" width={32} height={32} />  
                </TouchableOpacity>
                <Text className="text-2xl text-Hitam font-isemibold">
                    Edit Invoice
                </Text>
                <TouchableOpacity
                    className=""
                    onPress={submit}
                >
                    <Text className="text-Primary text-base font-imedium">Simpan</Text>
                </TouchableOpacity>
            </View>
            
            <View className="h-[90%] pb-4">
                <View className="bg-Secondary-2/50 w-full h-18 border-Secondary border-[0.5px] rounded p-2 mb-4">
                    <Text className="text-sm text-Hitam-2 font-isemibold">NOTE</Text>
                    <Text className="text-xs text-Hitam font-iregular">• Edit invoice hanya untuk data pelanggan dan status pembayaran, untuk pilihan jasa/pakaian tidak bisa dirubah.</Text>
                </View>
                <ScrollView>
                <Text className="text-sm text-Hitam-2 font-isemibold">Tanggal</Text>
                    <TouchableOpacity onPress={showDatePickerHandler} className="border-[1px] flex-row border-Hitam-4 w-full h-10 px-4 bg-white rounded focus:border-Primary focus:border-2 items-center">
                        <Text className="text-black text-lg">
                        {formatDate(form.date)} 
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={dateValue}
                            mode="date"
                            is24Hour="true"
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}
                <FormField
                    title="Nama Pelanggan"
                    value={form.namapelangan}
                    handleChangeText={(e) => setForm({ ...form, namapelangan: e})}
                    otherStyles="mt-2"
                />
                <FormField
                    title="Nomor Hp"
                    value={form.nomorhp}
                    handleChangeText={(e) => setForm({ ...form, nomorhp: e})}
                    otherStyles="mt-2"
                />
                <FormField
                    title="Alamat Pelanggan"
                    value={form.alamatpelanggan}
                    handleChangeText={(e) => setForm({ ...form, alamatpelanggan: e})}
                    otherStyles="mt-2"
                    theOtherStyles="h-14"
                />
                {/* <View className="w-full space-x-2 flex flex-row mt-3 items-center">
                <View className="flex-1 mr-2">
                    <Text className="text-sm text-Hitam-2 font-isemibold">Jasa</Text>
                    <View className="border-[1px] flex-row border-Hitam-4 h-10  bg-white rounded focus:border-Primary focus:border-2 items-center">
                        <Picker
                            selectedValue={selectedHarga}
                            onValueChange={(itemValue) => setSelectedHarga(itemValue)}
                            style={{ height: 150, width: '100%' }}
                        >
                            {jasa?.map((item) => (
                            <Picker.Item key={item.$id} label={`${item.keterangan} - ${formatRupiah(item.nominal)}`} value={item.$id} />
                            ))}
                        </Picker>
                    </View>
                    
                </View>
                
                <FormField
                    title="Qty"
                    value={form.jasakuantitas}
                    handleChangeText={(e) => setForm({ ...form, jasakuantitas: e})}
                    otherStyles="w-20 mt-[-4px]"
                />
                { selectedHarga && (
                    <Text className="mt-4 font-ibold text-base">{getLabelForSelectedHarga()}</Text>
                )}
                </View>
                <Text className="text-sm text-Hitam-2 font-isemibold mt-2">Pakaian</Text>
        
                    <View>
                    
                    {selectedItems && selectedItems.length > 0 ? (
                        selectedItems.map((item) => (
                        <View key={item.$id} className="flex-row p-2">
                            <View className="flex-1 w-full">
                                <Text className="text-base font-isemibold text-Hitam-2">{item.keterangan}</Text>
                                <Text className="text-sm font-isemibold text-Hitam-3">{item.nominal}</Text>
                            </View>
                            
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={()=> decrementCount(item.$id)}
                                >
                                    <MinusCircleIcon color="#777" width={24} height={24} /> 
                                </TouchableOpacity>
                                <Text className="w-10 text-center text-lg font-isemibold">{itemCounts[item.$id]}</Text>
                                <TouchableOpacity
                                    onPress={()=> incrementCount(item.$id)}
                                >
                                    <PlusCircleIcon color="#777" width={24} height={24} /> 
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                        ) : (
                            <View className="mt-2 bg-slate-50 w-full h-20 border-[0.5px] border-Hitam-4/10 rounded justify-center">
                                <Text className="text-center text-sm font-imedium text-Hitam-4">Belum ada pakaian terpilih</Text>
                            </View>
                        )}
                    </View>
                    <PrimaryButton 
                    title= 'Tambah Pakaian'
                    handlePress= {handleModal}
                    containerStyles='w-full bg-white border-solid border-2 border-Primary'
                    textStyle='text-sm text-Primary font-isemibold'
                    /> */}
                    <View className="bg-slate-200 p-8 rounded mt-8">

                    { item.jasa && (
                            <View>
                                <Text className="text-sm font-isemibold">{item.jasa}</Text>
                                <View className="flex flex-row justify-between items-end space-x-1">
                                    <Text className="text-xs font-iregular">{item.jasaqty} {item.jasa === "Koin" ? "Koin" : "Kg"} x @{item.jasaNominal}</Text>
                                    <View className="flex-1 border-Hitam-4 border-b-[1px] border-dashed mb-1"></View>
                                    <Text className="text-sm font-isemibold">{formatRupiah(totalJasaHarga)}</Text>
                                </View>
                            </View>
                        )}
                        {item.pakaian.map((pakaianItem,index) => (
                        <View key={index} className="mt-2">
                            <Text className="text-sm font-isemibold">{pakaianItem.keterangan}</Text>
                            <View className="flex flex-row justify-between items-end space-x-1">
                                <Text className="text-xs font-iregular">{item.pakaianqty[index]} Qty x @{item.pakaianNominal[index]}</Text>
                                <View className="flex-1 border-Hitam-4 border-b-[1px] border-dashed mb-1"></View>
                                <Text className="text-sm font-isemibold">{formatRupiah(Number.parseInt(item.pakaianNominal[index])*Number.parseInt(item.pakaianqty[index]))}</Text>
                            </View>
                        </View> 
                        ))}
                    </View>
                    {/* Modal Pakaian */}
                    <Modal
                        visible={isModalVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={closeModal} // For Android back button
                    >
                        <View className="flex-1 justify-start items-center bg-black/50">
                            <View className="bg-white p-6 w-[80%] h-[80%] rounded-md mt-10">
                                <View className="flex-row">
                                    <Text className="flex-1 text-lg text-Hitam-2 font-ibold text-center mb-2">Pakaian</Text>
                                    <TouchableOpacity onPress={closeModal}>
                                        <XCircleIcon color="#777" width={32} height={32} />
                                    </TouchableOpacity>
                                </View>
                                {/* Display Pakaian */}
                                <View className="flex">
                                    {harga.map((item, index) => (
                                    <View key={index} className="w-full flex-row p-1">
                                        {/* <BouncyCheckbox
                                            isChecked={selectedPakaian.includes(item.$id)}
                                            onPress={() => handleCheckboxToggle(item.$id)}
                                            fillColor="blue"
                                            unfillColor="#FFFFFF"
                                        
                                        /> */}
                                        <Text className="text-base font-isemibold text-Hitam-2">{item.keterangan} - {item.nominal}</Text>
                                    </View>
                                    ))}
                                </View>
                                <View className="absolute bottom-0 right-0 left-0 p-4">
                                    <PrimaryButton 
                                        title= 'Tambah ke invoice'
                                        handlePress= {closeModal}
                                        containerStyles='mb-4'
                                        textStyle='text-sm text-white font-isemibold'
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <Text className="text-sm text-Hitam-2 font-isemibold mt-8 mb-2">Status</Text>
                    <View className="flex-row">

                        <BouncyCheckbox
                            isChecked={isChecked} 
                            onPress={handleCheckboxChange}
                            fillColor="blue"
                            unfillColor="#FFFFFF"
                        />
                        <Text className="text-base font-isemibold text-Hitam-2">LUNAS</Text>
                    </View>
                </ScrollView>
            </View>
            <View className="absolute bottom-0 left-0 right-0 bg-Primary-2 px-8 py-2 items-end justify-center">
                <Text className="text-lg text-white font-isemibold">TOTAL = {formatRupiah(item.amount)}</Text>
            </View>
        </SafeAreaView>
    );
}


export default EditInvoice;
