import { View, Text, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import FormField from '../components/FormField'
import PrimaryButton from '../components/PrimaryButton'
import useAppwrite from '../lib/useAppwrite'
import { useGlobalContext } from '../context/GlobalProvider'
import {  ArrowLeftCircleIcon, XCircleIcon, PlusCircleIcon, MinusCircleIcon} from 'react-native-heroicons/solid'
import { createPemasukan, getJasa, getHarga } from '../lib/appwrite'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import BouncyCheckbox from 'react-native-bouncy-checkbox';

const CreateInvoice = () => {
    const { user } = useGlobalContext();
    const { data: jasa, refetch: refetchJasa } = useAppwrite(() => getJasa(user.$id));
    const { data: harga, refetch: refetchHarga } = useAppwrite(() => getHarga(user.$id));
    const [selectedHarga, setSelectedHarga] = useState('');
    const [selectedPakaian, setSelectedPakaian] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [itemCounts, setItemCounts] = useState({});
    const [form, setForm] = useState({
        tanggal: '',
        namapelangan: '',
        nomorhp: '',
        alamatpelanggan: '',
        jasakuantitas: '',
        })

    useEffect(() => {
        const initialCounts = {};
        selectedItems.forEach(item => {
            if (!initialCounts[item.$id]) {
            initialCounts[item.$id] = 1;
            }
        });
        setItemCounts(initialCounts);
    }, [selectedPakaian]);
    const handleCheckboxToggle = (id) => {
        setSelectedPakaian((prevSelected) => {
            if (prevSelected.includes(id)) {
              return prevSelected.filter((selectedId) => selectedId !== id);
            } else {
              return [...prevSelected, id];
            }
          });
        };

    const handleCheckboxChange = () => {
        setIsChecked(prevState => !prevState);
        };

    const selectedItems = harga?.filter(pakaianItem => selectedPakaian.includes(pakaianItem.$id));

    const incrementCount = (id) => {
    setItemCounts(prevCounts => ({
        ...prevCounts,
        [id]: (prevCounts[id] || 0) + 1,
    }));
    };
    
    const decrementCount = (id) => {
        setItemCounts(prevCounts => {
            const updatedCounts = {
              ...prevCounts,
              [id]: Math.max(0, (prevCounts[id] || 0) - 1),
            };
    
            if (updatedCounts[id] === 0) {
              setSelectedPakaian(prevSelected => prevSelected.filter(itemId => itemId !== id));
            }
      
            return updatedCounts;
          });
      };

    const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
        const count = itemCounts[item.$id] || 0;
        const nominal = item.nominal || 0;
        return total + (count * nominal);
    }, 0);
    };

    const totalPakaian = calculateTotal();

    const getLabelForSelectedHarga = () => {
        const selectedJasa = jasa?.find(jasaItem => jasaItem.$id === selectedHarga);
        if (selectedJasa && selectedJasa.keterangan.includes("Koin")) {
            return "/Koin";
        }
        return "/Kg";
    };
    const jasaNominal = jasa?.find(item => item.$id === selectedHarga)?.nominal || '0';
    const total = parseInt((form.jasakuantitas * jasaNominal) + totalPakaian) || '0';
    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR' 
        }).format(amount);
      };

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
        setDate(selectedDate); 
        }
    };
    
    const showDatePickerHandler = () => {
        setShowDatePicker(true);
    };

    const handleModal = () => {
        setIsModalVisible(true);
      };
    
    const closeModal = () => {
        setIsModalVisible(false);
    };
    const countsArray =  Object.values(itemCounts).map(String);

    const submit = async () => {
        if(!form.namapelangan || !form.nomorhp || !form.alamatpelanggan) {
            Alert.alert('Error', 'Tolong isi semua data')
            return; 
        }

        setIsSubmitting(true)
        const userId = user.$id;
        const totalNominal = String(total);
        const pakaianNominal = selectedItems.map((item) => item.nominal || 0);
        try {
            await createPemasukan(
                date,
                form.namapelangan,
                form.nomorhp,
                form.alamatpelanggan,
                userId,
                selectedHarga,
                totalNominal,
                form.jasakuantitas,
                selectedPakaian,
                isChecked,
                countsArray,
                jasaNominal,
                pakaianNominal
            )
            Alert.alert('Success', 'Pemasukan berhasil dibuat');
            router.replace('/invoice')
        } catch (error) {
            Alert.alert('Error', error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <SafeAreaView className="bg-white h-full p-4">
            <View className="flex flex-row items-center justify-between mb-12">
                <TouchableOpacity
                    onPress={router.back}
                >
                    <ArrowLeftCircleIcon color="#777" width={32} height={32} />  
                </TouchableOpacity>
                <Text className="text-2xl text-Hitam font-isemibold">
                    Invoice Baru
                </Text>
                <TouchableOpacity
                    className=""
                    onPress={submit}
                >
                    <Text className="text-Primary text-base font-imedium">Simpan </Text>
                </TouchableOpacity>
            </View>
            <View className="h-[80%] pb-4">
            <ScrollView>
            <Text className="text-sm text-Hitam-2 font-isemibold mt-2">Tanggal</Text>
                <TouchableOpacity onPress={showDatePickerHandler} className="border-[1px] flex-row border-Hitam-4 w-full h-10 px-4 bg-white rounded focus:border-Primary focus:border-2 items-center">
                    <Text className="text-black text-lg">
                        {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'})} 
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
                title="Nama Pelanggan"
                value={form.namapelangan}
                handleChangeText={(e) => setForm({ ...form, namapelangan: e})}
                otherStyles="mt-2"
                placeholder="Masukan nama pelanggan"
            />
            <FormField
                title="Nomor Hp"
                value={form.nomorhp}
                handleChangeText={(e) => setForm({ ...form, nomorhp: e})}
                otherStyles="mt-2"
                placeholder="Masukan nomor hp pelanggan"
            />
            <FormField
                title="Alamat Pelanggan"
                value={form.alamatpelanggan}
                handleChangeText={(e) => setForm({ ...form, alamatpelanggan: e})}
                otherStyles="mt-2"
                theOtherStyles="h-14"
                placeholder="Masukan alamat pelanggan"
            />
            <View className="w-full space-x-2 flex flex-row mt-3 items-center">
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
                    placeholder="QTY"
                />
                { selectedHarga && (
                    <Text className="mt-4 font-ibold text-base">{getLabelForSelectedHarga()}</Text>
                )}
            </View>
            <Text className="text-sm text-Hitam-2 font-isemibold mt-2">Pakaian</Text>
            {/* Showing Selected Pakaian */}
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
            />
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
                        {/* Display Pakaiaj */}
                        <View className="flex">
                            {harga.map((item, index) => (
                            <View key={index} className="w-full flex-row p-1">
                                <BouncyCheckbox
                                    isChecked={selectedPakaian.includes(item.$id)}
                                    onPress={() => handleCheckboxToggle(item.$id)}
                                    fillColor="blue"
                                    unfillColor="#FFFFFF"
                                   
                                />
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

            <Text className="text-sm text-Hitam-2 font-isemibold mt-2 mb-4">Status</Text>
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
                <Text className="text-lg text-white font-isemibold">TOTAL = {formatRupiah(total)}</Text>
            </View>
        </SafeAreaView>
    );
}

export default CreateInvoice;
